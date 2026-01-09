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
    } catch (error) {
      console.error('Error loading data:', error)
    } finally {
      setLoading(false)
    }
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
      {/* Welcome Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-display font-bold text-ink mb-2">Dashboard</h1>
        <p className="text-lg text-ink-light">{formattedDate}</p>
      </div>

      {/* Journey Progress */}
      <div className="card p-8 mb-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-display font-bold text-ink">Your 4-Month Journey</h2>
          <span className="px-4 py-2 rounded-md bg-cream-200 text-ink font-medium">
            Day {journeyDay} of 120
          </span>
        </div>

        {/* Activity Grid */}
        <div className="mb-8">
          <ActivityGrid journeyStartDate={journeyStartDate} />
        </div>

        {/* Layer Indicators */}
        <div className="grid grid-cols-4 gap-4">
          <LayerIndicator
            name="Discipline"
            day={Math.min(journeyDay, LAYER_DURATIONS.discipline)}
            total={LAYER_DURATIONS.discipline}
            color="discipline"
            progress={layerProgress.discipline}
            onClick={() => navigate('/discipline')}
          />
          <LayerIndicator
            name="Values"
            day={Math.max(0, Math.min(journeyDay - LAYER_DURATIONS.discipline, LAYER_DURATIONS.values))}
            total={LAYER_DURATIONS.values}
            color="values"
            progress={layerProgress.values}
            onClick={() => navigate('/values')}
          />
          <LayerIndicator
            name="Control"
            day={Math.max(0, Math.min(journeyDay - LAYER_DURATIONS.discipline - LAYER_DURATIONS.values, LAYER_DURATIONS.control))}
            total={LAYER_DURATIONS.control}
            color="control"
            progress={layerProgress.control}
            onClick={() => navigate('/control')}
          />
          <LayerIndicator
            name="Vision"
            day={Math.max(0, Math.min(journeyDay - LAYER_DURATIONS.discipline - LAYER_DURATIONS.values - LAYER_DURATIONS.control, LAYER_DURATIONS.vision))}
            total={LAYER_DURATIONS.vision}
            color="vision"
            progress={layerProgress.vision}
            onClick={() => navigate('/vision')}
          />
        </div>
      </div>

      {/* Today's Progress */}
      <div className="grid grid-cols-3 gap-6 mb-8">
        <StatCard
          title="Habits Today"
          value={`${habitCompletionToday}/${habits.length}`}
          color="discipline"
          onClick={() => navigate('/discipline')}
        />
        <StatCard
          title="Current Layer"
          value={currentLayer.charAt(0).toUpperCase() + currentLayer.slice(1)}
          color="values"
          onClick={() => navigate(`/${currentLayer}`)}
        />
        <StatCard
          title="Days in Layer"
          value={`${dayInCurrentLayer}/${LAYER_DURATIONS[currentLayer]}`}
          color="control"
          onClick={() => navigate(`/${currentLayer}`)}
        />
      </div>

      {/* Today's Focus */}
      <div className="card p-8">
        <h2 className="text-2xl font-display font-bold text-ink mb-6">Today's Focus</h2>

        {habits.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-ink-light text-lg mb-4">No habits yet</p>
            <Link
              to="/discipline"
              className="inline-block px-6 py-3 gradient-discipline text-white rounded-md font-medium hover:shadow-md transition-all"
            >
              Create Your First Habit
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {habits.map((habit) => {
              const completed = isCompletedToday(habit)
              return (
                <div key={habit.id} className="flex items-center gap-4 p-4 bg-cream-100 rounded-md">
                  <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center text-xs ${
                    completed
                      ? 'border-discipline-primary bg-discipline-primary text-white'
                      : 'border-cream-300'
                  }`}>
                    {completed && '✓'}
                  </div>
                  <span className="font-medium text-ink flex-1">{habit.name}</span>
                  {completed && (
                    <span className="text-sm text-green-600 font-medium">Completed</span>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

function LayerIndicator({ name, day, total, color, progress, onClick }) {
  // Show progress based on actions taken, not just days
  const actionProgress = progress ? Math.min((progress.items / progress.max) * 100, 100) : 0
  const displayProgress = Math.max(actionProgress, (day / total) * 100)

  return (
    <div className="text-center cursor-pointer group" onClick={onClick}>
      <div className="w-16 h-16 mx-auto mb-3 rounded-full border-4 border-cream-200 flex items-center justify-center relative transition-all group-hover:border-cream-400 group-hover:scale-110">
        {displayProgress > 0 && (
          <div
            className="absolute inset-0 rounded-full"
            style={{
              background: `conic-gradient(var(--${color}-primary) ${displayProgress}%, transparent ${displayProgress}%)`,
            }}
          />
        )}
        <span className="relative z-10 text-xs font-semibold text-ink">{Math.round(displayProgress)}%</span>
      </div>
      <div className="font-medium text-ink group-hover:underline">{name}</div>
      <div className="text-sm text-ink-light">{day}/{total} days</div>
      {progress && progress.items > 0 && (
        <div className="text-xs text-ink-light/70 mt-1">
          {progress.items} actions
        </div>
      )}
    </div>
  )
}

function StatCard({ title, value, color, onClick }) {
  return (
    <div
      className={`card p-6 text-center ${onClick ? 'cursor-pointer hover:shadow-md transition-shadow' : ''}`}
      onClick={onClick}
    >
      <div className="text-3xl font-bold text-ink mb-1">{value}</div>
      <div className="text-sm text-ink-light">{title}</div>
    </div>
  )
}
