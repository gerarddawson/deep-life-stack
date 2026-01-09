import { calculateCurrentStreak, calculateCompletionRate } from '../../lib/calculations'

export default function HabitCard({ habit, onToggle, onEdit }) {
  const today = new Date().toISOString().split('T')[0]
  const isCompletedToday = habit.completions?.some(c =>
    c.date === today && c.completed
  )

  const currentStreak = calculateCurrentStreak(habit.completions || [])
  const completionRate = calculateCompletionRate(habit.completions || [], habit.created_at)

  return (
    <div
      className="card p-6 hover:shadow-md transition-shadow cursor-pointer"
      onClick={onEdit}
    >
      {/* Header with toggle */}
      <div className="flex items-start justify-between mb-4">
        <h3 className="text-xl font-bold text-ink">{habit.name}</h3>

        <button
          onClick={(e) => {
            e.stopPropagation() // Prevent triggering card click
            onToggle(habit.id)
          }}
          className="w-10 h-10 rounded-full border-2 flex items-center justify-center transition-all hover:scale-110 text-sm font-bold"
          style={{
            borderColor: isCompletedToday ? habit.color : '#E3D9C8',
            backgroundColor: isCompletedToday ? habit.color : 'transparent',
            color: isCompletedToday ? 'white' : 'transparent',
          }}
        >
          {isCompletedToday && '✓'}
        </button>
      </div>

      {/* Stats */}
      <div className="space-y-3">
        {/* Streak */}
        <div className="flex items-center justify-between">
          <span className="text-sm text-ink-light">Current Streak</span>
          <span className="font-bold text-ink">{currentStreak} days</span>
        </div>

        {/* Completion Rate */}
        <div className="space-y-1">
          <div className="flex items-center justify-between text-sm">
            <span className="text-ink-light">Completion</span>
            <span className="font-medium text-ink">{Math.round(completionRate * 100)}%</span>
          </div>
          <div className="h-2 bg-cream-200 rounded-full overflow-hidden">
            <div
              className="h-full gradient-discipline transition-all duration-500"
              style={{ width: `${completionRate * 100}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
