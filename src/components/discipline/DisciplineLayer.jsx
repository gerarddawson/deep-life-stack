import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import HabitCard from './HabitCard'
import AddHabitModal from './AddHabitModal'
import HabitCalendar from './HabitCalendar'

export default function DisciplineLayer() {
  const [habits, setHabits] = useState([])
  const [loading, setLoading] = useState(true)
  const [showAddModal, setShowAddModal] = useState(false)
  const [editingHabit, setEditingHabit] = useState(null)
  const [firstHabitDate, setFirstHabitDate] = useState(null)

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

      // Get the earliest habit creation date
      if (data && data.length > 0) {
        const dates = data.map(h => new Date(h.created_at))
        const earliest = new Date(Math.min(...dates))
        setFirstHabitDate(earliest.toISOString().split('T')[0])
      }
    } catch (error) {
      console.error('Error loading habits:', error)
    } finally {
      setLoading(false)
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

          {/* Habit Calendar */}
          {habits.length > 0 && (
            <HabitCalendar habits={habits} firstHabitDate={firstHabitDate} />
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
