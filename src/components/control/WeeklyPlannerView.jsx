import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'

export default function WeeklyPlannerView({ weeklyPlans, onUpdate }) {
  const [currentWeekStart, setCurrentWeekStart] = useState(getMonday(new Date()))
  const [theme, setTheme] = useState('')
  const [bigRocks, setBigRocks] = useState(['', '', ''])
  const [saving, setSaving] = useState(false)
  const [currentPlan, setCurrentPlan] = useState(null)
  const [showPlanList, setShowPlanList] = useState(false)

  // Get Monday of current week
  function getMonday(date) {
    const d = new Date(date)
    const day = d.getDay()
    const diff = d.getDate() - day + (day === 0 ? -6 : 1)
    return new Date(d.setDate(diff))
  }

  function formatWeekRange(weekStart) {
    const start = new Date(weekStart)
    const end = new Date(weekStart)
    end.setDate(end.getDate() + 6)

    const formatOptions = { month: 'short', day: 'numeric' }
    return `${start.toLocaleDateString('en-US', formatOptions)} - ${end.toLocaleDateString('en-US', formatOptions)}`
  }

  useEffect(() => {
    loadWeekPlan()
  }, [currentWeekStart, weeklyPlans])

  const loadWeekPlan = () => {
    const weekStartStr = currentWeekStart.toISOString().split('T')[0]
    const plan = weeklyPlans.find(p => p.week_start === weekStartStr)

    if (plan) {
      setCurrentPlan(plan)
      setTheme(plan.theme || '')
      setBigRocks(plan.big_rocks || ['', '', ''])
    } else {
      setCurrentPlan(null)
      setTheme('')
      setBigRocks(['', '', ''])
    }
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      const weekStartStr = currentWeekStart.toISOString().split('T')[0]

      // Filter out empty big rocks
      const filteredBigRocks = bigRocks.filter(rock => rock.trim() !== '')

      const { error } = await supabase
        .from('weekly_plans')
        .upsert({
          user_id: user.id,
          week_start: weekStartStr,
          theme: theme || null,
          big_rocks: filteredBigRocks,
        })

      if (error) throw error

      await onUpdate()
    } catch (error) {
      console.error('Error saving weekly plan:', error)
    } finally {
      setSaving(false)
    }
  }

  const navigateWeek = (direction) => {
    const newDate = new Date(currentWeekStart)
    newDate.setDate(newDate.getDate() + (direction * 7))
    setCurrentWeekStart(newDate)
  }

  const addBigRock = () => {
    if (bigRocks.length < 5) {
      setBigRocks([...bigRocks, ''])
    }
  }

  const updateBigRock = (index, value) => {
    const updated = [...bigRocks]
    updated[index] = value
    setBigRocks(updated)
  }

  const removeBigRock = (index) => {
    setBigRocks(bigRocks.filter((_, i) => i !== index))
  }

  const jumpToWeek = (weekStart) => {
    setCurrentWeekStart(new Date(weekStart))
    setShowPlanList(false)
  }

  return (
    <div className="space-y-6">
      {/* Info Card */}
      <div className="card p-6 bg-gradient-to-br from-control-primary/10 to-control-accent/10 border border-control-primary/20">
        <h3 className="text-xl font-bold text-gray-900 mb-2">Weekly Planning</h3>
        <p className="text-gray-600">
          Set a theme for your week and identify 3-5 "big rocks" - the most important things you
          want to accomplish this week.
        </p>
      </div>

      {/* Quick Access to Past Plans */}
      {weeklyPlans.length > 0 && (
        <div className="card p-4">
          <button
            onClick={() => setShowPlanList(!showPlanList)}
            className="w-full flex items-center justify-between text-left hover:bg-gray-50 p-2 rounded-lg transition-colors"
          >
            <span className="font-medium text-gray-900">
              All Weekly Plans ({weeklyPlans.length})
            </span>
            <span className="text-gray-500">{showPlanList ? '▼' : '▶'}</span>
          </button>

          {showPlanList && (
            <div className="mt-4 space-y-2 max-h-96 overflow-y-auto">
              {weeklyPlans.map((plan) => (
                <div
                  key={plan.id}
                  onClick={() => jumpToWeek(plan.week_start)}
                  className={`p-4 rounded-lg border-2 transition-all cursor-pointer ${
                    plan.week_start === currentWeekStart.toISOString().split('T')[0]
                      ? 'border-control-primary bg-control-primary/10'
                      : 'border-gray-200 hover:border-control-primary/50 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="text-sm font-medium text-gray-900 mb-1">
                        {formatWeekRange(new Date(plan.week_start))}
                      </div>
                      {plan.theme && (
                        <div className="text-sm text-gray-600 mb-2">{plan.theme}</div>
                      )}
                      {plan.big_rocks && plan.big_rocks.length > 0 && (
                        <div className="text-xs text-gray-500">
                          {plan.big_rocks.length} big rock{plan.big_rocks.length !== 1 ? 's' : ''}
                        </div>
                      )}
                    </div>
                    {plan.week_start === getMonday(new Date()).toISOString().split('T')[0] && (
                      <span className="text-xs px-2 py-1 rounded-full bg-control-primary text-white">
                        Current
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Week Navigation */}
      <div className="card p-6">
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => navigateWeek(-1)}
            className="w-10 h-10 rounded-full hover:bg-gray-100 flex items-center justify-center transition-colors"
          >
            ←
          </button>

          <div className="text-center">
            <h3 className="text-2xl font-bold text-gray-900">
              {formatWeekRange(currentWeekStart)}
            </h3>
            <p className="text-sm text-gray-500">
              {currentWeekStart.toISOString().split('T')[0] === getMonday(new Date()).toISOString().split('T')[0]
                ? 'Current Week'
                : currentWeekStart > new Date()
                ? 'Future Week'
                : 'Past Week'}
            </p>
          </div>

          <button
            onClick={() => navigateWeek(1)}
            className="w-10 h-10 rounded-full hover:bg-gray-100 flex items-center justify-center transition-colors"
          >
            →
          </button>
        </div>

        {/* Weekly Theme */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Weekly Theme
          </label>
          <input
            type="text"
            value={theme}
            onChange={(e) => setTheme(e.target.value)}
            placeholder="e.g., Focus on health, Family first, Ship the project"
            className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-control-primary focus:border-transparent outline-none transition text-gray-900"
          />
        </div>

        {/* Big Rocks */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <label className="block text-sm font-medium text-gray-700">
              Big Rocks (3-5 priorities)
            </label>
            {bigRocks.length < 5 && (
              <button
                onClick={addBigRock}
                className="text-sm text-control-primary hover:text-control-accent font-medium"
              >
                + Add Rock
              </button>
            )}
          </div>

          <div className="space-y-3">
            {bigRocks.map((rock, index) => (
              <div key={index} className="flex items-center gap-3">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-control-primary text-white flex items-center justify-center font-bold">
                  {index + 1}
                </div>
                <input
                  type="text"
                  value={rock}
                  onChange={(e) => updateBigRock(index, e.target.value)}
                  placeholder={`Priority ${index + 1}`}
                  className="flex-1 px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-control-primary focus:border-transparent outline-none transition text-gray-900"
                />
                {bigRocks.length > 3 && (
                  <button
                    onClick={() => removeBigRock(index)}
                    className="w-8 h-8 rounded-full hover:bg-red-100 flex items-center justify-center transition-colors text-red-600"
                  >
                    ✕
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Save Button */}
        <button
          onClick={handleSave}
          disabled={saving}
          className="w-full py-4 gradient-control text-white rounded-xl font-medium text-lg hover:scale-105 transition-transform disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
        >
          {saving ? 'Saving...' : 'Save Weekly Plan'}
        </button>
      </div>
    </div>
  )
}
