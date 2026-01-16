import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import TimeBlockingView from './TimeBlockingView'

// Cal Newport's Shutdown Ritual checklist items
const shutdownChecklist = [
  { id: 'inbox', label: 'Review inbox and capture any tasks' },
  { id: 'calendar', label: 'Check calendar for upcoming commitments' },
  { id: 'tomorrow', label: 'Create or review tomorrow\'s plan' },
  { id: 'open_loops', label: 'Confirm no urgent open loops' },
]

export default function DailyPlannerView({ dailyPlans, onUpdate }) {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [topPriorities, setTopPriorities] = useState([''])
  const [reflection, setReflection] = useState('')
  const [tasksNotes, setTasksNotes] = useState('')
  const [ideasNotes, setIdeasNotes] = useState('')
  const [timeBlocks, setTimeBlocks] = useState([])
  const [saving, setSaving] = useState(false)
  const [currentPlan, setCurrentPlan] = useState(null)
  const [showPlanList, setShowPlanList] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [shutdownComplete, setShutdownComplete] = useState(null)
  const [shutdownChecks, setShutdownChecks] = useState({})
  const [weeklyBigRocks, setWeeklyBigRocks] = useState([])
  const [weeklyTheme, setWeeklyTheme] = useState('')
  const [showWeeklyContext, setShowWeeklyContext] = useState(true)

  // Get local date string in YYYY-MM-DD format (avoids timezone issues with toISOString)
  function getLocalDateString(date) {
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
  }

  // Parse a YYYY-MM-DD string as a local date (not UTC)
  function parseLocalDate(dateStr) {
    const [year, month, day] = dateStr.split('-').map(Number)
    return new Date(year, month - 1, day) // month is 0-indexed in JS Date
  }

  // Convert 24-hour time to 12-hour format with AM/PM
  function formatTime12Hour(time24) {
    if (!time24) return ''
    const [hours, minutes] = time24.split(':').map(Number)
    const period = hours >= 12 ? 'PM' : 'AM'
    const hours12 = hours % 12 || 12
    return `${hours12}:${minutes.toString().padStart(2, '0')} ${period}`
  }

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

  // Get Monday of the week containing a date
  function getMonday(date) {
    const d = new Date(date)
    const day = d.getDay()
    const diff = d.getDate() - day + (day === 0 ? -6 : 1)
    return new Date(d.setDate(diff))
  }

  // Format week range for display
  function formatWeekRange(weekStart) {
    const start = new Date(weekStart)
    const end = new Date(weekStart)
    end.setDate(end.getDate() + 6)
    const formatOptions = { month: 'short', day: 'numeric' }
    return `${start.toLocaleDateString('en-US', formatOptions)} - ${end.toLocaleDateString('en-US', formatOptions)}`
  }

  useEffect(() => {
    loadDailyPlan()
    loadWeeklyContext()
  }, [currentDate, dailyPlans])

  const loadWeeklyContext = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      const weekStart = getLocalDateString(getMonday(currentDate))

      const { data } = await supabase
        .from('weekly_plans')
        .select('big_rocks, theme')
        .eq('user_id', user.id)
        .eq('week_start', weekStart)
        .single()

      setWeeklyBigRocks(data?.big_rocks || [])
      setWeeklyTheme(data?.theme || '')
    } catch (error) {
      // No weekly plan found is okay
      setWeeklyBigRocks([])
      setWeeklyTheme('')
    }
  }

  const loadDailyPlan = () => {
    const dateStr = getLocalDateString(currentDate)
    const plan = dailyPlans.find(p => p.date === dateStr)

    if (plan) {
      setCurrentPlan(plan)
      // Load saved priorities, or start with one empty slot if none saved
      const priorities = plan.top_priorities || []
      setTopPriorities(priorities.length > 0 ? priorities : [''])
      setReflection(plan.reflection || '')
      setTasksNotes(plan.tasks_notes || '')
      setIdeasNotes(plan.ideas_notes || '')
      setTimeBlocks(plan.time_blocks || [])
      setShutdownComplete(plan.shutdown_complete || null)
      setShutdownChecks(plan.shutdown_checks || {})
      setIsEditing(false) // View mode for saved plans
    } else {
      setCurrentPlan(null)
      setTopPriorities(['']) // Start with 1 priority slot
      setReflection('')
      setTasksNotes('')
      setIdeasNotes('')
      setTimeBlocks([])
      setShutdownComplete(null)
      setShutdownChecks({})
      setIsEditing(true) // Edit mode for new plans
    }
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      const dateStr = getLocalDateString(currentDate)

      // Filter out empty priorities
      const filteredPriorities = topPriorities.filter(p => p.trim() !== '')

      const { error } = await supabase
        .from('daily_plans')
        .upsert({
          user_id: user.id,
          date: dateStr,
          top_priorities: filteredPriorities,
          reflection: reflection || null,
          tasks_notes: tasksNotes || null,
          ideas_notes: ideasNotes || null,
          time_blocks: timeBlocks,
          shutdown_complete: shutdownComplete,
          shutdown_checks: shutdownChecks,
        }, { onConflict: 'user_id,date' })

      if (error) throw error

      await onUpdate()
      setIsEditing(false) // Return to view mode after saving
    } catch (error) {
      console.error('Error saving daily plan:', error)
    } finally {
      setSaving(false)
    }
  }

  const handleCancel = () => {
    if (currentPlan) {
      // Revert to saved values
      const priorities = currentPlan.top_priorities || []
      setTopPriorities(priorities.length > 0 ? priorities : [''])
      setReflection(currentPlan.reflection || '')
      setTasksNotes(currentPlan.tasks_notes || '')
      setIdeasNotes(currentPlan.ideas_notes || '')
      setTimeBlocks(currentPlan.time_blocks || [])
      setShutdownComplete(currentPlan.shutdown_complete || null)
      setShutdownChecks(currentPlan.shutdown_checks || {})
    }
    setIsEditing(false)
  }

  const toggleShutdownCheck = (checkId) => {
    setShutdownChecks(prev => ({
      ...prev,
      [checkId]: !prev[checkId]
    }))
  }

  const handleShutdownComplete = async () => {
    const now = new Date().toISOString()
    setShutdownComplete(now)

    // Auto-save the shutdown completion
    try {
      const { data: { user } } = await supabase.auth.getUser()
      const dateStr = getLocalDateString(currentDate)

      const filteredPriorities = topPriorities.filter(p => p.trim() !== '')

      await supabase
        .from('daily_plans')
        .upsert({
          user_id: user.id,
          date: dateStr,
          top_priorities: filteredPriorities,
          reflection: reflection || null,
          tasks_notes: tasksNotes || null,
          ideas_notes: ideasNotes || null,
          time_blocks: timeBlocks,
          shutdown_complete: now,
          shutdown_checks: shutdownChecks,
        }, { onConflict: 'user_id,date' })

      await onUpdate()
    } catch (error) {
      console.error('Error saving shutdown:', error)
    }
  }

  const allChecksComplete = shutdownChecklist.every(item => shutdownChecks[item.id])

  const addPriority = () => {
    if (topPriorities.length < 3) {
      setTopPriorities([...topPriorities, ''])
    }
  }

  const removePriority = (index) => {
    if (topPriorities.length > 1) {
      setTopPriorities(topPriorities.filter((_, i) => i !== index))
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
    setCurrentDate(parseLocalDate(dateStr))
    setShowPlanList(false)
  }

  return (
    <div className="space-y-6">
      {/* Weekly Context - Reference from higher planning scale */}
      <div className="card p-4 bg-blue-50 border-blue-200">
        <button
          onClick={() => setShowWeeklyContext(!showWeeklyContext)}
          className="w-full flex items-center justify-between text-left"
        >
          <div className="flex items-center gap-2">
            <span className="text-blue-600 font-medium">
              Week of {formatWeekRange(getMonday(currentDate))}
            </span>
            <span className="text-xs text-blue-500">
              (weekly context)
            </span>
          </div>
          <span className="text-blue-400">{showWeeklyContext ? '▼' : '▶'}</span>
        </button>

        {showWeeklyContext && (
          <div className="mt-3 pt-3 border-t border-blue-200">
            {weeklyTheme && (
              <p className="text-sm text-blue-700 mb-2">
                <span className="font-medium">Theme:</span> {weeklyTheme}
              </p>
            )}
            {weeklyBigRocks.length > 0 ? (
              <>
                <p className="text-xs text-blue-500 mb-1 font-medium">Big Rocks:</p>
                <ul className="space-y-1">
                  {weeklyBigRocks.map((rock, index) => (
                    <li key={index} className="flex items-start gap-2 text-sm text-blue-800">
                      <span className="text-blue-400 mt-0.5">•</span>
                      <span>{rock}</span>
                    </li>
                  ))}
                </ul>
              </>
            ) : (
              <p className="text-sm text-blue-600 italic">
                No weekly plan set. <a href="?tab=weekly" className="underline hover:text-blue-800">Create one in Weekly Planning</a>
              </p>
            )}
          </div>
        )}
      </div>

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

        {/* View Mode */}
        {!isEditing && currentPlan ? (
          <>
            {/* Top Priorities - View Mode */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Top Priorities
              </label>
              <div className="space-y-2">
                {currentPlan.top_priorities && currentPlan.top_priorities.length > 0 ? (
                  currentPlan.top_priorities.map((priority, index) => (
                    <div key={index} className="flex items-center gap-3">
                      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-control-primary text-white flex items-center justify-center font-bold">
                        {index + 1}
                      </div>
                      <span className="text-gray-900">{priority}</span>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500 italic">No priorities set</p>
                )}
              </div>
            </div>

            {/* Tasks and Ideas - View Mode */}
            {(currentPlan.tasks_notes || currentPlan.ideas_notes) && (
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tasks
                  </label>
                  {currentPlan.tasks_notes ? (
                    <p className="text-gray-900 whitespace-pre-wrap bg-gray-50 p-4 rounded-xl text-sm">
                      {currentPlan.tasks_notes}
                    </p>
                  ) : (
                    <p className="text-gray-500 italic text-sm">No tasks noted</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Ideas
                  </label>
                  {currentPlan.ideas_notes ? (
                    <p className="text-gray-900 whitespace-pre-wrap bg-gray-50 p-4 rounded-xl text-sm">
                      {currentPlan.ideas_notes}
                    </p>
                  ) : (
                    <p className="text-gray-500 italic text-sm">No ideas noted</p>
                  )}
                </div>
              </div>
            )}

            {/* Time Blocks - View Mode */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Time Blocks
              </label>
              {currentPlan.time_blocks && currentPlan.time_blocks.length > 0 ? (
                <div className="space-y-2">
                  {currentPlan.time_blocks.map((block, index) => (
                    <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                      <span className="text-sm font-medium text-gray-600 min-w-[140px]">
                        {formatTime12Hour(block.start)} - {formatTime12Hour(block.end)}
                      </span>
                      <span className="text-gray-900">{block.title}</span>
                      {block.category && (
                        <span className="text-xs px-2 py-1 rounded-full bg-control-primary/20 text-control-primary">
                          {block.category}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 italic">No time blocks scheduled</p>
              )}
            </div>

            {/* Daily Reflection - View Mode */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Daily Reflection
              </label>
              {currentPlan.reflection ? (
                <p className="text-gray-900 whitespace-pre-wrap bg-gray-50 p-4 rounded-xl">
                  {currentPlan.reflection}
                </p>
              ) : (
                <p className="text-gray-500 italic">No reflection added</p>
              )}
            </div>

            {/* Edit Button */}
            <button
              onClick={() => setIsEditing(true)}
              className="w-full py-4 border-2 border-control-primary text-control-primary rounded-xl font-medium text-lg hover:bg-control-primary/10 transition-colors"
            >
              Edit Plan
            </button>
          </>
        ) : (
          <>
            {/* Top Priorities - Edit Mode */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-3">
                <label className="block text-sm font-medium text-gray-700">
                  Top Priorities
                </label>
                {topPriorities.length < 3 && (
                  <button
                    onClick={addPriority}
                    className="text-sm text-control-primary hover:text-control-accent font-medium"
                  >
                    + Add Priority
                  </button>
                )}
              </div>
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
                    {topPriorities.length > 1 && (
                      <button
                        onClick={() => removePriority(index)}
                        className="w-8 h-8 rounded-full hover:bg-red-100 flex items-center justify-center transition-colors text-red-600"
                      >
                        ✕
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Tasks and Ideas - Edit Mode */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tasks
                </label>
                <textarea
                  value={tasksNotes}
                  onChange={(e) => setTasksNotes(e.target.value)}
                  placeholder="Jot down tasks for later..."
                  rows={4}
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-control-primary focus:border-transparent outline-none transition resize-none text-gray-900"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Ideas
                </label>
                <textarea
                  value={ideasNotes}
                  onChange={(e) => setIdeasNotes(e.target.value)}
                  placeholder="Capture ideas to explore..."
                  rows={4}
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-control-primary focus:border-transparent outline-none transition resize-none text-gray-900"
                />
              </div>
            </div>

            {/* Time Blocking - Edit Mode */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Time Blocks
              </label>
              <TimeBlockingView
                timeBlocks={timeBlocks}
                onChange={setTimeBlocks}
              />
            </div>

            {/* Daily Reflection - Edit Mode */}
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

            {/* Save and Cancel Buttons */}
            <div className="flex gap-3">
              {currentPlan && (
                <button
                  onClick={handleCancel}
                  className="flex-1 py-4 border-2 border-gray-300 text-gray-700 rounded-xl font-medium text-lg hover:bg-gray-100 transition-colors"
                >
                  Cancel
                </button>
              )}
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex-1 py-4 gradient-control text-white rounded-xl font-medium text-lg hover:scale-105 transition-transform disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
              >
                {saving ? 'Saving...' : 'Save Daily Plan'}
              </button>
            </div>
          </>
        )}
      </div>

      {/* Shutdown Ritual - Only show for today or past dates with a plan */}
      {(isToday(currentDate) || (currentPlan && currentDate < new Date())) && (
        <div className="card p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center">
              <span className="text-xl">🌅</span>
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900">Shutdown Ritual</h3>
              <p className="text-sm text-gray-500">End your workday with intention</p>
            </div>
          </div>

          {shutdownComplete ? (
            <div className="p-4 bg-green-50 rounded-xl border border-green-200">
              <div className="flex items-center gap-2 text-green-700 font-medium mb-1">
                <span>✓</span>
                <span>Shutdown Complete</span>
              </div>
              <p className="text-sm text-green-600">
                Completed at {new Date(shutdownComplete).toLocaleTimeString('en-US', {
                  hour: 'numeric',
                  minute: '2-digit',
                  hour12: true
                })}
              </p>
            </div>
          ) : (
            <>
              <p className="text-sm text-gray-600 mb-4">
                Cal Newport's shutdown ritual helps you mentally close out the workday
                so you can fully rest and recharge.
              </p>

              <div className="space-y-3 mb-4">
                {shutdownChecklist.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => toggleShutdownCheck(item.id)}
                    className={`w-full flex items-center gap-3 p-3 rounded-lg border-2 transition-all text-left ${
                      shutdownChecks[item.id]
                        ? 'border-amber-400 bg-amber-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
                      shutdownChecks[item.id]
                        ? 'border-amber-500 bg-amber-500 text-white'
                        : 'border-gray-300'
                    }`}>
                      {shutdownChecks[item.id] && <span className="text-xs">✓</span>}
                    </div>
                    <span className={`text-sm ${shutdownChecks[item.id] ? 'text-gray-700' : 'text-gray-600'}`}>
                      {item.label}
                    </span>
                  </button>
                ))}
              </div>

              <button
                onClick={handleShutdownComplete}
                disabled={!allChecksComplete}
                className="w-full py-4 bg-amber-500 text-white rounded-xl font-medium text-lg hover:bg-amber-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {allChecksComplete ? '"Shutdown Complete"' : 'Complete all steps first'}
              </button>
            </>
          )}
        </div>
      )}

      {/* All Daily Plans */}
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
                const planDate = parseLocalDate(plan.date)
                const isCurrent = plan.date === getLocalDateString(currentDate)
                const isPlanToday = plan.date === getLocalDateString(new Date())

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
    </div>
  )
}
