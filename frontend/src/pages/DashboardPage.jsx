import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, Tooltip,
  ResponsiveContainer, CartesianGrid, PieChart, Pie, Cell,
} from 'recharts'
import StatCard from '../components/StatCard'
import { useTrades } from '../context/TradesContext'

const fmt = (n) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n)
const fmtPct = (n) => `${n.toFixed(1)}%`

export default function DashboardPage() {
  const { trades, enrichedTrades, summary, positions } = useTrades()
  const navigate = useNavigate()

  // Equity curve: cumulative P&L over time (use enrichedTrades which have profitLoss set on closing trades)
  const equityCurve = useMemo(() => {
    const sorted = [...enrichedTrades].sort((a, b) => a.date.localeCompare(b.date))
    let cum = 0
    const byDay = {}
    for (const t of sorted) {
      cum += t.profitLoss || 0
      byDay[t.date] = { date: t.date, pnl: cum }
    }
    return Object.values(byDay)
  }, [enrichedTrades])

  // Monthly bar chart
  const monthlyData = useMemo(() => {
    const map = {}
    for (const t of enrichedTrades) {
      const m = t.date.slice(0, 7)
      if (!map[m]) map[m] = { month: m, pnl: 0, trades: 0 }
      map[m].pnl += t.profitLoss || 0
      map[m].trades++
    }
    return Object.values(map).sort((a, b) => a.month.localeCompare(b.month)).map(d => ({
      ...d,
      month: new Date(d.month + '-01').toLocaleDateString('en-US', { month: 'short', year: '2-digit' }),
    }))
  }, [enrichedTrades])

  // Instrument breakdown (use raw trades for count accuracy)
  const instrBreakdown = useMemo(() => {
    const map = {}
    for (const t of trades) {
      const k = t.instrumentType || 'STOCK'
      map[k] = (map[k] || 0) + 1
    }
    return Object.entries(map).map(([name, value]) => ({ name, value }))
  }, [trades])

  // Top symbols by trade count + P&L
  const topSymbols = useMemo(() => {
    const map = {}
    for (const t of enrichedTrades) {
      if (!map[t.symbol]) map[t.symbol] = { symbol: t.symbol, trades: 0, pnl: 0 }
      map[t.symbol].trades++
      map[t.symbol].pnl += t.profitLoss || 0
    }
    return Object.values(map).sort((a, b) => b.trades - a.trades).slice(0, 8)
  }, [enrichedTrades])

  const PIE_COLORS = ['#6c63ff', '#10b981', '#f59e0b']

  if (!trades.length) {
    return (
      <EmptyState onImport={() => navigate('/import')} />
    )
  }

  return (
    <div style={{ padding: '32px 32px', display: 'flex', flexDirection: 'column', gap: 24 }}>
      <div>
        <h1 style={{ fontSize: 24, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 4 }}>Dashboard</h1>
        <p style={{ fontSize: 14, color: 'var(--text-muted)' }}>{trades.length} trades loaded</p>
      </div>

      {/* Stat cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 16 }}>
        <StatCard label="Net P&L"      value={fmt(summary.netPL)}      accent={summary.netPL >= 0 ? 'profit' : 'loss'} icon="$" />
        <StatCard label="Total Profit" value={fmt(summary.totalProfit)} accent="profit" icon="↑"
          sub={`${summary.winning} winning trades`} />
        <StatCard label="Total Loss"   value={fmt(summary.totalLoss)}   accent="loss"   icon="↓"
          sub={`${summary.losing} losing trades`} />
        <StatCard label="Win Rate"     value={fmtPct(summary.winRate)}  accent="purple" icon="%" />
        <StatCard label="Total Trades" value={summary.totalTrades}      accent="amber"  icon="≡" />
        <StatCard label="Open Positions" value={positions.filter(p => p.isOpen).length} accent="purple" icon="◈" />
      </div>

      {/* Equity curve */}
      <div className="glass" style={{ padding: '24px' }}>
        <div style={{ fontWeight: 600, fontSize: 15, marginBottom: 16, color: 'var(--text-primary)' }}>
          Equity Curve (Cumulative P&L)
        </div>
        <ResponsiveContainer width="100%" height={200}>
          <AreaChart data={equityCurve}>
            <defs>
              <linearGradient id="plGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%"  stopColor="#6c63ff" stopOpacity={0.2} />
                <stop offset="95%" stopColor="#6c63ff" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.04)" />
            <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#9ca3af' }}
              tickFormatter={d => d.slice(5)} interval="preserveStartEnd" />
            <YAxis tick={{ fontSize: 10, fill: '#9ca3af' }} tickFormatter={v => `$${v >= 1000 ? (v/1000).toFixed(0)+'k' : v}`} />
            <Tooltip formatter={(v) => [fmt(v), 'Cumulative P&L']}
              contentStyle={{ background: 'rgba(255,255,255,0.9)', border: '1px solid rgba(108,99,255,0.2)', borderRadius: 8, fontSize: 12 }} />
            <Area type="monotone" dataKey="pnl" stroke="#6c63ff" strokeWidth={2}
              fill="url(#plGrad)" dot={false} />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Monthly + Breakdown row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 280px', gap: 16 }}>
        {/* Monthly bar */}
        <div className="glass" style={{ padding: '24px' }}>
          <div style={{ fontWeight: 600, fontSize: 15, marginBottom: 16, color: 'var(--text-primary)' }}>
            Monthly P&L
          </div>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={monthlyData} barSize={18}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.04)" />
              <XAxis dataKey="month" tick={{ fontSize: 10, fill: '#9ca3af' }} />
              <YAxis tick={{ fontSize: 10, fill: '#9ca3af' }} tickFormatter={v => `$${v >= 1000 ? (v/1000).toFixed(0)+'k' : v}`} />
              <Tooltip formatter={(v) => [fmt(v), 'P&L']}
                contentStyle={{ background: 'rgba(255,255,255,0.9)', border: '1px solid rgba(108,99,255,0.2)', borderRadius: 8, fontSize: 12 }} />
              <Bar dataKey="pnl" radius={[4,4,0,0]}>
                {monthlyData.map((entry, i) => (
                  <Cell key={i} fill={entry.pnl >= 0 ? '#10b981' : '#ef4444'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Instrument pie */}
        <div className="glass" style={{ padding: '24px' }}>
          <div style={{ fontWeight: 600, fontSize: 15, marginBottom: 8, color: 'var(--text-primary)' }}>
            Instrument Mix
          </div>
          <ResponsiveContainer width="100%" height={140}>
            <PieChart>
              <Pie data={instrBreakdown} cx="50%" cy="50%" innerRadius={35} outerRadius={55}
                dataKey="value" nameKey="name">
                {instrBreakdown.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
              </Pie>
              <Tooltip contentStyle={{ background: 'rgba(255,255,255,0.9)', border: '1px solid rgba(108,99,255,0.2)', borderRadius: 8, fontSize: 12 }} />
            </PieChart>
          </ResponsiveContainer>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {instrBreakdown.map((d, i) => (
              <div key={d.name} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12 }}>
                <div style={{ width: 10, height: 10, borderRadius: 3, background: PIE_COLORS[i % PIE_COLORS.length], flexShrink: 0 }} />
                <span style={{ color: 'var(--text-secondary)', flex: 1 }}>{d.name}</span>
                <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{d.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Top symbols */}
      <div className="glass" style={{ padding: '24px' }}>
        <div style={{ fontWeight: 600, fontSize: 15, marginBottom: 16, color: 'var(--text-primary)' }}>
          Most Traded Symbols
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {topSymbols.map(s => (
            <div key={s.symbol} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{
                width: 80, fontWeight: 600, fontSize: 13,
                color: 'var(--text-primary)', fontFamily: 'monospace',
                overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
              }} title={s.symbol}>{s.symbol}</div>
              {/* bar */}
              <div style={{ flex: 1, height: 8, borderRadius: 4, background: 'rgba(108,99,255,0.08)', overflow: 'hidden' }}>
                <div style={{
                  width: `${(s.trades / topSymbols[0].trades) * 100}%`,
                  height: '100%', borderRadius: 4,
                  background: 'linear-gradient(90deg, #6c63ff, #a78bfa)',
                }} />
              </div>
              <div style={{ width: 36, textAlign: 'right', fontSize: 12, color: 'var(--text-muted)' }}>{s.trades}</div>
              <div style={{
                width: 80, textAlign: 'right', fontSize: 12, fontWeight: 600,
                color: s.pnl >= 0 ? 'var(--color-profit)' : 'var(--color-loss)',
              }}>{fmt(s.pnl)}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function EmptyState({ onImport }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '80vh' }}>
      <div className="glass" style={{ padding: '48px 40px', textAlign: 'center', maxWidth: 420 }}>
        <div style={{ fontSize: 48, marginBottom: 20 }}>📈</div>
        <div style={{ fontWeight: 700, fontSize: 20, color: 'var(--text-primary)', marginBottom: 8 }}>
          No trades yet
        </div>
        <div style={{ fontSize: 14, color: 'var(--text-muted)', marginBottom: 28 }}>
          Import your Fidelity CSV to start tracking your options, stocks, and futures performance.
        </div>
        <button onClick={onImport} style={{
          padding: '12px 24px', borderRadius: 10,
          background: 'linear-gradient(135deg, #6c63ff, #a78bfa)',
          color: '#fff', border: 'none', cursor: 'pointer',
          fontSize: 14, fontWeight: 600,
        }}>
          Import CSV →
        </button>
      </div>
    </div>
  )
}
