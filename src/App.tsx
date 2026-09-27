import { useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { AuthProvider } from './contexts/AuthContext'
import { Layout } from './components/Layout'
import { Dashboard } from './pages/Dashboard'
import { Players } from './pages/Players'
import { PlayerDetail } from './pages/PlayerDetail'
import { MatchPerformances } from './pages/MatchPerformances'
import { Reports } from './pages/Reports'
import { Analytics } from './pages/Analytics'
import { Settings } from './pages/Settings'
import { initializeData } from './lib/localData'

function App() {
  // Initialize data on first load
  useEffect(() => {
    initializeData()
  }, [])

  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-gray-50">
          <Layout>
            <Routes>
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/players" element={<Players />} />
              <Route path="/players/:id" element={<PlayerDetail />} />
              <Route path="/match-performances" element={<MatchPerformances />} />
              <Route path="/reports" element={<Reports />} />
              <Route path="/analytics" element={<Analytics />} />
              <Route path="/settings/*" element={<Settings />} />
            </Routes>
          </Layout>
          <Toaster position="top-right" />
        </div>
      </Router>
    </AuthProvider>
  )
}

export default App