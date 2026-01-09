import { useState } from 'react'

export default function HabitCalendar({ habits, firstHabitDate }) {
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [hoveredDate, setHoveredDate] = useState(null)

  // Generate calendar days for current month
  const generateCalendar = () => {
    const year = currentMonth.getFullYear()
    const month = currentMonth.getMonth()

    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const startingDayOfWeek = firstDay.getDay()
    const daysInMonth = lastDay.getDate()

    const days = []

    // Add empty cells for days before month starts
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null)
    }

    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day)
      const dateStr = date.toISOString().split('T')[0]

      // Check which habits were completed on this day
      const completedHabits = habits.filter(habit =>
        habit.completions?.some(c => c.date === dateStr && c.completed)
      )

      // Only show days after first habit was created
      const firstHabitDateObj = firstHabitDate ? new Date(firstHabitDate) : null
      const isBeforeFirstHabit = firstHabitDateObj && date < firstHabitDateObj

      days.push({
        date: dateStr,
        dateObj: date,
        day,
        completedHabits,
        completionCount: completedHabits.length,
        isToday: dateStr === new Date().toISOString().split('T')[0],
        isInFuture: date > new Date(),
        isBeforeFirstHabit
      })
    }

    return days
  }

  const navigateMonth = (direction) => {
    const newDate = new Date(currentMonth)
    newDate.setMonth(newDate.getMonth() + direction)
    setCurrentMonth(newDate)
  }

  const getCompletionColor = (count, totalHabits) => {
    if (count === 0) return 'bg-cream-100'
    if (count === totalHabits) return 'bg-discipline-primary'
    return 'bg-discipline-primary/50'
  }

  const days = generateCalendar()
  const monthName = currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })

  return (
    <div className="card p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-ink">Habit Calendar</h3>
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigateMonth(-1)}
            className="w-8 h-8 rounded-full hover:bg-cream-200 flex items-center justify-center transition-colors text-ink"
          >
            ←
          </button>
          <span className="text-sm font-medium text-ink min-w-[140px] text-center">
            {monthName}
          </span>
          <button
            onClick={() => navigateMonth(1)}
            className="w-8 h-8 rounded-full hover:bg-cream-200 flex items-center justify-center transition-colors text-ink"
          >
            →
          </button>
        </div>
      </div>

      {/* Day headers */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
          <div key={day} className="text-center text-xs font-medium text-ink-light py-1">
            {day}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-1">
        {days.map((day, index) => {
          if (!day) {
            return <div key={`empty-${index}`} className="aspect-square" />
          }

          const isDisabled = day.isInFuture || day.isBeforeFirstHabit

          return (
            <div
              key={day.date}
              className={`aspect-square rounded-md flex items-center justify-center text-sm font-medium transition-all relative ${
                isDisabled
                  ? 'text-ink-light/30 cursor-not-allowed'
                  : day.isToday
                  ? 'ring-2 ring-discipline-primary text-ink cursor-pointer'
                  : day.completionCount > 0
                  ? `${getCompletionColor(day.completionCount, habits.length)} text-white cursor-pointer hover:scale-110`
                  : 'bg-cream-100 text-ink-light cursor-pointer hover:bg-cream-200'
              }`}
              onMouseEnter={() => !isDisabled && setHoveredDate(day.date)}
              onMouseLeave={() => setHoveredDate(null)}
            >
              {day.day}
              {day.completionCount > 0 && day.completionCount < habits.length && !isDisabled && (
                <div className="absolute top-0.5 right-0.5 w-1.5 h-1.5 rounded-full bg-white"></div>
              )}
            </div>
          )
        })}
      </div>

      {/* Hover tooltip */}
      {hoveredDate && (
        <div className="mt-4 p-3 bg-cream-100 rounded-md">
          <div className="text-sm font-medium text-ink mb-2">
            {new Date(hoveredDate).toLocaleDateString('en-US', {
              weekday: 'long',
              month: 'long',
              day: 'numeric'
            })}
          </div>
          {days.find(d => d?.date === hoveredDate)?.completedHabits.length > 0 ? (
            <div className="space-y-1">
              {days.find(d => d?.date === hoveredDate)?.completedHabits.map(habit => (
                <div key={habit.id} className="flex items-center gap-2 text-sm">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: habit.color }}
                  ></div>
                  <span className="text-ink-light">{habit.name}</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-sm text-ink-light">No habits completed</div>
          )}
        </div>
      )}

      {/* Legend */}
      <div className="mt-4 pt-4 border-t border-cream-300">
        <div className="flex items-center gap-4 text-xs text-ink-light">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-cream-100"></div>
            <span>No completion</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-discipline-primary/50"></div>
            <span>Partial</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-discipline-primary"></div>
            <span>All habits</span>
          </div>
        </div>
      </div>
    </div>
  )
}
