import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { supabase } from './lib/supabase'
import LandingPage from './components/landing/LandingPage'
import Auth from './components/auth/Auth'
import Dashboard from './components/dashboard/Dashboard'
import DisciplineLayer from './components/discipline/DisciplineLayer'
import ValuesLayer from './components/values/ValuesLayer'
import ControlLayer from './components/control/ControlLayer'
import VisionLayer from './components/vision/VisionLayer'
import Sidebar from './components/shared/Sidebar'

function App() {
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(true)
  const [showAuth, setShowAuth] = useState(false)

  useEffect(() => {
    // Check active session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setLoading(false)
    })

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
      if (session) {
        setShowAuth(false) // Reset to landing page for next sign out
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-cream-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-discipline-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-ink-light">Loading...</p>
        </div>
      </div>
    )
  }

  if (!session) {
    if (showAuth) {
      return <Auth onBack={() => setShowAuth(false)} />
    }
    return <LandingPage onGetStarted={() => setShowAuth(true)} />
  }

  return (
    <Router>
      <div className="flex h-screen bg-gray-50">
        <Sidebar />
        <main className="flex-1 overflow-auto">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/discipline" element={<DisciplineLayer />} />
            <Route path="/values" element={<ValuesLayer />} />
            <Route path="/control" element={<ControlLayer />} />
            <Route path="/vision" element={<VisionLayer />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>
    </Router>
  )
}

export default App
