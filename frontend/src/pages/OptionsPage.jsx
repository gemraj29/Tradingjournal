import { useState, useMemo } from 'react'
import { useTrades } from '../context/TradesContext'

const fmt  = (n) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 2 }).format(n)
const fmt0 = (n) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n)

export default function OptionsPage() {
  const { positions } = useTrades()
  const [filter, setFilter] = useState('all')  // all | open | closed

  const optPositions = useMemo(() =>
    positions.filter(p => p.instrumentType === 'OPTION'), [positions])

  const filtered = useMemo(() => {
    if (filter === 'open')   return optPositions.filter(p => p.isOpen)
    if (filter === 'closed') return optPositions.filter(p => !p.isOpen)
    return optPositions
  }, [optPositions, filter])

  // Group by underlying
  const grouped = useMemo(() => {
    const map = {}
    for (const p of filtered) {
      const u = p.underlying
      if (!map[u]) map[u] = []
      map[u].push(p)
    }
    return Object.entries(map).sort((a, b) => {
      const aPL = a[1].reduce((s, p) => s + p.realizedPL, 0)
      const bPL = b[1].reduce((s, p) => s + p.realizedPL, 0)
      return Math.abs(bPL) - Math.abs(aPL)
    })
  }, [filtered])

  const totalRL = filtered.reduce((s, p) => s + p.realizedPL, 0)
  const openCount = optPositions.filter(p => p.isOpen).length

  return (
    <div style={{ padding: '32px 32px', display: 'flex', flexDirection: 'column', gap: 24 }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 4 }}>
            Options Tracker
          </h1>
          <p style={{ fontSize: 14, color: 'var(--text-muted)' }}>
            Average cost basis, rolls, and position chains
          </p>
        </div>
        {/* Filter */}
        <div style={{ display: 'flex', gap: 6, background: 'rgba(108,99,255,0.08)', borderRadius: 10, padding: 4 }}>
          {['all', 'open', 'closed'].map(v => (
            <button key={v} onClick={() => setFilter(v)} style={{
              padding: '6px 14px', borderRadius: 8, border: 'none', cursor: 'pointer',
              fontSize: 13, fontWeight: 600,
              background: filter === v ? '#6c63ff' : 'transparent',
              color: filter === v ? '#fff' : 'var(--text-secondary)',
              transition: 'all 0.15s',
            }}>{v.charAt(0).toUpperCase() + v.slice(1)}</button>
          ))}
        </div>
      </div>

      {/* Summary bar */}
      <div style={{ display: 'flex', gap: 16 }}>
        {[
          { label: 'Realized P&L', value: fmt0(totalRL), color: totalRL >= 0 ? '#10b981' : '#ef4444' },
          { label: 'Open Positions', value: openCount, color: '#6c63ff' },
          { label: 'Total Contracts', value: filtered.length, color: '#f59e0b' },
        ].map(s => (
          <div key={s.label} className="glass" style={{ padding: '14px 20px', flex: 1 }}>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4 }}>{s.label}</div>
            <div style={{ fontSize: 22, fontWeight: 700, color: s.color }}>{s.value}</div>
          </div>
        ))}
      </div>

      {/* Explanation callout */}
      <div className="glass" style={{
        padding: '14px 20px', borderLeft: '3px solid rgba(108,99,255,0.3)',
        background: 'rgba(108,99,255,0.04)',
      }}>
        <div style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6 }}>
          <strong style={{ color: 'var(--text-primary)' }}>How averaging & rolling is tracked:</strong>{' '}
          When you buy the same option multiple times, the average cost shown is the weighted average across all buy lots (FIFO).
          A "roll" is when you sell a position near expiry and buy a later-expiry contract — each roll leg is shown separately within the position chain.
          The <em>true entry cost</em> accounts for all averaging-down buys before realizing a gain or loss.
        </div>
      </div>

      {/* Positions grouped by underlying */}
      {grouped.length === 0 ? (
        <div className="glass" style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)', fontSize: 14 }}>
          No option positions found. Import a CSV with option trades (e.g. AAPL240315C00175000).
        </div>
      ) : (
        grouped.map(([underlying, positions]) => (
          <UnderlyingGroup key={underlying} underlying={underlying} positions={positions} />
        ))
      )}
    </div>
  )
}

