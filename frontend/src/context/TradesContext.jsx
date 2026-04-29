import { createContext, useContext, useState, useCallback, useEffect } from 'react'
import { parseFidelityCSV, computePositions } from '../utils/csvParser'

const TradesContext = createContext(null)

const STORAGE_KEY = 'tj_trades_v1'
const TAGS_KEY = 'tj_tags_v1'

export function TradesProvider({ children }) {
  const [trades, setTrades] = useState(() => {
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]') } catch { return [] }
  })
  const [globalTags, setGlobalTags] = useState(() => {
    try { return JSON.parse(localStorage.getItem(TAGS_KEY) || '[]') } catch { return [] }
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  // Persist to localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(trades))
  }, [trades])
  useEffect(() => {
    localStorage.setItem(TAGS_KEY, JSON.stringify(globalTags))
  }, [globalTags])

  const importCSV = useCallback(async (file) => {
    setLoading(true)
    setError(null)
    try {
      const text = await file.text()
      const parsed = parseFidelityCSV(text)
      if (!parsed.length) throw new Error('No trades found in CSV. Check file format.')

      // Try to also upload to backend
      try {
        const formData = new FormData()
        formData.append('file', file)
        await fetch('/api/trades/import', { method: 'POST', body: formData })
      } catch (_) {
        // backend not running — fine, we have client-side data
      }

      setTrades(prev => {
        const existingIds = new Set(prev.map(t => `${t.date}|${t.symbol}|${t.tradeType}|${t.quantity}|${t.price}`))
        const deduped = parsed.filter(t =>
          !existingIds.has(`${t.date}|${t.symbol}|${t.tradeType}|${t.quantity}|${t.price}`)
        )
        return [...prev, ...deduped]
      })
      return parsed.length
    } catch (e) {
      setError(e.message)
      throw e
    } finally {
      setLoading(false)
    }
  }, [])

  const updateTrade = useCallback((id, updates) => {
    setTrades(prev => prev.map(t => t.id === id ? { ...t, ...updates } : t))
  }, [])

  const addTag = useCallback((tradeId, tag) => {
    const clean = tag.trim().toLowerCase()
    if (!clean) return
    setTrades(prev => prev.map(t =>
      t.id === tradeId && !t.tags.includes(clean)
        ? { ...t, tags: [...t.tags, clean] }
        : t
    ))
    setGlobalTags(prev => prev.includes(clean) ? prev : [...prev, clean])
  }, [])

  const removeTag = useCallback((tradeId, tag) => {
    setTrades(prev => prev.map(t =>
      t.id === tradeId ? { ...t, tags: t.tags.filter(tg => tg !== tag) } : t
    ))
  }, [])

  const clearAll = useCallback(() => {
    setTrades([])
    setGlobalTags([])
  }, [])

  // Derived
  const positions = computePositions(trades)

  // Flatten positions back to trades — closing trades now have profitLoss populated
  const enrichedTrades = positions.flatMap(p => p.trades)

  const summary = (() => {
    // Summarise at position level (each symbol = one position)
    const totalProfit = positions.reduce((s, p) => p.realizedPL > 0 ? s + p.realizedPL : s, 0)
    const totalLoss   = positions.reduce((s, p) => p.realizedPL < 0 ? s + p.realizedPL : s, 0)
    const netPL = totalProfit + totalLoss
    // Win/loss: count closing trades that made or lost money
    const winning = enrichedTrades.filter(t => t.profitLoss > 0).length
    const losing  = enrichedTrades.filter(t => t.profitLoss < 0).length
    const totalClosed = winning + losing
    const winRate = totalClosed > 0 ? (winning / totalClosed) * 100 : 0
    return { totalProfit, totalLoss, netPL, totalTrades: trades.length, winning, losing, winRate }
  })()

  return (
    <TradesContext.Provider value={{
      trades, enrichedTrades, positions, summary, globalTags,
      loading, error,
      importCSV, updateTrade, addTag, removeTag, clearAll,
    }}>
      {children}
    </TradesContext.Provider>
  )
}

export const useTrades = () => {
  const ctx = useContext(TradesContext)
  if (!ctx) throw new Error('useTrades must be used within TradesProvider')
  return ctx
}
