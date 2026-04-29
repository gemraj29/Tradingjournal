export default function StatCard({ label, value, sub, accent, icon }) {
  const colors = {
    profit: { bg: 'rgba(16,185,129,0.08)', text: '#10b981', border: 'rgba(16,185,129,0.2)' },
    loss:   { bg: 'rgba(239,68,68,0.08)',  text: '#ef4444', border: 'rgba(239,68,68,0.2)' },
    purple: { bg: 'rgba(108,99,255,0.08)', text: '#6c63ff', border: 'rgba(108,99,255,0.2)' },
    amber:  { bg: 'rgba(245,158,11,0.08)', text: '#f59e0b', border: 'rgba(245,158,11,0.2)' },
  }
  const c = colors[accent] || colors.purple

  return (
    <div className="glass" style={{
      padding: '20px 24px',
      display: 'flex', flexDirection: 'column', gap: 6,
      borderLeft: `3px solid ${c.border}`,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'space-between' }}>
        <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
          {label}
        </span>
        {icon && (
          <span style={{
            width: 30, height: 30, borderRadius: 8,
            background: c.bg, color: c.text,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 14,
          }}>{icon}</span>
        )}
      </div>
      <div style={{ fontSize: 26, fontWeight: 700, color: c.text, lineHeight: 1 }}>
        {value}
      </div>
      {sub && <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{sub}</div>}
    </div>
  )
}