function UnderlyingGroup({ underlying, positions }) {
  const [expanded, setExpanded] = useState(true)
  const groupPL = positions.reduce((s, p) => s + p.realizedPL, 0)
  const hasRolls = positions.some(p => p.rolls.length > 0)

  return (
    <div className="glass" style={{ overflow: 'hidden' }}>
      {/* Header */}
      <div
        onClick={() => setExpanded(e => !e)}
        style={{
          padding: '16px 24px', cursor: 'pointer',
          display: 'flex', alignItems: 'center', gap: 16,
          borderBottom: expanded ? '1px solid rgba(0,0,0,0.06)' : 'none',
        }}
      >
        <div style={{ fontWeight: 700, fontSize: 16, color: 'var(--text-primary)', flex: 1 }}>
          {underlying}
          {hasRolls && (
            <span className="badge badge-tag" style={{ marginLeft: 8, fontSize: 10 }}>ROLLED</span>
          )}
        </div>
        <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>{positions.length} contract{positions.length !== 1 ? 's' : ''}</div>
        <div style={{ fontWeight: 700, fontSize: 15, color: groupPL >= 0 ? 'var(--color-profit)' : 'var(--color-loss)' }}>
          {groupPL >= 0 ? '+' : ''}{fmt0(groupPL)}
        </div>
        <span style={{ color: 'var(--text-muted)', fontSize: 14 }}>{expanded ? '▲' : '▼'}</span>
      </div>

      {expanded && (
        <div style={{ padding: '0 24px 20px' }}>
          {positions.map(pos => (
            <PositionCard key={pos.symbol} pos={pos} />
          ))}
        </div>
      )}
    </div>
  )
}

