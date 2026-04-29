import { useState, useRef } from 'react'
import { useTrades } from '../context/TradesContext'
import { useNavigate } from 'react-router-dom'

export default function ImportPage() {
  const { importCSV, loading, error, clearAll, trades } = useTrades()
  const [dragOver, setDragOver] = useState(false)
  const [result, setResult] = useState(null)
  const inputRef = useRef()
  const navigate = useNavigate()

  const handleFiles = async (files) => {
    const file = files[0]
    if (!file) return
    setResult(null)
    try {
      const count = await importCSV(file)
      setResult({ success: true, count, file: file.name })
    } catch (e) {
      setResult({ success: false, error: e.message })
    }
  }

  return (
    <div style={{ padding: '32px 32px', maxWidth: 680 }}>
      <h1 style={{ fontSize: 24, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 4 }}>
        Import Trades
      </h1>
      <p style={{ color: 'var(--text-secondary)', marginBottom: 28, fontSize: 14 }}>
        Upload a Fidelity CSV export — supports options, stocks, and futures.
      </p>

      {/* Drop zone */}
      <div
        className="glass"
        onClick={() => inputRef.current.click()}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => { e.preventDefault(); setDragOver(false); handleFiles(e.dataTransfer.files) }}
        style={{
          border: `2px dashed ${dragOver ? 'var(--color-primary)' : 'rgba(108,99,255,0.25)'}`,
          borderRadius: 16,
          padding: '48px 32px',
          textAlign: 'center',
          cursor: 'pointer',
          transition: 'all 0.2s',
          background: dragOver ? 'rgba(108,99,255,0.05)' : 'rgba(255,255,255,0.5)',
        }}
      >
        <div style={{ fontSize: 40, marginBottom: 16 }}>📂</div>
        <div style={{ fontWeight: 600, fontSize: 16, color: 'var(--text-primary)', marginBottom: 8 }}>
          Drop your Fidelity CSV here
        </div>
        <div style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 16 }}>
          or click to browse files
        </div>
        <div style={{
          display: 'inline-flex', gap: 8,
        }}>
          {['STOCKS', 'OPTIONS', 'FUTURES'].map(t => (
            <span key={t} className="badge badge-tag">{t}</span>
          ))}
        </div>
        <input
          ref={inputRef} type="file" accept=".csv,text/csv"
          style={{ display: 'none' }}
          onChange={(e) => handleFiles(e.target.files)}
        />
      </div>

      {/* Loading */}
      {loading && (
        <div className="glass" style={{ marginTop: 16, padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{
            width: 18, height: 18, borderRadius: '50%',
            border: '2px solid var(--color-primary)',
            borderTopColor: 'transparent',
            animation: 'spin 0.8s linear infinite',
          }} />
          <span style={{ fontSize: 14, color: 'var(--text-secondary)' }}>Parsing CSV…</span>
        </div>
      )}

      {/* Result */}
      {result && !loading && (
        <div className="glass" style={{
          marginTop: 16, padding: '16px 20px',
          borderLeft: `3px solid ${result.success ? 'var(--color-profit)' : 'var(--color-loss)'}`,
        }}>
          {result.success ? (
            <div>
              <div style={{ fontWeight: 600, color: 'var(--color-profit)', marginBottom: 4 }}>
                ✓ Imported {result.count} trades from {result.file}
              </div>
              <button
                onClick={() => navigate('/')}
                style={{
                  marginTop: 8, padding: '8px 16px', borderRadius: 8,
                  background: 'var(--color-primary)', color: '#fff',
                  border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 600,
                }}
              >
                View Dashboard →
              </button>
            </div>
          ) : (
            <div style={{ color: 'var(--color-loss)', fontSize: 13 }}>
              ✗ {result.error}
            </div>
          )}
        </div>
      )}

      {error && !result && (
        <div className="glass" style={{
          marginTop: 16, padding: '16px 20px',
          borderLeft: '3px solid var(--color-loss)',
          color: 'var(--color-loss)', fontSize: 13,
        }}>✗ {error}</div>
      )}

      {/* Format guide */}
      <div className="glass" style={{ marginTop: 24, padding: '20px 24px' }}>
        <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 12 }}>Expected CSV Format</div>
        <div style={{
          background: 'rgba(108,99,255,0.04)',
          borderRadius: 8, padding: '12px 16px',
          fontFamily: 'monospace', fontSize: 12,
          color: 'var(--text-secondary)', lineHeight: 1.6,
        }}>
          Run Date,Action,Symbol,Description,Type,Quantity,Price,Amount<br/>
          03/27/2024,YOU BOUGHT,AAPL,APPLE INC,Cash,10,175.50,-1755.00<br/>
          03/26/2024,YOU SOLD,TSLA,TESLA INC,Cash,5,182.10,910.50<br/>
          03/25/2024,YOU BOUGHT,AAPL240315C00175000,CALL,Options,1,3.50,-350.00
        </div>
        <div style={{ marginTop: 12, fontSize: 12, color: 'var(--text-muted)' }}>
          Options are detected by OCC symbol format (e.g. AAPL240315C00175000).
          Futures start with / (e.g. /ES, /NQ). Multiple CSV files can be imported — duplicates are skipped.
        </div>
      </div>

      {/* Danger zone */}
      {trades.length > 0 && (
        <div style={{ marginTop: 24, paddingTop: 20, borderTop: '1px solid rgba(239,68,68,0.15)' }}>
          <div style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 10 }}>
            Currently loaded: <strong style={{ color: 'var(--text-primary)' }}>{trades.length} trades</strong>
          </div>
          <button
            onClick={() => { if (window.confirm('Clear all trade data?')) clearAll() }}
            style={{
              padding: '7px 14px', borderRadius: 8,
              background: 'rgba(239,68,68,0.08)',
              color: 'var(--color-loss)',
              border: '1px solid rgba(239,68,68,0.2)',
              cursor: 'pointer', fontSize: 13, fontWeight: 600,
            }}
          >
            Clear all data
          </button>
        </div>
      )}

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}
