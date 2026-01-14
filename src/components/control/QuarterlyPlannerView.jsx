import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'

export default function QuarterlyPlannerView({ onUpdate }) {
  const [currentQuarter, setCurrentQuarter] = useState(getCurrentQuarter())
  const [objectives, setObjectives] = useState(['', '', ''])
  const [reflection, setReflection] = useState('')
  const [saving, setSaving] = useState(false)
  const [currentPlan, setCurrentPlan] = useState(null)
  const [isEditing, setIsEditing] = useState(false)
  const [allPlans, setAllPlans] = useState([])
  const [showPlanList, setShowPlanList] = useState(false)

  // Get current quarter info
  function getCurrentQuarter() {
    const now = new Date()
    const quarter = Math.floor(now.getMonth() / 3) + 1
    const year = now.getFullYear()
    return { quarter, year }
  }

  // Get quarter start date string
  function getQuarterStartDate(q, y) {
    const month = (q - 1) * 3
    return `${y}-${String(month + 1).padStart(2, '0')}-01`
  }

  // Format quarter for display
  function formatQuarter(q, y) {
    const quarterNames = ['Q1', 'Q2', 'Q3', 'Q4']
    const monthRanges = ['Jan - Mar', 'Apr - Jun', 'Jul - Sep', 'Oct - Dec']
    return {
      label: `${quarterNames[q - 1]} ${y}`,
      range: monthRanges[q - 1]
    }
  }

  // Check if quarter is current
  function isCurrentQuarter(q, y) {
    const current = getCurrentQuarter()
    return q === current.quarter && y === current.year
  }

  useEffect(() => {
    loadAllPlans()
  }, [])

  useEffect(() => {
    loadQuarterPlan()
  }, [currentQuarter, allPlans])

  const loadAllPlans = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      const { data } = await supabase
        .from('quarterly_plans')
        .select('*')
        .eq('user_id', user.id)
        .order('quarter_start', { ascending: false })

      setAllPlans(data || [])
    } catch (error) {
      console.error('Error loading quarterly plans:', error)
    }
  }

  const loadQuarterPlan = () => {
    const quarterStart = getQuarterStartDate(currentQuarter.quarter, currentQuarter.year)
    const plan = allPlans.find(p => p.quarter_start === quarterStart)

    if (plan) {
      setCurrentPlan(plan)
      const objs = plan.objectives || []
      setObjectives(objs.length > 0 ? objs : ['', '', ''])
      setReflection(plan.reflection || '')
      setIsEditing(false)
    } else {
      setCurrentPlan(null)
      setObjectives(['', '', ''])
      setReflection('')
      setIsEditing(true)
    }
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      const quarterStart = getQuarterStartDate(currentQuarter.quarter, currentQuarter.year)

      // Filter out empty objectives
      const filteredObjectives = objectives.filter(o => o.trim() !== '')

      const { error } = await supabase
        .from('quarterly_plans')
        .upsert({
          user_id: user.id,
          quarter_start: quarterStart,
          objectives: filteredObjectives,
          reflection: reflection || null,
        }, { onConflict: 'user_id,quarter_start' })

      if (error) throw error

      await loadAllPlans()
      if (onUpdate) await onUpdate()
      setIsEditing(false)
    } catch (error) {
      console.error('Error saving quarterly plan:', error)
    } finally {
      setSaving(false)
    }
  }

  const handleCancel = () => {
    if (currentPlan) {
      const objs = currentPlan.objectives || []
      setObjectives(objs.length > 0 ? objs : ['', '', ''])
      setReflection(currentPlan.reflection || '')
    }
    setIsEditing(false)
  }

  const navigateQuarter = (direction) => {
    let newQuarter = currentQuarter.quarter + direction
    let newYear = currentQuarter.year

    if (newQuarter > 4) {
      newQuarter = 1
      newYear++
    } else if (newQuarter < 1) {
      newQuarter = 4
      newYear--
    }

    setCurrentQuarter({ quarter: newQuarter, year: newYear })
  }

  const addObjective = () => {
    if (objectives.length < 5) {
      setObjectives([...objectives, ''])
    }
  }

  const updateObjective = (index, value) => {
    const updated = [...objectives]
    updated[index] = value
    setObjectives(updated)
  }

  const removeObjective = (index) => {
    if (objectives.length > 1) {
      setObjectives(objectives.filter((_, i) => i !== index))
    }
  }

  const jumpToQuarter = (quarterStart) => {
    const [year, month] = quarterStart.split('-').map(Number)
    const quarter = Math.floor((month - 1) / 3) + 1
    setCurrentQuarter({ quarter, year })
    setShowPlanList(false)
  }

  const { label, range } = formatQuarter(currentQuarter.quarter, currentQuarter.year)

  return (
    <div className="space-y-6">
      {/* Quarter Navigation */}
      <div className="card p-6">
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => navigateQuarter(-1)}
            className="w-10 h-10 rounded-full hover:bg-gray-100 flex items-center justify-center transition-colors"
          >
            ←
          </button>

          <div className="text-center">
            <h3 className="text-2xl font-bold text-gray-900">{label}</h3>
            <p className="text-sm text-gray-500">
              {range} • {isCurrentQuarter(currentQuarter.quarter, currentQuarter.year) ? 'Current Quarter' : 'Past Quarter'}
            </p>
          </div>

          <button
            onClick={() => navigateQuarter(1)}
            className="w-10 h-10 rounded-full hover:bg-gray-100 flex items-center justify-center transition-colors"
          >
            →
          </button>
        </div>

        {/* Intro text for new users */}
        {!currentPlan && isEditing && (
          <div className="mb-6 p-4 bg-control-primary/10 rounded-xl">
            <p className="text-sm text-gray-700">
              <strong>Quarterly Planning</strong> sits at the top of Cal Newport's multi-scale planning system.
              Set 3-5 major objectives for the quarter. Review these when doing your weekly planning to ensure
              your weeks align with your bigger goals.
            </p>
          </div>
        )}

        {/* View Mode */}
        {!isEditing && currentPlan ? (
          <>
            {/* Objectives - View Mode */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Quarterly Objectives
              </label>
              <div className="space-y-2">
                {currentPlan.objectives && currentPlan.objectives.length > 0 ? (
                  currentPlan.objectives.map((objective, index) => (
                    <div key={index} className="flex items-center gap-3">
                      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-control-primary text-white flex items-center justify-center font-bold">
                        {index + 1}
                      </div>
                      <span className="text-gray-900">{objective}</span>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500 italic">No objectives set</p>
                )}
              </div>
            </div>

            {/* Quarter Reflection - View Mode */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Quarter Reflection
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
            {/* Objectives - Edit Mode */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-3">
                <label className="block text-sm font-medium text-gray-700">
                  Quarterly Objectives (3-5 major goals)
                </label>
                {objectives.length < 5 && (
                  <button
                    onClick={addObjective}
                    className="text-sm text-control-primary hover:text-control-accent font-medium"
                  >
                    + Add Objective
                  </button>
                )}
              </div>
              <div className="space-y-3">
                {objectives.map((objective, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-control-primary text-white flex items-center justify-center font-bold">
                      {index + 1}
                    </div>
                    <input
                      type="text"
                      value={objective}
                      onChange={(e) => updateObjective(index, e.target.value)}
                      placeholder={`Objective ${index + 1}`}
                      className="flex-1 px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-control-primary focus:border-transparent outline-none transition text-gray-900"
                    />
                    {objectives.length > 1 && (
                      <button
                        onClick={() => removeObjective(index)}
                        className="w-8 h-8 rounded-full hover:bg-red-100 flex items-center justify-center transition-colors text-red-600"
                      >
                        ✕
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Quarter Reflection - Edit Mode */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Quarter Reflection (End of Quarter)
              </label>
              <textarea
                value={reflection}
                onChange={(e) => setReflection(e.target.value)}
                placeholder="What went well? What could be improved? Key learnings from this quarter?"
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
                {saving ? 'Saving...' : 'Save Quarterly Plan'}
              </button>
            </div>
          </>
        )}
      </div>

      {/* All Quarterly Plans */}
      {allPlans.length > 0 && (
        <div className="card p-4">
          <button
            onClick={() => setShowPlanList(!showPlanList)}
            className="w-full flex items-center justify-between text-left hover:bg-gray-50 p-2 rounded-lg transition-colors"
          >
            <span className="font-medium text-gray-900">
              All Quarterly Plans ({allPlans.length})
            </span>
            <span className="text-gray-500">{showPlanList ? '▼' : '▶'}</span>
          </button>

          {showPlanList && (
            <div className="mt-4 space-y-2 max-h-96 overflow-y-auto">
              {allPlans.map((plan) => {
                const [year, month] = plan.quarter_start.split('-').map(Number)
                const quarter = Math.floor((month - 1) / 3) + 1
                const { label } = formatQuarter(quarter, year)
                const isCurrent = plan.quarter_start === getQuarterStartDate(currentQuarter.quarter, currentQuarter.year)
                const isThisQuarter = isCurrentQuarter(quarter, year)

                return (
                  <div
                    key={plan.id}
                    onClick={() => jumpToQuarter(plan.quarter_start)}
                    className={`p-4 rounded-lg border-2 transition-all cursor-pointer ${
                      isCurrent
                        ? 'border-control-primary bg-control-primary/10'
                        : 'border-gray-200 hover:border-control-primary/50 hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="text-sm font-medium text-gray-900 mb-1">
                          {label}
                        </div>
                        {plan.objectives && plan.objectives.length > 0 && (
                          <div className="text-xs text-gray-600">
                            {plan.objectives.length} objective{plan.objectives.length !== 1 ? 's' : ''}
                          </div>
                        )}
                      </div>
                      {isThisQuarter && (
                        <span className="text-xs px-2 py-1 rounded-full bg-control-primary text-white">
                          Current
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