function PositionCard({ pos }) {
  const [showTrades, setShowTrades] = useState(false)
  const totalBuyQty   = pos.trades.filter(t => t.tradeType === 'BUY').reduce((s, t) => s + t.quantity, 0)
  const totalBuyCost  = pos.trades.filter(t => t.tradeType === 'BUY').reduce((s, t) => s + t.quantity * t.price, 0)
  const avgEntry      = totalBuyQty > 0 ? totalBuyCost / totalBuyQty : 0
  const multiplier    = pos.instrumentType === 'OPTION' ? 100 : 1
  const totalPremiumPaid = totalBuyCost * multiplier

  // Parse OCC symbol for display
  const parsed = parseOCCSymbol(pos.symbol)

  return (
    <div style={{
      marginTop: 12, borderRadius: 12, padding: '16px',
      background: 'rgba(255,255,255,0.5)',
      border: '1px solid rgba(255,255,255,0.7)',
    }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16, flexWrap: 'wrap' }}>
        {/* Symbol + type */}
        <div style={{ flex: 1, minWidth: 200 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 4 }}>
            <span style={{ fontWeight: 700, fontSize: 13, fontFamily: 'monospace', color: 'var(--text-primary)' }}>
              {pos.symbol}
            </span>
            {parsed && (
              <span className={`badge ${parsed.type === 'C' ? 'badge-profit' : 'badge-loss'}`}>
                {parsed.type === 'C' ? 'CALL' : 'PUT'}
              </span>
            )}
            {pos.isOpen && <span className="badge badge-tag">OPEN</span>}
            {pos.rolls.length > 0 && <span className="badge" style={{ background: 'rgba(245,158,11,0.1)', color: '#f59e0b' }}>🔄 {pos.rolls.length} ROLL{pos.rolls.length > 1 ? 'S' : ''}</span>}
          </div>
          {parsed && (
            <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
              Strike ${parsed.strike} · Exp {parsed.expiry} · {pos.trades.length} trade{pos.trades.length !== 1 ? 's' : ''}
            </div>
          )}
        </div>

        {/* Metrics */}
        <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap' }}>
          <Metric label="Avg Entry" value={fmt(avgEntry)} sub="per contract" />
          <Metric label="Total Premium" value={fmt(totalPremiumPaid)} sub="incl. averages" />
          {pos.openQty > 0 && <Metric label="Open Qty" value={pos.openQty} sub="contracts" />}
          <Metric label="Realized P&L" value={fmt0(pos.realizedPL)}
            valueStyle={{ color: pos.realizedPL >= 0 ? 'var(--color-profit)' : 'var(--color-loss)', fontWeight: 700 }} />
        </div>
      </div>

      {/* Roll chain */}
      {pos.rolls.length > 0 && (
        <div style={{ marginTop: 12, padding: '10px 14px', borderRadius: 8, background: 'rgba(245,158,11,0.06)', border: '1px solid rgba(245,158,11,0.15)' }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: '#f59e0b', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Roll History
          </div>
          {pos.rolls.map((r, i) => (
            <div key={i} style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 2 }}>
              🔄 {r.date} — Rolled from {r.from} @ {fmt(r.price)}
            </div>
          ))}
        </div>
      )}

      {/* Trade list toggle */}
      <button onClick={() => setShowTrades(s => !s)} style={{
        marginTop: 10, padding: '4px 10px', borderRadius: 6,
        border: '1px solid rgba(108,99,255,0.2)',
        background: 'transparent', cursor: 'pointer',
        fontSize: 11, color: 'var(--color-primary)', fontWeight: 600,
      }}>
        {showTrades ? '▲ Hide' : '▼ Show'} trade legs ({pos.trades.length})
      </button>

      {showTrades && (
        <div style={{ marginTop: 10, overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
            <thead>
              <tr>
                {['Date', 'Action', 'Qty', 'Price', 'Amount'].map(h => (
                  <th key={h} style={{ textAlign: 'left', padding: '6px 10px', fontWeight: 600,
                    color: 'var(--text-muted)', fontSize: 11, borderBottom: '1px solid rgba(0,0,0,0.06)' }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {pos.trades.map(t => (
                <tr key={t.id} style={{ borderBottom: '1px solid rgba(0,0,0,0.03)' }}>
                  <td style={{ padding: '6px 10px', color: 'var(--text-secondary)' }}>{t.date}</td>
                  <td style={{ padding: '6px 10px' }}>
                    <span className={`badge ${t.tradeType === 'BUY' ? 'badge-loss' : 'badge-profit'}`}>
                      {t.tradeType}
                    </span>
                  </td>
                  <td style={{ padding: '6px 10px', color: 'var(--text-primary)', fontWeight: 500 }}>{t.quantity}</td>
                  <td style={{ padding: '6px 10px', color: 'var(--text-primary)', fontFamily: 'monospace' }}>{fmt(t.price)}</td>
                  <td style={{ padding: '6px 10px', fontWeight: 600,
                    color: t.amount >= 0 ? 'var(--color-profit)' : 'var(--color-loss)' }}>
                    {fmt(t.amount)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

function Metric({ label, value, sub, valueStyle = {} }) {
  return (
    <div style={{ textAlign: 'right' }}>
      <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 2 }}>{label}</div>
      <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)', ...valueStyle }}>{value}</div>
      {sub && <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>{sub}</div>}
    </div>
  )
}

// Parse OCC option symbol: AAPL240315C00175000
function parseOCCSymbol(symbol) {
  const m = symbol.match(/^([A-Z]{1,6})\s*(\d{2})(\d{2})(\d{2})([CP])(\d{8})$/)
  if (!m) return null
  const [, , yy, mm, dd, type, strikeRaw] = m
  const strike = parseInt(strikeRaw, 10) / 1000
  return {
    type,
    strike,
    expiry: `${mm}/${dd}/20${yy}`,
  }
}
