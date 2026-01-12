import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import TimeBlockingView from './TimeBlockingView'

export default function DailyPlannerView({ dailyPlans, onUpdate }) {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [topPriorities, setTopPriorities] = useState(['', '', ''])
  const [reflection, setReflection] = useState('')
  const [timeBlocks, setTimeBlocks] = useState([])
  const [saving, setSaving] = useState(false)
  const [currentPlan, setCurrentPlan] = useState(null)
  const [showPlanList, setShowPlanList] = useState(false)

  function formatDate(date) {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  function isToday(date) {
    const today = new Date()
    return date.toDateString() === today.toDateString()
  }

  useEffect(() => {
    loadDailyPlan()
  }, [currentDate, dailyPlans])

  const loadDailyPlan = () => {
    const dateStr = currentDate.toISOString().split('T')[0]
    const plan = dailyPlans.find(p => p.date === dateStr)

    if (plan) {
      setCurrentPlan(plan)
      // Ensure we always have exactly 3 priority slots, even if saved with fewer
      const priorities = plan.top_priorities || []
      setTopPriorities([
        priorities[0] || '',
        priorities[1] || '',
        priorities[2] || ''
      ])
      setReflection(plan.reflection || '')
      setTimeBlocks(plan.time_blocks || [])
    } else {
      setCurrentPlan(null)
      setTopPriorities(['', '', ''])
      setReflection('')
      setTimeBlocks([])
    }
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      const dateStr = currentDate.toISOString().split('T')[0]

      // Filter out empty priorities
      const filteredPriorities = topPriorities.filter(p => p.trim() !== '')

      const { error } = await supabase
        .from('daily_plans')
        .upsert({
          user_id: user.id,
          date: dateStr,
          top_priorities: filteredPriorities,
          reflection: reflection || null,
          time_blocks: timeBlocks,
        }, { onConflict: 'user_id,date' })

      if (error) throw error

      await onUpdate()
    } catch (error) {
      console.error('Error saving daily plan:', error)
    } finally {
      setSaving(false)
    }
  }

  const navigateDay = (direction) => {
    const newDate = new Date(currentDate)
    newDate.setDate(newDate.getDate() + direction)
    setCurrentDate(newDate)
  }

  const updatePriority = (index, value) => {
    const updated = [...topPriorities]
    updated[index] = value
    setTopPriorities(updated)
  }

  const jumpToDate = (dateStr) => {
    setCurrentDate(new Date(dateStr))
    setShowPlanList(false)
  }

  return (
    <div className="space-y-6">
      {/* Info Card */}
      <div className="card p-6 bg-gradient-to-br from-control-primary/10 to-control-accent/10 border border-control-primary/20">
        <h3 className="text-xl font-bold text-gray-900 mb-2">Daily Planning</h3>
        <p className="text-gray-600">
          Plan your day with your top 3 priorities, time blocks for deep work, and end-of-day reflection.
        </p>
      </div>

      {/* Quick Access to Past Plans */}
      {dailyPlans.length > 0 && (
        <div className="card p-4">
          <button
            onClick={() => setShowPlanList(!showPlanList)}
            className="w-full flex items-center justify-between text-left hover:bg-gray-50 p-2 rounded-lg transition-colors"
          >
            <span className="font-medium text-gray-900">
              All Daily Plans ({dailyPlans.length})
            </span>
            <span className="text-gray-500">{showPlanList ? '▼' : '▶'}</span>
          </button>

          {showPlanList && (
            <div className="mt-4 space-y-2 max-h-96 overflow-y-auto">
              {dailyPlans.map((plan) => {
                const planDate = new Date(plan.date)
                const isCurrent = plan.date === currentDate.toISOString().split('T')[0]
                const isPlanToday = plan.date === new Date().toISOString().split('T')[0]

                return (
                  <div
                    key={plan.id}
                    onClick={() => jumpToDate(plan.date)}
                    className={`p-4 rounded-lg border-2 transition-all cursor-pointer ${
                      isCurrent
                        ? 'border-control-primary bg-control-primary/10'
                        : 'border-gray-200 hover:border-control-primary/50 hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="text-sm font-medium text-gray-900 mb-1">
                          {formatDate(planDate)}
                        </div>
                        {plan.top_priorities && plan.top_priorities.length > 0 && (
                          <div className="text-xs text-gray-600 mb-1">
                            {plan.top_priorities.length} priorit{plan.top_priorities.length !== 1 ? 'ies' : 'y'}
                          </div>
                        )}
                        {plan.reflection && (
                          <div className="text-xs text-gray-500 line-clamp-1">{plan.reflection}</div>
                        )}
                      </div>
                      {isPlanToday && (
                        <span className="text-xs px-2 py-1 rounded-full bg-control-primary text-white">
                          Today
                        </span>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      )}

      {/* Date Navigation */}
      <div className="card p-6">
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => navigateDay(-1)}
            className="w-10 h-10 rounded-full hover:bg-gray-100 flex items-center justify-center transition-colors"
          >
            ←
          </button>

          <div className="text-center">
            <h3 className="text-2xl font-bold text-gray-900">
              {formatDate(currentDate)}
            </h3>
            <p className="text-sm text-gray-500">
              {isToday(currentDate) ? 'Today' : currentDate > new Date() ? 'Future' : 'Past'}
            </p>
          </div>

          <button
            onClick={() => navigateDay(1)}
            className="w-10 h-10 rounded-full hover:bg-gray-100 flex items-center justify-center transition-colors"
          >
            →
          </button>
        </div>

        {/* Top 3 Priorities */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Top 3 Priorities
          </label>
          <div className="space-y-3">
            {topPriorities.map((priority, index) => (
              <div key={index} className="flex items-center gap-3">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-control-primary text-white flex items-center justify-center font-bold">
                  {index + 1}
                </div>
                <input
                  type="text"
                  value={priority}
                  onChange={(e) => updatePriority(index, e.target.value)}
                  placeholder={`Priority ${index + 1}`}
                  className="flex-1 px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-control-primary focus:border-transparent outline-none transition text-gray-900"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Time Blocking */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Time Blocks
          </label>
          <TimeBlockingView
            timeBlocks={timeBlocks}
            onChange={setTimeBlocks}
          />
        </div>

        {/* Daily Reflection */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Daily Reflection (End of Day)
          </label>
          <textarea
            value={reflection}
            onChange={(e) => setReflection(e.target.value)}
            placeholder="What went well? What could be improved? Key learnings?"
            rows={4}
            className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-control-primary focus:border-transparent outline-none transition resize-none text-gray-900"
          />
        </div>

        {/* Save Button */}
        <button
          onClick={handleSave}
          disabled={saving}
          className="w-full py-4 gradient-control text-white rounded-xl font-medium text-lg hover:scale-105 transition-transform disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
        >
          {saving ? 'Saving...' : 'Save Daily Plan'}
        </button>
      </div>
    </div>
  )
}
