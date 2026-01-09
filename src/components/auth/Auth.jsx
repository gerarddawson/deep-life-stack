import { useState } from 'react'
import { supabase } from '../../lib/supabase'

export default function Auth({ onBack }) {
  const [loading, setLoading] = useState(false)
  const [isSignUp, setIsSignUp] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState(null)
  const [message, setMessage] = useState(null)

  const handleAuth = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setMessage(null)

    try {
      if (isSignUp) {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
        })
        if (error) throw error

        // Manually create journey for new user
        if (data.user) {
          const { error: journeyError } = await supabase
            .from('journeys')
            .insert({ user_id: data.user.id })

          if (journeyError) {
            console.error('Journey creation error:', journeyError)
            // Don't throw - user is created, journey can be created later
          }
        }

        setMessage('Account created! You can now log in.')
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        })
        if (error) throw error
      }
    } catch (error) {
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-discipline-primary via-values-primary to-vision-primary p-4">
      <div className="w-full max-w-md">
        {/* Back Button */}
        {onBack && (
          <button
            onClick={onBack}
            className="mb-4 flex items-center gap-2 text-white/90 hover:text-white transition-colors"
          >
            <span>←</span>
            <span>Back to Home</span>
          </button>
        )}

        <div className="card p-8">
          {/* Logo/Title */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-display font-bold text-ink mb-2">
              Deep Life Stack
            </h1>
            <p className="text-ink-light">Cal Newport's 4-Month Journey</p>
          </div>

          {/* Tab Switcher */}
          <div className="flex rounded-md bg-cream-200 p-1 mb-6">
            <button
              className={`flex-1 py-2 px-4 rounded font-medium transition-all ${
                !isSignUp
                  ? 'bg-cream-50 shadow-sm text-ink'
                  : 'text-ink-light hover:text-ink'
              }`}
              onClick={() => setIsSignUp(false)}
            >
              Sign In
            </button>
            <button
              className={`flex-1 py-2 px-4 rounded font-medium transition-all ${
                isSignUp
                  ? 'bg-cream-50 shadow-sm text-ink'
                  : 'text-ink-light hover:text-ink'
              }`}
              onClick={() => setIsSignUp(true)}
            >
              Sign Up
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleAuth} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-ink mb-1">
                Email
              </label>
              <input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-3 rounded-md border border-cream-300 focus:ring-2 focus:ring-discipline-primary focus:border-transparent outline-none transition bg-white"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-ink mb-1">
                Password
              </label>
              <input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-4 py-3 rounded-md border border-cream-300 focus:ring-2 focus:ring-discipline-primary focus:border-transparent outline-none transition bg-white"
              />
              {isSignUp && (
                <p className="text-xs text-ink-light mt-1">
                  Minimum 6 characters
                </p>
              )}
            </div>

            {error && (
              <div className="p-3 rounded bg-red-50 border border-red-200">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            {message && (
              <div className="p-3 rounded bg-green-50 border border-green-200">
                <p className="text-sm text-green-600">{message}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full btn-primary gradient-discipline text-white disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Loading...' : isSignUp ? 'Create Account' : 'Sign In'}
            </button>
          </form>

          {/* Footer */}
          <div className="mt-6 text-center text-sm text-ink-light">
            {isSignUp ? (
              <p>
                By signing up, you agree to start your 4-month Deep Life journey
              </p>
            ) : (
              <p>
                Welcome back! Continue your journey.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
