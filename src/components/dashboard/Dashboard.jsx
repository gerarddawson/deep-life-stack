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

  const loadData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()

      // Load journey
      const { data: journeyData } = await supabase
        .from('journeys')
        .select('*')
        .eq('user_id', user.id)
        .single()

      setJourney(journeyData)

      // Calculate journey start date from first action across all tables
      const startDate = await calculateJourneyStartDate(user.id)
      setJourneyStartDate(startDate)

      // Determine current layer based on what user has started
      const current = await determineCurrentLayer(user.id)
      setCurrentLayer(current)

      // Calculate progress for each layer
      const progress = await calculateLayerProgress(user.id)
      setLayerProgress(progress)

      // Load habits with today's completions
      const { data: habitsData } = await supabase
        .from('habits')
        .select('*, completions(*)')
        .eq('user_id', user.id)
        .order('order', { ascending: true })

      setHabits(habitsData || [])

      // Load all rituals with completions (filter for daily/weekly in UI)
      const { data: ritualsData } = await supabase
        .from('rituals')
        .select('*, ritual_completions(*)')
        .eq('user_id', user.id)
        .order('created_at', { ascending: true })

      // Only show daily and weekly rituals on dashboard
      const dailyWeeklyRituals = (ritualsData || []).filter(r =>
        r.frequency === 'daily' || r.frequency === 'weekly'
      )
      setRituals(dailyWeeklyRituals)

      // Load today's daily plan
      const today = new Date().toISOString().split('T')[0]
      const { data: dailyPlanData } = await supabase
        .from('daily_plans')
        .select('*')
        .eq('user_id', user.id)
        .eq('date', today)
        .maybeSingle()

      setDailyPlan(dailyPlanData)

      // Load this week's weekly plan
      const weekStart = getWeekStart(new Date())
      const { data: weeklyPlanData } = await supabase
        .from('weekly_plans')
        .select('*')
        .eq('user_id', user.id)
        .eq('week_start', weekStart)
        .maybeSingle()

      setWeeklyPlan(weeklyPlanData)
    } catch (error) {
      console.error('Error loading data:', error)
    } finally {
      setLoading(false)
    }
  }

  const getWeekStart = (date) => {
    const d = new Date(date)
    const day = d.getDay()
    const diff = d.getDate() - day + (day === 0 ? -6 : 1) // Adjust to Monday
    const monday = new Date(d.setDate(diff))
    return monday.toISOString().split('T')[0]
  }

  const calculateJourneyStartDate = async (userId) => {
    // Check all tables for earliest created_at
    const tables = [
      'habits',
      'values',
      'rituals',
      'weekly_plans',
      'daily_plans',
      'remarkable_aspects'
    ]

    let earliestDate = null

    for (const table of tables) {
      const { data } = await supabase
        .from(table)
        .select('created_at')
        .eq('user_id', userId)
        .order('created_at', { ascending: true })
        .limit(1)

      if (data && data.length > 0) {
        const date = new Date(data[0].created_at)
        if (!earliestDate || date < earliestDate) {
          earliestDate = date
        }
      }
    }

    return earliestDate
  }

  const determineCurrentLayer = async (userId) => {
    // Check which layers have data (furthest layer user has started)
    const layers = ['vision', 'control', 'values', 'discipline']

    for (const layer of layers) {
      const hasData = await layerHasData(userId, layer)
      if (hasData) {
        return layer
      }
    }

    return 'discipline'
  }

  const layerHasData = async (userId, layer) => {
    switch (layer) {
      case 'discipline':
        const { data: habits } = await supabase
          .from('habits')
          .select('id')
          .eq('user_id', userId)
          .limit(1)
        return habits && habits.length > 0

      case 'values':
        const { data: values } = await supabase
          .from('values')
          .select('id')
          .eq('user_id', userId)
          .limit(1)
        const { data: rituals } = await supabase
          .from('rituals')
          .select('id')
          .eq('user_id', userId)
          .limit(1)
        const { data: code } = await supabase
          .from('personal_code')
          .select('id')
          .eq('user_id', userId)
          .limit(1)
        return (values && values.length > 0) || (rituals && rituals.length > 0) || (code && code.length > 0)

      case 'control':
        const { data: weekly } = await supabase
          .from('weekly_plans')
          .select('id')
          .eq('user_id', userId)
          .limit(1)
        const { data: daily } = await supabase
          .from('daily_plans')
          .select('id')
          .eq('user_id', userId)
          .limit(1)
        return (weekly && weekly.length > 0) || (daily && daily.length > 0)

      case 'vision':
        const { data: aspects } = await supabase
          .from('remarkable_aspects')
          .select('id')
          .eq('user_id', userId)
          .limit(1)
        return aspects && aspects.length > 0

      default:
        return false
    }
  }

  const calculateLayerProgress = async (userId) => {
    const progress = {}

    // Discipline: count habits + completions
    const { data: habits } = await supabase
      .from('habits')
      .select('id')
      .eq('user_id', userId)
    const { data: completions } = await supabase
      .from('completions')
      .select('id')
      .eq('user_id', userId)
    progress.discipline = {
      items: (habits?.length || 0) + (completions?.length || 0),
      max: 3 + 45 // 3 habits + 3*15 days of completions
    }

    // Values: count values + rituals + personal code
    const { data: values } = await supabase
      .from('values')
      .select('id')
      .eq('user_id', userId)
    const { data: rituals } = await supabase
      .from('rituals')
      .select('id')
      .eq('user_id', userId)
    const { data: code } = await supabase
      .from('personal_code')
      .select('id')
      .eq('user_id', userId)
    progress.values = {
      items: (values?.length || 0) + (rituals?.length || 0) + (code?.length || 0),
      max: 10 // 5 values + 4 rituals + 1 code
    }

    // Control: count plans
    const { data: weekly } = await supabase
      .from('weekly_plans')
      .select('id')
      .eq('user_id', userId)
    const { data: daily } = await supabase
      .from('daily_plans')
      .select('id')
      .eq('user_id', userId)
    progress.control = {
      items: (weekly?.length || 0) + (daily?.length || 0),
      max: 8 // 4 weeks + 4 days tracked
    }

    // Vision: count aspects + milestones
    const { data: aspects } = await supabase
      .from('remarkable_aspects')
      .select('id')
      .eq('user_id', userId)
    const { data: milestones } = await supabase
      .from('milestones')
      .select('id')
      .eq('user_id', userId)
    progress.vision = {
      items: (aspects?.length || 0) + (milestones?.length || 0),
      max: 10 // 3 aspects + 7 milestones
    }

    return progress
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
                    to="/control"
                    className="text-sm text-control-primary hover:underline font-medium"
                  >
                    View today's plan →
                  </Link>
                )}
                {weeklyPlan && (
                  <Link
                    to="/control"
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

