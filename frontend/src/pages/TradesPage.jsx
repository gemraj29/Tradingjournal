import { useState, useMemo, useRef } from 'react'
import { useTrades } from '../context/TradesContext'

const fmt = (n) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 2 }).format(n)

const TAG_COLORS = [
  '#6c63ff', '#10b981', '#ef4444', '#f59e0b', '#3b82f6',
  '#ec4899', '#8b5cf6', '#06b6d4', '#84cc16', '#f97316',
]

function tagColor(tag) {
  let hash = 0
  for (let i = 0; i < tag.length; i++) hash = tag.charCodeAt(i) + ((hash << 5) - hash)
  return TAG_COLORS[Math.abs(hash) % TAG_COLORS.length]
}

export default function TradesPage() {
  const { trades, globalTags, addTag, removeTag, updateTrade } = useTrades()
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState('ALL')
  const [instrFilter, setInstrFilter] = useState('ALL')
  const [tagFilter, setTagFilter] = useState(null)
  const [sortKey, setSortKey] = useState('date')
  const [sortDir, setSortDir] = useState('desc')
  const [editNoteId, setEditNoteId] = useState(null)
  const noteRef = useRef()

  const filtered = useMemo(() => {
    return trades
      .filter(t => {
        if (search) {
          const q = search.toLowerCase()
          if (!t.symbol.toLowerCase().includes(q) &&
              !(t.notes || '').toLowerCase().includes(q) &&
              !t.tags.some(tg => tg.includes(q))) return false
        }
        if (typeFilter !== 'ALL' && t.tradeType !== typeFilter) return false
        if (instrFilter !== 'ALL' && t.instrumentType !== instrFilter) return false
        if (tagFilter && !t.tags.includes(tagFilter)) return false
        return true
      })
      .sort((a, b) => {
        let av = a[sortKey], bv = b[sortKey]
        if (sortKey === 'profitLoss') { av = av || 0; bv = bv || 0 }
        if (av < bv) return sortDir === 'asc' ? -1 : 1
        if (av > bv) return sortDir === 'asc' ? 1 : -1
        return 0
      })
  }, [trades, search, typeFilter, instrFilter, tagFilter, sortKey, sortDir])

  const totalPL = filtered.reduce((s, t) => s + (t.profitLoss || 0), 0)

  const handleSort = (key) => {
    if (sortKey === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc')
    else { setSortKey(key); setSortDir('desc') }
  }

  return (
    <div style={{ padding: '32px 32px', display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div>
        <h1 style={{ fontSize: 24, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 4 }}>Trades</h1>
        <p style={{ fontSize: 14, color: 'var(--text-muted)' }}>{filtered.length} of {trades.length} trades · {totalPL >= 0 ? '+' : ''}{fmt(totalPL)} filtered P&L</p>
      </div>

      {/* Filters */}
      <div className="glass" style={{ padding: '16px 20px', display: 'flex', flexWrap: 'wrap', gap: 12, alignItems: 'center' }}>
        {/* Search */}
        <input
          value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Search symbol, notes, tags…"
          style={{
            flex: '1 1 200px', padding: '8px 14px', borderRadius: 8,
            border: '1px solid rgba(108,99,255,0.2)', background: 'rgba(255,255,255,0.7)',
            fontSize: 13, color: 'var(--text-primary)', outline: 'none',
          }}
        />

        {/* Type filter */}
        <FilterGroup options={['ALL','BUY','SELL','ROLL','EXERCISE']} value={typeFilter} onChange={setTypeFilter} />

        {/* Instrument filter */}
        <FilterGroup options={['ALL','STOCK','OPTION','FUTURE']} value={instrFilter} onChange={setInstrFilter} />

        {/* Tag filter */}
        {globalTags.length > 0 && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
            {globalTags.map(tag => (
              <button key={tag} onClick={() => setTagFilter(f => f === tag ? null : tag)}
                style={{
                  padding: '3px 10px', borderRadius: 999, fontSize: 11, fontWeight: 600,
                  border: 'none', cursor: 'pointer', transition: 'all 0.15s',
                  background: tagFilter === tag ? tagColor(tag) : `${tagColor(tag)}1a`,
                  color: tagFilter === tag ? '#fff' : tagColor(tag),
                }}>
                {tag}
              </button>
            ))}
            {tagFilter && (
              <button onClick={() => setTagFilter(null)}
                style={{ padding: '3px 8px', borderRadius: 999, fontSize: 11, border: 'none', cursor: 'pointer', background: 'rgba(0,0,0,0.06)', color: 'var(--text-muted)' }}>
                ✕ clear
              </button>
            )}
          </div>
        )}
      </div>

      {/* Table */}
      <div className="glass" style={{ overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr style={{ background: 'rgba(108,99,255,0.04)' }}>
                {[
                  { key: 'date',           label: 'Date' },
                  { key: 'symbol',         label: 'Symbol' },
                  { key: 'instrumentType', label: 'Type' },
                  { key: 'tradeType',      label: 'Action' },
                  { key: 'quantity',       label: 'Qty' },
                  { key: 'price',          label: 'Price' },
                  { key: 'profitLoss',     label: 'P&L' },
                  { key: null,             label: 'Tags' },
                  { key: null,             label: 'Notes' },
                ].map(({ key, label }) => (
                  <th key={label}
                    onClick={key ? () => handleSort(key) : undefined}
                    style={{
                      textAlign: 'left', padding: '11px 14px',
                      fontWeight: 600, fontSize: 11, color: 'var(--text-muted)',
                      textTransform: 'uppercase', letterSpacing: '0.05em',
                      borderBottom: '1px solid rgba(0,0,0,0.06)',
                      cursor: key ? 'pointer' : 'default',
                      whiteSpace: 'nowrap',
                      userSelect: 'none',
                    }}>
                    {label}{key && sortKey === key ? (sortDir === 'asc' ? ' ↑' : ' ↓') : ''}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map(t => (
                <TradeRow key={t.id} trade={t}
                  onAddTag={(tag) => addTag(t.id, tag)}
                  onRemoveTag={(tag) => removeTag(t.id, tag)}
                  editingNote={editNoteId === t.id}
                  onEditNote={() => setEditNoteId(t.id)}
                  onSaveNote={(val) => { updateTrade(t.id, { notes: val }); setEditNoteId(null) }}
                  noteRef={noteRef}
                />
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-muted)', fontSize: 14 }}>
              {trades.length === 0 ? 'No trades yet — import a CSV to get started.' : 'No trades match your filters.'}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function TradeRow({ trade: t, onAddTag, onRemoveTag, editingNote, onEditNote, onSaveNote, noteRef }) {
  const [tagInput, setTagInput] = useState('')
  const [showTagInput, setShowTagInput] = useState(false)

  const handleTagSubmit = (e) => {
    e.preventDefault()
    if (tagInput.trim()) {
      onAddTag(tagInput.trim())
      setTagInput('')
      setShowTagInput(false)
    }
  }

  return (
    <tr style={{ borderBottom: '1px solid rgba(0,0,0,0.04)', transition: 'background 0.1s' }}
      onMouseEnter={e => e.currentTarget.style.background = 'rgba(108,99,255,0.02)'}
      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>

      <td style={{ padding: '10px 14px', color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>{t.date}</td>

      <td style={{ padding: '10px 14px' }}>
        <span style={{ fontWeight: 600, color: 'var(--text-primary)', fontFamily: 'monospace', fontSize: 12 }}
          title={t.description}>{t.symbol}</span>
      </td>

      <td style={{ padding: '10px 14px' }}>
        <span style={{
          padding: '2px 7px', borderRadius: 5, fontSize: 10, fontWeight: 700,
          background: t.instrumentType === 'OPTION' ? 'rgba(108,99,255,0.1)' :
                      t.instrumentType === 'FUTURE' ? 'rgba(245,158,11,0.1)' : 'rgba(16,185,129,0.1)',
          color: t.instrumentType === 'OPTION' ? '#6c63ff' :
                 t.instrumentType === 'FUTURE' ? '#f59e0b' : '#10b981',
        }}>{t.instrumentType}</span>
      </td>

      <td style={{ padding: '10px 14px' }}>
        <span className={`badge ${t.tradeType === 'BUY' ? 'badge-loss' : 'badge-profit'}`}>
          {t.tradeType}
        </span>
      </td>

      <td style={{ padding: '10px 14px', color: 'var(--text-primary)', fontWeight: 500 }}>{t.quantity}</td>

      <td style={{ padding: '10px 14px', fontFamily: 'monospace', color: 'var(--text-secondary)' }}>
        {fmt(t.price)}
      </td>

      <td style={{ padding: '10px 14px', fontWeight: 700,
        color: (t.profitLoss || 0) >= 0 ? 'var(--color-profit)' : 'var(--color-loss)' }}>
        {(t.profitLoss || 0) !== 0 ? `${t.profitLoss >= 0 ? '+' : ''}${fmt(t.profitLoss)}` : '—'}
      </td>

      {/* Tags */}
      <td style={{ padding: '10px 14px', minWidth: 160 }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, alignItems: 'center' }}>
          {t.tags.map(tag => (
            <span key={tag} style={{
              display: 'inline-flex', alignItems: 'center', gap: 4,
              padding: '2px 8px', borderRadius: 999, fontSize: 11, fontWeight: 600,
              background: `${tagColor(tag)}1a`, color: tagColor(tag),
            }}>
              {tag}
              <button onClick={() => onRemoveTag(tag)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'inherit', fontSize: 10, padding: 0, lineHeight: 1 }}>✕</button>
            </span>
          ))}
          {showTagInput ? (
            <form onSubmit={handleTagSubmit} style={{ display: 'flex', gap: 4 }}>
              <input autoFocus value={tagInput} onChange={e => setTagInput(e.target.value)}
                onBlur={() => { if (!tagInput) setShowTagInput(false) }}
                placeholder="tag…" style={{
                  width: 72, padding: '2px 6px', borderRadius: 6, fontSize: 11,
                  border: '1px solid rgba(108,99,255,0.3)', background: 'rgba(255,255,255,0.9)',
                  color: 'var(--text-primary)', outline: 'none',
                }} />
            </form>
          ) : (
            <button onClick={() => setShowTagInput(true)} style={{
              padding: '2px 7px', borderRadius: 999, fontSize: 11, fontWeight: 600,
              border: '1px dashed rgba(108,99,255,0.3)', background: 'none',
              color: 'var(--color-primary)', cursor: 'pointer',
            }}>+ tag</button>
          )}
        </div>
      </td>

      {/* Notes */}
      <td style={{ padding: '10px 14px', minWidth: 140 }}>
        {editingNote ? (
          <input
            ref={noteRef} defaultValue={t.notes || ''}
            autoFocus
            onBlur={(e) => onSaveNote(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') onSaveNote(e.target.value) }}
            style={{
              width: '100%', padding: '4px 8px', borderRadius: 6, fontSize: 12,
              border: '1px solid rgba(108,99,255,0.3)', background: 'rgba(255,255,255,0.9)',
              color: 'var(--text-primary)', outline: 'none',
            }}
          />
        ) : (
          <span
            onClick={onEditNote}
            style={{ fontSize: 12, color: t.notes ? 'var(--text-secondary)' : 'var(--text-muted)',
              cursor: 'pointer', fontStyle: t.notes ? 'normal' : 'italic' }}>
            {t.notes || 'add note…'}
          </span>
        )}
      </td>
    </tr>
  )
}

function FilterGroup({ options, value, onChange }) {
  return (
    <div style={{ display: 'flex', gap: 4, background: 'rgba(0,0,0,0.04)', borderRadius: 8, padding: 3 }}>
      {options.map(opt => (
        <button key={opt} onClick={() => onChange(opt)} style={{
          padding: '5px 10px', borderRadius: 6, border: 'none', cursor: 'pointer',
          fontSize: 11, fontWeight: 600,
          background: value === opt ? '#6c63ff' : 'transparent',
          color: value === opt ? '#fff' : 'var(--text-secondary)',
          transition: 'all 0.15s',
        }}>{opt}</button>
      ))}
    </div>
  )
}
