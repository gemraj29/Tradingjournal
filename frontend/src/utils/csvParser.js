/**
 * Fidelity CSV parser — handles options, stocks, futures.
 * Fidelity CSVs have preamble lines before the real header row.
 */

export function parseFidelityCSV(text) {
  const lines = text.split('\n').map(l => l.trim()).filter(Boolean)

  // Find header row (contains "Run Date" and "Symbol")
  let headerIdx = lines.findIndex(l => l.includes('Run Date') && l.includes('Symbol'))
  if (headerIdx === -1) {
    // Try generic format: Date, Symbol, Action, Quantity, Price, Amount
    headerIdx = lines.findIndex(l =>
      (l.toLowerCase().includes('date') && l.toLowerCase().includes('symbol')) ||
      (l.toLowerCase().includes('date') && l.toLowerCase().includes('action'))
    )
  }
  if (headerIdx === -1) throw new Error('Could not find CSV header row. Expected Fidelity format with "Run Date" and "Symbol" columns.')

  const headers = parseCSVLine(lines[headerIdx]).map(h => h.trim().replace(/"/g, ''))
  const trades = []

  for (let i = headerIdx + 1; i < lines.length; i++) {
    const row = parseCSVLine(lines[i])
    if (row.length < 3) continue

    const obj = {}
    headers.forEach((h, idx) => { obj[h] = (row[idx] || '').trim().replace(/"/g, '') })

    const trade = parseTradeRow(obj)
    if (trade) trades.push(trade)
  }

  return trades
}

function parseCSVLine(line) {
  const result = []
  let current = ''
  let inQuotes = false
  for (let i = 0; i < line.length; i++) {
    const ch = line[i]
    if (ch === '"') { inQuotes = !inQuotes }
    else if (ch === ',' && !inQuotes) { result.push(current); current = '' }
    else { current += ch }
  }
  result.push(current)
  return result
}

function parseTradeRow(obj) {
  // Fidelity column names
  const runDate   = obj['Run Date']  || obj['Date']      || obj['Settlement Date'] || ''
  const action    = obj['Action']    || obj['Type']       || ''
  const symbol    = obj['Symbol']    || obj['Ticker']     || ''
  const desc      = obj['Description'] || obj['Security Name'] || ''
  const qtyStr    = obj['Quantity']  || obj['Qty']                        || '0'
  const priceStr  = obj['Price ($)'] || obj['Price']     || obj['Unit Price ($)'] || obj['Unit Price'] || '0'
  const amountStr = obj['Amount ($)']|| obj['Amount']    || obj['Net Amount ($)'] || obj['Net Amount'] || '0'
  const acct      = obj['Account']   || obj['Account Number'] || 'default'

  if (!symbol || !action) return null

  const actionUp = action.toUpperCase()
  let tradeType = null
  if (actionUp.includes('BOUGHT') || actionUp.includes('BUY') || actionUp.includes('PURCHASE')) tradeType = 'BUY'
  else if (actionUp.includes('SOLD') || actionUp.includes('SELL') || actionUp.includes('SALE')) tradeType = 'SELL'
  else if (actionUp.includes('ROLL')) tradeType = 'ROLL'
  else if (actionUp.includes('EXERCISE') || actionUp.includes('ASSIGN')) tradeType = 'EXERCISE'
  else return null   // skip dividends, transfers, etc.

  const quantity = parseFloat(qtyStr.replace(/[,$]/g, '')) || 0
  const price    = parseFloat(priceStr.replace(/[,$]/g, '')) || 0
  const amount   = parseFloat(amountStr.replace(/[,$]/g, '')) || 0

  // Parse date – MM/DD/YYYY or YYYY-MM-DD
  let date = null
  if (runDate.match(/\d{1,2}\/\d{1,2}\/\d{4}/)) {
    const [m, d, y] = runDate.split('/')
    date = `${y}-${m.padStart(2,'0')}-${d.padStart(2,'0')}`
  } else if (runDate.match(/\d{4}-\d{2}-\d{2}/)) {
    date = runDate.substring(0, 10)
  } else {
    return null
  }

  // Determine instrument type from symbol
  const instrType = detectInstrumentType(symbol, desc)

  // Compute P&L contribution: positive amount = received cash (SELL), negative = paid cash (BUY)
  // For P&L we'll compute at position level later; raw_amount helps
  const rawAmount = amount || (tradeType === 'BUY' ? -(Math.abs(quantity) * price) : Math.abs(quantity) * price)

  return {
    id: crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random()}`,
    symbol: symbol.trim(),
    description: desc,
    tradeType,
    instrumentType: instrType,
    quantity: Math.abs(quantity),
    price,
    amount: rawAmount,
    date,
    account: acct,
    profitLoss: 0,   // computed later at position level
    tags: [],
    notes: '',
    rawAction: action,
  }
}

function detectInstrumentType(symbol, desc) {
  // Options: OCC symbol format – letters + 6-digit date + C/P + strike
  // e.g. AAPL240315C00175000  or  AAPL 240315C00175000
  const optPattern = /[A-Z]{1,6}\s*\d{6}[CP]\d+/
  if (optPattern.test(symbol)) return 'OPTION'

  // Futures: /ES, /NQ, /CL, /GC, /ZB, /MES, etc.
  if (/^\/[A-Z]{2,4}\d{0,2}$/.test(symbol) || symbol.startsWith('/')) return 'FUTURE'

  const d = desc.toUpperCase()
  if (d.includes('CALL') || d.includes('PUT') || d.includes('OPTION')) return 'OPTION'
  if (d.includes('FUTURE') || d.includes('E-MINI') || d.includes('MICRO')) return 'FUTURE'

  return 'STOCK'
}

/**
 * Compute P&L per closed position (FIFO matching of BUY/SELL pairs).
 * Also detects rolls (SELL near expiry + BUY of later expiry on same underlying).
 */
export function computePositions(trades) {
  // Group trades by underlying ticker (options stripped to root symbol)
  const groups = {}
  for (const t of trades) {
    const key = getUnderlying(t.symbol)
    if (!groups[key]) groups[key] = []
    groups[key].push({ ...t })
  }

  const positions = []

  for (const [underlying, tradList] of Object.entries(groups)) {
    const sorted = [...tradList].sort((a, b) => a.date.localeCompare(b.date))

    // Each full symbol (e.g. each option contract) is its own position
    const bySymbol = {}
    for (const t of sorted) {
      if (!bySymbol[t.symbol]) bySymbol[t.symbol] = []
      bySymbol[t.symbol].push(t)
    }

    for (const [sym, symTrades] of Object.entries(bySymbol)) {
      // openLots: { qty, origQty, price, amount, date, id }
      // origQty stored so we can prorate the lot's original amount on partial fills
      let openLots = []
      let totalPL = 0
      let avgCost = 0
      const rolls = []

      const isOption = symTrades[0]?.instrumentType === 'OPTION'
      const multiplier = isOption ? 100 : 1

      for (const t of symTrades) {
        if (t.tradeType === 'BUY') {
          openLots.push({
            qty: t.quantity,
            origQty: t.quantity,
            price: t.price,
            amount: t.amount,   // negative cash flow (Fidelity: Amount ($))
            date: t.date,
            id: t.id,
          })
          // Weighted average cost (price-based, for display in Options tracker)
          const totalQty  = openLots.reduce((s, l) => s + l.qty, 0)
          const totalCost = openLots.reduce((s, l) => s + l.qty * l.price, 0)
          avgCost = totalQty > 0 ? totalCost / totalQty : 0

        } else if (t.tradeType === 'SELL' || t.tradeType === 'ROLL') {
          let sellQty  = t.quantity
          let tradePL  = 0

          while (sellQty > 0 && openLots.length > 0) {
            const lot     = openLots[0]
            const matched = Math.min(lot.qty, sellQty)

            // ── Prefer amount-based P&L (includes commissions + options 100× automatically)
            // Fidelity Amount ($): negative for buys, positive for sells.
            // Prorate each side by matched / total qty for that trade / lot.
            if (t.amount !== 0 && lot.amount !== 0) {
              const sellProceeds = (matched / t.quantity)    * Math.abs(t.amount)
              const buyCost      = (matched / lot.origQty)   * Math.abs(lot.amount)
              tradePL += sellProceeds - buyCost
            } else {
              // Fallback: price × qty × multiplier (handles old stored data with amount=0)
              tradePL += matched * (t.price - lot.price) * multiplier
            }

            lot.qty  -= matched
            sellQty  -= matched
            if (lot.qty <= 0) openLots.shift()
          }

          totalPL       += tradePL
          t.profitLoss   = tradePL   // already in dollars (amount-based path handles multiplier)

          if (t.tradeType === 'ROLL') {
            rolls.push({ date: t.date, from: sym, price: t.price })
          }
        }
      }

      const openQty = openLots.reduce((s, l) => s + l.qty, 0)

      positions.push({
        symbol: sym,
        underlying,
        instrumentType: symTrades[0]?.instrumentType || 'STOCK',
        trades: symTrades,
        openQty,
        avgCost,
        realizedPL: totalPL,   // dollars (multiplier already applied in amount-based path)
        rolls,
        isOpen: openQty > 0,
        lastDate: symTrades[symTrades.length - 1]?.date,
        firstDate: symTrades[0]?.date,
      })
    }
  }

  return positions
}

function getUnderlying(symbol) {
  // Strip OCC option suffix to get underlying ticker
  const match = symbol.match(/^([A-Z]{1,6})\s*\d{6}[CP]/)
  if (match) return match[1]
  if (symbol.startsWith('/')) return symbol.replace(/\d+$/, '') // strip contract month
  return symbol
}

/**
 * Aggregate trades into daily/weekly/monthly buckets for calendar view.
 */
export function aggregateByPeriod(trades, period = 'daily') {
  const buckets = {}

  for (const t of trades) {
    let key = t.date
    if (period === 'weekly') {
      const d = new Date(t.date)
      const dayOfWeek = d.getDay()
      const monday = new Date(d)
      monday.setDate(d.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1))
      key = monday.toISOString().slice(0, 10)
    } else if (period === 'monthly') {
      key = t.date.slice(0, 7)
    }

    if (!buckets[key]) buckets[key] = { pnl: 0, trades: 0, wins: 0, losses: 0 }
    buckets[key].pnl += t.profitLoss || 0
    buckets[key].trades++
    if ((t.profitLoss || 0) > 0) buckets[key].wins++
    if ((t.profitLoss || 0) < 0) buckets[key].losses++
  }

  return buckets
}
