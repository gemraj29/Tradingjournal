import { useState, useMemo } from 'react'
import { useTrades } from '../context/TradesContext'

const fmt = (n) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n)

// ─── Pure JS date helpers ────────────────────────────────────────────────────
function addMonths(date, n) {
  const d = new Date(date)
  d.setMonth(d.getMonth() + n)
  return d
}
function toYMD(date) {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}
function formatMonthYear(date) {
  return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
}
function getCalendarDays(year, month) {
  // Returns array of Date objects for the calendar grid (Mon-start), 6 weeks max
  const firstDay = new Date(year, month, 1)
  const lastDay  = new Date(year, month + 1, 0)

  // Monday = 0 … Sunday = 6
  let startDow = firstDay.getDay() - 1
  if (startDow < 0) startDow = 6

  const days = []
  for (let i = startDow; i > 0; i--) {
    const d = new Date(year, month, 1 - i)
    days.push(d)
  }
  for (let d = 1; d <= lastDay.getDate(); d++) {
    days.push(new Date(year, month, d))
  }
  // Pad to multiple of 7
  while (days.length % 7 !== 0) {
    days.push(new Date(year, month + 1, days.length - lastDay.getDate() - startDow + 1))
  }
  return days
}

export default function CalendarPage() {
  const { trades, enrichedTrades } = useTrades()
  const [view, setView] = useState('monthly')
  const [current, setCurrent] = useState(new Date())

  const year  = current.getFullYear()
  const month = current.getMonth()

  // Aggregate enrichedTrades by date key (closing trades have profitLoss set)
  const byDate = useMemo(() => {
    const map = {}
    for (const t of enrichedTrades) {
      if (!map[t.date]) map[t.date] = { pnl: 0, count: 0, wins: 0, losses: 0 }
      map[t.date].pnl    += t.profitLoss || 0
      map[t.date].count  += 1
      if ((t.profitLoss || 0) > 0) map[t.date].wins++
      if ((t.profitLoss || 0) < 0) map[t.date].losses++
    }
    return map
  }, [enrichedTrades])

  // Monthly summary (yyyy-mm key)
  const monthlySummary = useMemo(() => {
    const map = {}
    for (const t of enrichedTrades) {
      const m = t.date.slice(0, 7)
      if (!map[m]) map[m] = { pnl: 0, count: 0, wins: 0, losses: 0 }
      map[m].pnl   += t.profitLoss || 0
      map[m].count += 1
      if ((t.profitLoss || 0) > 0) map[m].wins++
      if ((t.profitLoss || 0) < 0) map[m].losses++
    }
    return map
  }, [enrichedTrades])

  const maxAbsPnl = useMemo(() => Math.max(1, ...Object.values(byDate).map(d => Math.abs(d.pnl))), [byDate])

  const cellColor = (pnl) => {
    if (!pnl) return 'transparent'
    const i = Math.min(0.85, Math.abs(pnl) / maxAbsPnl)
    return pnl > 0
      ? `rgba(16,185,129,${0.1 + i * 0.35})`
      : `rgba(239,68,68,${0.1 + i * 0.35})`
  }

  const calDays  = useMemo(() => getCalendarDays(year, month), [year, month])
  const todayYMD = toYMD(new Date())
  const mKey     = `${year}-${String(month + 1).padStart(2, '0')}`
  const ms       = monthlySummary[mKey]

  return (
    <div style={{ padding: '32px 32px', display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 4 }}>Calendar</h1>
          <p style={{ fontSize: 14, color: 'var(--text-muted)' }}>P&L and trade count by day</p>
        </div>
        <div style={{ display: 'flex', gap: 6, background: 'rgba(108,99,255,0.08)', borderRadius: 10, padding: 4 }}>
          {['daily', 'monthly'].map(v => (
            <button key={v} onClick={() => setView(v)} style={{
              padding: '6px 14px', borderRadius: 8, border: 'none', cursor: 'pointer',
              fontSize: 13, fontWeight: 600,
              background: view === v ? '#6c63ff' : 'transparent',
              color: view === v ? '#fff' : 'var(--text-secondary)',
            }}>{v.charAt(0).toUpperCase() + v.slice(1)}</button>
          ))}
        </div>
      </div>

      {view === 'daily' && (
        <>
          {/* Month nav */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <NavBtn onClick={() => setCurrent(d => addMonths(d, -1))}>‹</NavBtn>
            <div style={{ fontWeight: 700, fontSize: 18, color: 'var(--text-primary)', minWidth: 180, textAlign: 'center' }}>
              {formatMonthYear(current)}
            </div>
            <NavBtn onClick={() => setCurrent(d => addMonths(d, 1))}>›</NavBtn>
            <NavBtn onClick={() => setCurrent(new Date())} small>Today</NavBtn>
          </div>

          {/* Month summary pills */}
          {ms && (
            <div style={{ display: 'flex', gap: 12 }}>
              {[
                { label: 'Month P&L', value: fmt(ms.pnl),  color: ms.pnl >= 0 ? '#10b981' : '#ef4444' },
                { label: 'Trades',    value: ms.count,      color: '#6c63ff' },
                { label: 'Win Days',  value: ms.wins,       color: '#10b981' },
                { label: 'Loss Days', value: ms.losses,     color: '#ef4444' },
              ].map(s => (
                <div key={s.label} className="glass" style={{ padding: '12px 20px', flex: 1 }}>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4 }}>{s.label}</div>
                  <div style={{ fontSize: 20, fontWeight: 700, color: s.color }}>{s.value}</div>
                </div>
              ))}
            </div>
          )}

          {/* Grid */}
          <div className="glass" style={{ padding: '20px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', gap: 4, marginBottom: 8 }}>
              {['Mon','Tue','Wed','Thu','Fri','Sat','Sun'].map(d => (
                <div key={d} style={{ textAlign: 'center', fontSize: 11, fontWeight: 600,
                  color: 'var(--text-muted)', padding: '4px 0', letterSpacing: '0.05em' }}>{d}</div>
              ))}
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', gap: 4 }}>
              {calDays.map((day) => {
                const key     = toYMD(day)
                const d       = byDate[key]
                const inMonth = day.getMonth() === month
                const isToday = key === todayYMD
                return (
                  <div key={key} style={{
                    minHeight: 72, borderRadius: 10, padding: '8px 10px',
                    background: d ? cellColor(d.pnl) : inMonth ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.02)',
                    border: isToday ? '2px solid var(--color-primary)' : '1px solid rgba(255,255,255,0.5)',
                    opacity: inMonth ? 1 : 0.3,
                  }}>
                    <div style={{ fontSize: 12, fontWeight: isToday ? 700 : 500,
                      color: isToday ? 'var(--color-primary)' : 'var(--text-secondary)' }}>
                      {day.getDate()}
                    </div>
                    {d && (
                      <>
                        <div style={{ fontSize: 11, fontWeight: 700, marginTop: 4,
                          color: d.pnl >= 0 ? 'var(--color-profit)' : 'var(--color-loss)' }}>
                          {d.pnl >= 0 ? '+' : ''}{fmt(d.pnl)}
                        </div>
                        <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 2 }}>
                          {d.count} trade{d.count !== 1 ? 's' : ''}
                        </div>
                      </>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        </>
      )}

      {view === 'monthly' && (
        <div className="glass" style={{ padding: '24px', overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr>
                {['Month','Trades','Win Days','Loss Days','P&L','Win Rate'].map(h => (
                  <th key={h} style={{ textAlign: 'left', padding: '10px 14px', fontWeight: 600,
                    fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase',
                    letterSpacing: '0.05em', borderBottom: '1px solid rgba(0,0,0,0.06)' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {Object.entries(monthlySummary)
                .sort((a, b) => b[0].localeCompare(a[0]))
                .map(([month, d]) => {
                  const wr = d.count > 0 ? Math.round((d.wins / d.count) * 100) : 0
                  const label = new Date(month + '-01').toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
                  return (
                    <tr key={month} style={{ borderBottom: '1px solid rgba(0,0,0,0.04)' }}>
                      <td style={{ padding: '12px 14px', fontWeight: 600, color: 'var(--text-primary)' }}>{label}</td>
                      <td style={{ padding: '12px 14px', color: 'var(--text-secondary)' }}>{d.count}</td>
                      <td style={{ padding: '12px 14px', color: 'var(--color-profit)', fontWeight: 600 }}>{d.wins}</td>
                      <td style={{ padding: '12px 14px', color: 'var(--color-loss)', fontWeight: 600 }}>{d.losses}</td>
                      <td style={{ padding: '12px 14px', fontWeight: 700,
                        color: d.pnl >= 0 ? 'var(--color-profit)' : 'var(--color-loss)' }}>
                        {d.pnl >= 0 ? '+' : ''}{fmt(d.pnl)}
                      </td>
                      <td style={{ padding: '12px 14px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <div style={{ flex: 1, height: 6, borderRadius: 3, background: 'rgba(0,0,0,0.06)', overflow: 'hidden', minWidth: 60 }}>
                            <div style={{ width: `${wr}%`, height: '100%', borderRadius: 3, background: 'var(--color-profit)' }} />
                          </div>
                          <span style={{ fontSize: 12, color: 'var(--text-secondary)', minWidth: 32 }}>{wr}%</span>
                        </div>
                      </td>
                    </tr>
                  )
                })}
            </tbody>
          </table>
          {Object.keys(monthlySummary).length === 0 && (
            <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-muted)', fontSize: 14 }}>
              No trade data yet — import a CSV to see your calendar.
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function NavBtn({ onClick, children, small }) {
  return (
    <button onClick={onClick} style={{
      minWidth: small ? 'auto' : 36, height: 36, padding: small ? '0 12px' : '0',
      borderRadius: 8, border: '1px solid rgba(108,99,255,0.2)',
      background: 'rgba(255,255,255,0.7)', cursor: 'pointer',
      fontSize: small ? 12 : 18, color: 'var(--color-primary)', fontWeight: 600,
    }}>{children}</button>
  )
}
