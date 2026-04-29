import { NavLink } from 'react-router-dom'
import { useTrades } from '../context/TradesContext'

const NAV = [
  { to: '/',            icon: '▦', label: 'Dashboard' },
  { to: '/calendar',   icon: '◫', label: 'Calendar' },
  { to: '/trades',     icon: '≡',  label: 'Trades' },
  { to: '/positions',  icon: '◈', label: 'Options' },
  { to: '/import',     icon: '↑',  label: 'Import' },
]

export default function Sidebar() {
  const { summary } = useTrades()
  return (
    <aside style={{
      width: 'var(--sidebar-width)',
      minHeight: '100vh',
      background: 'rgba(255,255,255,0.55)',
      backdropFilter: 'blur(20px)',
      WebkitBackdropFilter: 'blur(20px)',
      borderRight: '1px solid rgba(255,255,255,0.7)',
      display: 'flex',
      flexDirection: 'column',
      padding: '24px 0',
      position: 'fixed',
      top: 0, left: 0,
      zIndex: 100,
    }}>
      {/* Logo */}
      <div style={{ padding: '0 20px 28px', borderBottom: '1px solid rgba(108,99,255,0.08)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 36, height: 36, borderRadius: 10,
            background: 'linear-gradient(135deg, #6c63ff, #a78bfa)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#fff', fontSize: 16, fontWeight: 700,
          }}>T</div>
          <div>
            <div style={{ fontWeight: 700, fontSize: 15, color: 'var(--text-primary)', lineHeight: 1.2 }}>TradingJournal</div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{summary.totalTrades} trades</div>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: '16px 12px', display: 'flex', flexDirection: 'column', gap: 4 }}>
        {NAV.map(({ to, icon, label }) => (
          <NavLink
            key={to} to={to} end={to === '/'}
            style={({ isActive }) => ({
              display: 'flex', alignItems: 'center', gap: 10,
              padding: '9px 12px',
              borderRadius: 10,
              textDecoration: 'none',
              fontSize: 14, fontWeight: 500,
              transition: 'all 0.15s',
              background: isActive ? 'rgba(108,99,255,0.1)' : 'transparent',
              color: isActive ? 'var(--color-primary)' : 'var(--text-secondary)',
              borderLeft: isActive ? '3px solid var(--color-primary)' : '3px solid transparent',
            })}
          >
            <span style={{ fontSize: 16, width: 20, textAlign: 'center' }}>{icon}</span>
            {label}
          </NavLink>
        ))}
      </nav>

      {/* P&L pill at bottom */}
      <div style={{ padding: '16px 20px', borderTop: '1px solid rgba(108,99,255,0.08)' }}>
        <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 4 }}>Net P&L</div>
        <div style={{
          fontSize: 18, fontWeight: 700,
          color: summary.netPL >= 0 ? 'var(--color-profit)' : 'var(--color-loss)',
        }}>
          {summary.netPL >= 0 ? '+' : ''}{fmtCurrency(summary.netPL)}
        </div>
      </div>
    </aside>
  )
}

function fmtCurrency(n) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n)
}
