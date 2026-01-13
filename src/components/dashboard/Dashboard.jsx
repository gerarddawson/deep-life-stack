import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import { Link, useNavigate } from 'react-router-dom'
import ActivityGrid from './ActivityGrid'

// Updated layer durations: Discipline=15, Values=30, Control=30, Vision=45 (total=120)
const LAYER_DURATIONS = {
  discipline: 15,
  values: 30,
  control: 30,
  vision: 45
}

export default function Dashboard() {
  const navigate = useNavigate()
  const [habits, setHabits] = useState([])
  const [rituals, setRituals] = useState([])
  const [dailyPlan, setDailyPlan] = useState(null)
  const [weeklyPlan, setWeeklyPlan] = useState(null)
  const [journey, setJourney] = useState(null)
  const [loading, setLoading] = useState(true)
  const [journeyStartDate, setJourneyStartDate] = useState(null)
  const [currentLayer, setCurrentLayer] = useState('discipline')
  const [layerProgress, setLayerProgress] = useState({})

  useEffect(() => {
    loadData()
  }, [])

  const getWeekStart = (date) => {
    const d = new Date(date)
    const day = d.getDay()
    const diff = d.getDate() - day + (day === 0 ? -6 : 1) // Adjust to Monday
    const monday = new Date(d.setDate(diff))
    return monday.toISOString().split('T')[0]
  }

  const loadData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      const today = new Date().toISOString().split('T')[0]
      const weekStart = getWeekStart(new Date())

      // Run ALL queries in parallel for maximum performance
      const [
        journeyResult,
        habitsResult,
        completionsResult,
        valuesResult,
        ritualsResult,
        ritualCompletionsResult,
        personalCodeResult,
        weeklyPlansResult,
        dailyPlansResult,
        aspectsResult,
        milestonesResult,
        todaysPlanResult,
        thisWeeksPlanResult
      ] = await Promise.all([
        // Journey
        supabase.from('journeys').select('*').eq('user_id', user.id).single(),
        // Habits with completions
        supabase.from('habits').select('*, completions(*)').eq('user_id', user.id).order('order', { ascending: true }),
        // All completions (for progress calculation)
        supabase.from('completions').select('id, created_at').eq('user_id', user.id),
        // Values
        supabase.from('values').select('id, created_at').eq('user_id', user.id),
        // Rituals
        supabase.from('rituals').select('*').eq('user_id', user.id).order('created_at', { ascending: true }),
        // Ritual completions
        supabase.from('ritual_completions').select('*').eq('user_id', user.id),
        // Personal code
        supabase.from('personal_code').select('id, created_at').eq('user_id', user.id),
        // Weekly plans
        supabase.from('weekly_plans').select('id, created_at').eq('user_id', user.id),
        // Daily plans
        supabase.from('daily_plans').select('id, created_at').eq('user_id', user.id),
        // Remarkable aspects
        supabase.from('remarkable_aspects').select('id, created_at').eq('user_id', user.id),
        // Milestones
        supabase.from('milestones').select('id').eq('user_id', user.id),
        // Today's plan
        supabase.from('daily_plans').select('*').eq('user_id', user.id).eq('date', today).maybeSingle(),
        // This week's plan
        supabase.from('weekly_plans').select('*').eq('user_id', user.id).eq('week_start', weekStart).maybeSingle()
      ])

      // Extract data from results
      const habitsData = habitsResult.data || []
      const completionsData = completionsResult.data || []
      const valuesData = valuesResult.data || []
      const ritualsData = ritualsResult.data || []
      const ritualCompletionsData = ritualCompletionsResult.data || []
      const personalCodeData = personalCodeResult.data || []
      const weeklyPlansData = weeklyPlansResult.data || []
      const dailyPlansData = dailyPlansResult.data || []
      const aspectsData = aspectsResult.data || []
      const milestonesData = milestonesResult.data || []

      // Set journey
      setJourney(journeyResult.data)

      // Calculate journey start date from earliest created_at across all data
      const allDates = [
        ...habitsData.map(h => h.created_at),
        ...valuesData.map(v => v.created_at),
        ...ritualsData.map(r => r.created_at),
        ...weeklyPlansData.map(w => w.created_at),
        ...dailyPlansData.map(d => d.created_at),
        ...aspectsData.map(a => a.created_at)
      ].filter(Boolean).map(d => new Date(d))

      const earliestDate = allDates.length > 0 ? new Date(Math.min(...allDates)) : null
      setJourneyStartDate(earliestDate)

      // Determine current layer from data we already have
      let current = 'discipline'
      if (aspectsData.length > 0) {
        current = 'vision'
      } else if (weeklyPlansData.length > 0 || dailyPlansData.length > 0) {
        current = 'control'
      } else if (valuesData.length > 0 || ritualsData.length > 0 || personalCodeData.length > 0) {
        current = 'values'
      }
      setCurrentLayer(current)

      // Calculate layer progress from data we already have
      const progress = {
        discipline: {
          items: habitsData.length + completionsData.length,
          max: 3 + 45
        },
        values: {
          items: valuesData.length + ritualsData.length + personalCodeData.length,
          max: 10
        },
        control: {
          items: weeklyPlansData.length + dailyPlansData.length,
          max: 8
        },
        vision: {
          items: aspectsData.length + milestonesData.length,
          max: 10
        }
      }
      setLayerProgress(progress)

      // Set habits
      setHabits(habitsData)

      // Attach completions to rituals and filter for daily/weekly
      const ritualsWithCompletions = ritualsData.map(ritual => ({
        ...ritual,
        ritual_completions: ritualCompletionsData.filter(rc => rc.ritual_id === ritual.id)
      }))
      const dailyWeeklyRituals = ritualsWithCompletions.filter(r =>
        r.frequency === 'daily' || r.frequency === 'weekly'
      )
      setRituals(dailyWeeklyRituals)

      // Set plans
      setDailyPlan(todaysPlanResult.data)
      setWeeklyPlan(thisWeeksPlanResult.data)
    } catch (error) {
      console.error('Error loading data:', error)
    } finally {
      setLoading(false)
    }
  }

  const isCompletedToday = (habit) => {
    const today = new Date().toISOString().split('T')[0]
    return habit.completions?.some(c =>
      c.date === today && c.completed
    )
  }

  const handleToggleHabit = async (habitId) => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      const today = new Date().toISOString().split('T')[0]

      const { data: existing } = await supabase
        .from('completions')
        .select('*')
        .eq('habit_id', habitId)
        .eq('date', today)
        .single()

      if (existing) {
        await supabase
          .from('completions')
          .update({ completed: !existing.completed })
          .eq('id', existing.id)
      } else {
        await supabase
          .from('completions')
          .insert({
            habit_id: habitId,
            user_id: user.id,
            date: today,
            completed: true,
          })
      }

      await loadData()
    } catch (error) {
      console.error('Error toggling habit:', error)
    }
  }

  const isRitualCompleted = (ritual) => {
    const today = new Date().toISOString().split('T')[0]
    if (ritual.frequency === 'daily') {
      return ritual.ritual_completions?.some(c =>
        c.date === today && c.completed
      )
    } else if (ritual.frequency === 'weekly') {
      const weekStart = getWeekStart(new Date())
      return ritual.ritual_completions?.some(c => {
        const completionWeekStart = getWeekStart(new Date(c.date))
        return completionWeekStart === weekStart && c.completed
      })
    }
    return false
  }

  const handleToggleRitual = async (ritualId) => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      const today = new Date().toISOString().split('T')[0]
      const ritual = rituals.find(r => r.id === ritualId)

      if (ritual.frequency === 'daily') {
        const { data: existing } = await supabase
          .from('ritual_completions')
          .select('*')
          .eq('ritual_id', ritualId)
          .eq('date', today)
          .single()

        if (existing) {
          await supabase
            .from('ritual_completions')
            .update({ completed: !existing.completed })
            .eq('id', existing.id)
        } else {
          await supabase
            .from('ritual_completions')
            .insert({
              ritual_id: ritualId,
              user_id: user.id,
              date: today,
              completed: true,
            })
        }
      } else if (ritual.frequency === 'weekly') {
        const weekStart = getWeekStart(new Date())
        const { data: existing } = await supabase
          .from('ritual_completions')
          .select('*')
          .eq('ritual_id', ritualId)
          .gte('date', weekStart)
          .single()

        if (existing) {
          await supabase
            .from('ritual_completions')
            .update({ completed: !existing.completed })
            .eq('id', existing.id)
        } else {
          await supabase
            .from('ritual_completions')
            .insert({
              ritual_id: ritualId,
              user_id: user.id,
              date: today,
              completed: true,
            })
        }
      }

      await loadData()
    } catch (error) {
      console.error('Error toggling ritual:', error)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="w-12 h-12 border-4 border-discipline-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  // Calculate journey day from first action
  const journeyDay = journeyStartDate ?
    Math.floor((new Date() - journeyStartDate) / (1000 * 60 * 60 * 24)) + 1
    : 0

  // Calculate which day in current layer
  const layerStartDays = {
    discipline: 0,
    values: LAYER_DURATIONS.discipline,
    control: LAYER_DURATIONS.discipline + LAYER_DURATIONS.values,
    vision: LAYER_DURATIONS.discipline + LAYER_DURATIONS.values + LAYER_DURATIONS.control
  }

  const dayInCurrentLayer = Math.max(1, journeyDay - layerStartDays[currentLayer])

  // Calculate overall progress based on actions taken
  const totalProgress = Object.values(layerProgress).reduce((sum, layer) => {
    return sum + Math.min(layer.items / layer.max, 1)
  }, 0)
  const overallProgress = (totalProgress / 4) * 100

  const habitCompletionToday = habits.filter(isCompletedToday).length

  // Format today's date
  const today = new Date()
  const formattedDate = today.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })

  return (
    <div className="p-8 max-w-7xl mx-auto">
      {/* Date Header */}
      <div className="mb-8">
        <p className="text-lg text-ink-light">{formattedDate}</p>
      </div>

      {/* Journey Progress */}
      <div className="card p-8 mb-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <p className="text-sm text-ink-light">
              Currently in <span className="font-medium text-ink">{currentLayer.charAt(0).toUpperCase() + currentLayer.slice(1)}</span> layer
            </p>
          </div>
          <span className="px-4 py-2 rounded-md bg-cream-200 text-ink font-medium">
            Day {journeyDay} of 120
          </span>
        </div>

        {/* Activity Grid */}
        <ActivityGrid journeyStartDate={journeyStartDate} />
      </div>

      {/* Today's Focus */}
      <div className="card p-8">
        <h2 className="text-2xl font-display font-bold text-ink mb-6">Today's Focus</h2>

        {habits.length === 0 && rituals.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-ink-light text-lg mb-4">Nothing to focus on yet</p>
            <Link
              to="/discipline"
              className="inline-block px-6 py-3 gradient-discipline text-white rounded-md font-medium hover:shadow-md transition-all"
            >
              Start Your Journey
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Two Column Layout */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Habits Column */}
              <div>
                <h3 className="text-sm font-medium text-ink-light mb-3">Habits</h3>
                {habits.length > 0 ? (
                  <div className="space-y-3">
                    {habits.map((habit) => {
                      const completed = isCompletedToday(habit)
                      return (
                        <div key={habit.id} className="flex items-center gap-3 p-3 bg-cream-100 rounded-md">
                          <button
                            onClick={() => handleToggleHabit(habit.id)}
                            className={`w-6 h-6 rounded-full border-2 flex items-center justify-center text-xs transition-all hover:scale-110 flex-shrink-0 ${
                              completed
                                ? 'border-discipline-primary bg-discipline-primary text-white'
                                : 'border-cream-300'
                            }`}
                          >
                            {completed && '✓'}
                          </button>
                          <Link to="/discipline" className="font-medium text-ink flex-1 hover:underline text-sm">
                            {habit.name}
                          </Link>
                        </div>
                      )
                    })}
                  </div>
                ) : (
                  <p className="text-sm text-ink-light/60">No habits yet</p>
                )}
              </div>

              {/* Rituals Column */}
              <div>
                <h3 className="text-sm font-medium text-ink-light mb-3">Rituals</h3>
                {rituals.length > 0 ? (
                  <div className="space-y-3">
                    {rituals.map((ritual) => {
                      const completed = isRitualCompleted(ritual)
                      const isDaily = ritual.frequency === 'daily'
                      return (
                        <div
                          key={ritual.id}
                          className={`flex items-center gap-3 p-3 rounded-md ${
                            isDaily ? 'bg-cream-100' : 'bg-cream-100 border-l-2 border-values-primary/30'
                          }`}
                        >
                          <button
                            onClick={() => handleToggleRitual(ritual.id)}
                            className={`w-6 h-6 rounded-full border-2 flex items-center justify-center text-xs transition-all hover:scale-110 flex-shrink-0 ${
                              completed
                                ? 'border-values-primary bg-values-primary text-white'
                                : 'border-cream-300'
                            }`}
                          >
                            {completed && '✓'}
                          </button>
                          <Link to="/values" className="font-medium text-ink flex-1 hover:underline text-sm">
                            {ritual.name}
                          </Link>
                          <span className={`text-xs px-2 py-0.5 rounded ${
                            isDaily
                              ? 'bg-values-primary/10 text-values-primary'
                              : 'bg-values-primary/20 text-values-primary font-medium'
                          }`}>
                            {isDaily ? 'Daily' : 'Weekly'}
                          </span>
                        </div>
                      )
                    })}
                  </div>
                ) : (
                  <p className="text-sm text-ink-light/60">No rituals yet</p>
                )}
              </div>
            </div>

            {/* Plan Reminders */}
            {(dailyPlan || weeklyPlan) && (
              <div className="pt-4 border-t border-cream-200 flex flex-wrap gap-3">
                {dailyPlan && (
                  <Link
                    to="/control?tab=daily"
                    className="text-sm text-control-primary hover:underline font-medium"
                  >
                    View today's plan →
                  </Link>
                )}
                {weeklyPlan && (
                  <Link
                    to="/control?tab=weekly"
                    className="text-sm text-control-primary hover:underline font-medium"
                  >
                    Review weekly plan →
                  </Link>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

