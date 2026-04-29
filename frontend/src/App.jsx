import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { TradesProvider } from './context/TradesContext'
import Sidebar from './components/Sidebar'
import DashboardPage from './pages/DashboardPage'
import CalendarPage   from './pages/CalendarPage'
import TradesPage     from './pages/TradesPage'
import OptionsPage    from './pages/OptionsPage'
import ImportPage     from './pages/ImportPage'

export default function App() {
  return (
    <TradesProvider>
      <BrowserRouter>
        <div style={{ display: 'flex', minHeight: '100vh' }}>
          <Sidebar />
          <main style={{
            marginLeft: 'var(--sidebar-width)',
            flex: 1,
            minHeight: '100vh',
            overflowY: 'auto',
          }}>
            <Routes>
              <Route path="/"          element={<DashboardPage />} />
              <Route path="/calendar"  element={<CalendarPage />} />
              <Route path="/trades"    element={<TradesPage />} />
              <Route path="/positions" element={<OptionsPage />} />
              <Route path="/import"    element={<ImportPage />} />
            </Routes>
          </main>
        </div>
      </BrowserRouter>
    </TradesProvider>
  )
}
