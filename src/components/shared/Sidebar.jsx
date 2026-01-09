import { Link, useLocation } from 'react-router-dom'
import { supabase } from '../../lib/supabase'

const navigation = [
  { name: 'Dashboard', path: '/' },
  { name: 'Discipline', path: '/discipline', gradient: 'gradient-discipline' },
  { name: 'Values', path: '/values', gradient: 'gradient-values' },
  { name: 'Control', path: '/control', gradient: 'gradient-control' },
  { name: 'Vision', path: '/vision', gradient: 'gradient-vision' },
]

export default function Sidebar() {
  const location = useLocation()

  const handleSignOut = async () => {
    await supabase.auth.signOut()
  }

  return (
    <aside className="w-64 bg-cream-50 border-r border-cream-300 flex flex-col">
      {/* Header */}
      <div className="p-6 border-b border-cream-300">
        <h1 className="text-2xl font-display font-bold text-ink">
          Deep Life
        </h1>
        <p className="text-xs text-ink-light mt-1">4-Month Journey</p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1">
        {navigation.map((item) => {
          const isActive = location.pathname === item.path
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`
                flex items-center gap-3 px-4 py-3 rounded-md font-medium transition-all
                ${
                  isActive
                    ? 'bg-cream-200 text-ink border border-cream-400'
                    : 'text-ink-light hover:bg-cream-100 hover:text-ink'
                }
              `}
            >
              <span>{item.name}</span>
            </Link>
          )
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-cream-300">
        <button
          onClick={handleSignOut}
          className="w-full px-4 py-3 rounded-md font-medium text-ink-light hover:bg-cream-100 hover:text-ink transition-all"
        >
          Sign Out
        </button>
      </div>
    </aside>
  )
}
