import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import HabitCard from './HabitCard'
import AddHabitModal from './AddHabitModal'
import HabitCalendar from './HabitCalendar'

// Newport's three keystone habit categories
const habitCategories = [
  { value: 'body', label: 'Body', color: '#10B981' },
  { value: 'mind', label: 'Mind', color: '#3B82F6' },
  { value: 'heart', label: 'Heart', color: '#EC4899' },
]

export default function DisciplineLayer() {
  const [habits, setHabits] = useState([])
  const [loading, setLoading] = useState(true)
  const [showAddModal, setShowAddModal] = useState(false)
  const [editingHabit, setEditingHabit] = useState(null)
  const [firstHabitDate, setFirstHabitDate] = useState(null)

  // Get local date string in YYYY-MM-DD format (avoids timezone issues with toISOString)
  function getLocalDateString(date) {
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
  }

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
        setFirstHabitDate(getLocalDateString(earliest))
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
      const today = getLocalDateString(new Date())

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

  const handleDeleteHabit = async (habitId) => {
    try {
      const { error } = await supabase
        .from('habits')
        .delete()
        .eq('id', habitId)

      if (error) throw error

      await loadHabits()
      setEditingHabit(null)
    } catch (error) {
      console.error('Error deleting habit:', error)
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
  const today = getLocalDateString(new Date())
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

      {/* Today's Habits Section - Organized by Body/Mind/Heart */}
      {habits.length > 0 && (
        <div className="mb-8">
          <div className="card p-6">
            <h2 className="text-2xl font-display font-bold text-ink mb-4">Today's Keystone Habits</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {habitCategories.map((category) => {
                const categoryHabit = habits.find(h => h.category === category.value)
                const isCompletedToday = categoryHabit?.completions?.some(c =>
                  c.date === today && c.completed
                )

                return (
                  <div
                    key={category.value}
                    className="p-4 rounded-xl border-2"
                    style={{ borderColor: category.color + '40', backgroundColor: category.color + '08' }}
                  >
                    <div className="flex items-center gap-2 mb-3">
                      <div
                        className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm"
                        style={{ backgroundColor: category.color }}
                      >
                        {category.label[0]}
                      </div>
                      <span className="font-medium text-gray-700">{category.label}</span>
                    </div>

                    {categoryHabit ? (
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => handleToggleCompletion(categoryHabit.id)}
                          className="w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all hover:scale-110 flex-shrink-0 text-xs font-bold"
                          style={{
                            borderColor: isCompletedToday ? category.color : '#D1D5DB',
                            backgroundColor: isCompletedToday ? category.color : 'transparent',
                            color: isCompletedToday ? 'white' : 'transparent',
                          }}
                        >
                          {isCompletedToday && '✓'}
                        </button>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-medium text-gray-900 truncate">{categoryHabit.name}</h3>
                        </div>
                      </div>
                    ) : (
                      <p className="text-sm text-gray-400 italic">No habit set</p>
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
          <h2 className="text-2xl font-display font-bold text-ink mb-2">No Keystone Habits Yet</h2>
          <p className="text-ink-light mb-6">
            Cal Newport recommends one keystone habit in each area: Body, Mind, and Heart.
            These form the foundation of your disciplined life.
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
          onDelete={handleDeleteHabit}
          existingCategories={habits.map(h => h.category).filter(Boolean)}
        />
      )}
    </div>
  )
}
