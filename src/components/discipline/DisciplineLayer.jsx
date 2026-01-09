import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import HabitCard from './HabitCard'
import AddHabitModal from './AddHabitModal'

export default function DisciplineLayer() {
  const [habits, setHabits] = useState([])
  const [loading, setLoading] = useState(true)
  const [showAddModal, setShowAddModal] = useState(false)
  const [editingHabit, setEditingHabit] = useState(null)
  const [completionHistory, setCompletionHistory] = useState([])

  useEffect(() => {
    loadHabits()
  }, [])

  const loadHabits = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()

      const { data, error } = await supabase
        .from('habits')
        .select('*, completions(*)')
        .eq('user_id', user.id)
        .order('order', { ascending: true })

      if (error) throw error
      setHabits(data || [])

      // Load completion history (last 14 days)
      await loadCompletionHistory(user.id, data || [])
    } catch (error) {
      console.error('Error loading habits:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadCompletionHistory = async (userId, habits) => {
    if (habits.length === 0) return

    try {
      // Get last 14 days of completions
      const fourteenDaysAgo = new Date()
      fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14)
      const startDate = fourteenDaysAgo.toISOString().split('T')[0]
      const today = new Date().toISOString().split('T')[0]

      // Group completions by date
      const history = []
      const currentDate = new Date()

      for (let i = 1; i <= 14; i++) {
        const date = new Date(currentDate)
        date.setDate(date.getDate() - i)
        const dateStr = date.toISOString().split('T')[0]

        // Count completions for this date
        const dayCompletions = habits.map(habit => {
          const completion = habit.completions?.find(c => c.date === dateStr && c.completed)
          return {
            habitId: habit.id,
            habitName: habit.name,
            habitIcon: habit.icon,
            habitColor: habit.color,
            completed: !!completion
          }
        })

        const completedCount = dayCompletions.filter(c => c.completed).length

        history.push({
          date: dateStr,
          dateObj: date,
          completions: dayCompletions,
          completedCount,
          totalHabits: habits.length
        })
      }

      setCompletionHistory(history)
    } catch (error) {
      console.error('Error loading completion history:', error)
    }
  }

  const handleToggleCompletion = async (habitId) => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      const today = new Date().toISOString().split('T')[0]

      // Check if already completed today
      const { data: existing } = await supabase
        .from('completions')
        .select('*')
        .eq('habit_id', habitId)
        .eq('date', today)
        .single()

      if (existing) {
        // Toggle completion
        await supabase
          .from('completions')
          .update({ completed: !existing.completed })
          .eq('id', existing.id)
      } else {
        // Create new completion
        await supabase
          .from('completions')
          .insert({
            habit_id: habitId,
            user_id: user.id,
            date: today,
            completed: true,
          })
      }

      // Reload habits
      await loadHabits()
    } catch (error) {
      console.error('Error toggling completion:', error)
    }
  }

  const handleAddHabit = async (habitData) => {
    try {
      const { data: { user } } = await supabase.auth.getUser()

      // Check for duplicate habit names
      const duplicate = habits.find(h => h.name.toLowerCase() === habitData.name.toLowerCase())
      if (duplicate) {
        alert('A habit with this name already exists. Please choose a different name.')
        return
      }

      const { error } = await supabase
        .from('habits')
        .insert({
          ...habitData,
          user_id: user.id,
          order: habits.length,
        })

      if (error) throw error

      await loadHabits()
      setShowAddModal(false)
    } catch (error) {
      console.error('Error adding habit:', error)
    }
  }

  const handleEditHabit = async (habitId, habitData) => {
    try {
      // Check for duplicate habit names (excluding current habit)
      const duplicate = habits.find(h =>
        h.id !== habitId && h.name.toLowerCase() === habitData.name.toLowerCase()
      )
      if (duplicate) {
        alert('A habit with this name already exists. Please choose a different name.')
        return
      }

      const { error } = await supabase
        .from('habits')
        .update(habitData)
        .eq('id', habitId)

      if (error) throw error

      await loadHabits()
      setEditingHabit(null)
    } catch (error) {
      console.error('Error updating habit:', error)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="w-12 h-12 border-4 border-discipline-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  // Get today's date
  const today = new Date().toISOString().split('T')[0]
  const todayFormatted = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric'
  })

  // Calculate today's completion
  const todayCompletionCount = habits.filter(habit =>
    habit.completions?.some(c => c.date === today && c.completed)
  ).length

  return (
    <div className="p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-4xl font-display font-bold text-ink mb-2">Discipline Layer</h1>
          <p className="text-lg text-ink-light">{todayFormatted}</p>
        </div>
        <div className="w-24 h-24 rounded-full border-8 border-cream-200 flex items-center justify-center">
          <div className="text-center">
            <div className="text-2xl font-bold text-ink">
              {habits.length > 0 ? `${todayCompletionCount}/${habits.length}` : '0'}
            </div>
            <div className="text-xs text-ink-light">today</div>
          </div>
        </div>
      </div>

      {/* Today's Habits Section */}
      {habits.length > 0 && (
        <div className="mb-8">
          <div className="card p-6">
            <h2 className="text-2xl font-display font-bold text-ink mb-4">Today's Habits</h2>
            <div className="space-y-3">
              {habits.map((habit) => {
                const isCompletedToday = habit.completions?.some(c =>
                  c.date === today && c.completed
                )
                return (
                  <div key={habit.id} className="flex items-center gap-4 p-4 bg-cream-100 rounded-md">
                    <button
                      onClick={() => handleToggleCompletion(habit.id)}
                      className="w-10 h-10 rounded-full border-2 flex items-center justify-center transition-all hover:scale-110 flex-shrink-0 text-sm font-bold"
                      style={{
                        borderColor: isCompletedToday ? habit.color : '#E3D9C8',
                        backgroundColor: isCompletedToday ? habit.color : 'transparent',
                        color: isCompletedToday ? 'white' : 'transparent',
                      }}
                    >
                      {isCompletedToday && '✓'}
                    </button>
                    <div className="flex-1">
                      <h3 className="font-bold text-ink">{habit.name}</h3>
                      {habit.description && (
                        <p className="text-sm text-ink-light">{habit.description}</p>
                      )}
                    </div>
                    {isCompletedToday && (
                      <span className="text-sm text-green-600 font-medium">Completed</span>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      )}

      {/* Add Habit Button */}
      {habits.length < 3 && (
        <div className="mb-8">
          <button
            onClick={() => setShowAddModal(true)}
            className="px-6 py-3 gradient-discipline text-white rounded-md font-medium hover:shadow-md transition-all inline-flex items-center gap-2"
          >
            <span className="text-xl">+</span>
            Add Habit
          </button>
        </div>
      )}

      {/* Habits Overview Grid */}
      {habits.length === 0 ? (
        <div className="card p-12 text-center">
          <h2 className="text-2xl font-display font-bold text-ink mb-2">No Habits Yet</h2>
          <p className="text-ink-light mb-6">
            Create up to 3 keystone habits that will form the foundation of your discipline.
          </p>
          <button
            onClick={() => setShowAddModal(true)}
            className="px-8 py-4 gradient-discipline text-white rounded-md font-medium hover:shadow-md transition-all"
          >
            Create First Habit
          </button>
        </div>
      ) : (
        <>
          {/* Habit Stats Cards */}
          <div className="mb-8">
            <h2 className="text-2xl font-display font-bold text-ink mb-4">Your Habits</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {habits.map((habit) => (
                <HabitCard
                  key={habit.id}
                  habit={habit}
                  onToggle={handleToggleCompletion}
                  onEdit={() => setEditingHabit(habit)}
                />
              ))}
            </div>
          </div>

          {/* Completion History */}
          {completionHistory.length > 0 && (
            <div className="card p-6">
              <h2 className="text-2xl font-display font-bold text-ink mb-4">Last 14 Days</h2>
              <div className="space-y-3">
                {completionHistory.map((day) => {
                  const percentage = (day.completedCount / day.totalHabits) * 100
                  const dateFormatted = day.dateObj.toLocaleDateString('en-US', {
                    weekday: 'short',
                    month: 'short',
                    day: 'numeric'
                  })

                  return (
                    <div key={day.date} className="p-4 bg-cream-100 rounded-md">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium text-ink">{dateFormatted}</span>
                        <span className="text-sm text-ink-light">
                          {day.completedCount}/{day.totalHabits} completed
                        </span>
                      </div>

                      {/* Progress bar */}
                      <div className="h-2 bg-cream-200 rounded-full overflow-hidden mb-3">
                        <div
                          className="h-full gradient-discipline transition-all duration-500"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>

                      {/* Individual habit indicators */}
                      <div className="flex gap-2">
                        {day.completions.map((completion) => (
                          <div
                            key={completion.habitId}
                            className="flex-1 h-8 rounded flex items-center justify-center text-xs font-medium"
                            style={{
                              backgroundColor: completion.completed
                                ? `${completion.habitColor}30`
                                : '#EDE7DD',
                              color: completion.completed ? completion.habitColor : '#9CA3AF',
                              opacity: completion.completed ? 1 : 0.5
                            }}
                            title={`${completion.habitName} - ${completion.completed ? 'Completed' : 'Not completed'}`}
                          >
                            {completion.completed && '✓'}
                          </div>
                        ))}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </>
      )}

      {/* Add/Edit Habit Modal */}
      {(showAddModal || editingHabit) && (
        <AddHabitModal
          onClose={() => {
            setShowAddModal(false)
            setEditingHabit(null)
          }}
          onAdd={handleAddHabit}
          editHabit={editingHabit}
          onEdit={handleEditHabit}
        />
      )}
    </div>
  )
}
