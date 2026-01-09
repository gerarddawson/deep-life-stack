import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'

export default function ActivityGrid({ journeyStartDate }) {
  const [activityData, setActivityData] = useState({})
  const [hoveredDate, setHoveredDate] = useState(null)

  useEffect(() => {
    loadActivityData()
  }, [])

  const loadActivityData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()

      // Get all activity: completions, values, rituals, plans, aspects, milestones
      const tables = [
        { name: 'completions', dateField: 'created_at' },
        { name: 'habits', dateField: 'created_at' },
        { name: 'values', dateField: 'created_at' },
        { name: 'rituals', dateField: 'created_at' },
        { name: 'weekly_plans', dateField: 'created_at' },
        { name: 'daily_plans', dateField: 'created_at' },
        { name: 'remarkable_aspects', dateField: 'created_at' },
        { name: 'milestones', dateField: 'created_at' }
      ]

      const activityMap = {}

      for (const table of tables) {
        const { data } = await supabase
          .from(table.name)
          .select(table.dateField)
          .eq('user_id', user.id)

        if (data) {
          data.forEach(record => {
            const date = new Date(record[table.dateField]).toISOString().split('T')[0]
            activityMap[date] = (activityMap[date] || 0) + 1
          })
        }
      }

      setActivityData(activityMap)
    } catch (error) {
      console.error('Error loading activity:', error)
    }
  }

  // Generate grid of weeks (last 17 weeks = ~4 months)
  const generateGrid = () => {
    const startDate = journeyStartDate || new Date()
    const today = new Date()
    const weeks = []

    // Start from the beginning of the journey week
    let currentDate = new Date(startDate)
    currentDate.setDate(currentDate.getDate() - currentDate.getDay()) // Go to Sunday

    while (currentDate <= today) {
      const week = []
      for (let i = 0; i < 7; i++) {
        const dateStr = currentDate.toISOString().split('T')[0]
        const dayOfWeek = currentDate.getDay()
        const activityCount = activityData[dateStr] || 0

        week.push({
          date: dateStr,
          dateObj: new Date(currentDate),
          dayOfWeek,
          activityCount,
          isInFuture: currentDate > today
        })

        currentDate.setDate(currentDate.getDate() + 1)
      }
      weeks.push(week)
    }

    return weeks
  }

  const getActivityColor = (count) => {
    if (count === 0) return 'bg-cream-200'
    if (count <= 2) return 'bg-discipline-primary/30'
    if (count <= 5) return 'bg-values-primary/50'
    if (count <= 10) return 'bg-control-primary/70'
    return 'bg-vision-primary/90'
  }

  const weeks = generateGrid()

  return (
    <div className="relative">
      <div className="flex gap-1 items-start overflow-x-auto pb-2">
        {/* Day labels */}
        <div className="flex flex-col gap-1 mr-1 mt-4">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day, i) => (
            <div key={day} className="h-3 text-[10px] text-ink-light flex items-center">
              {i % 2 === 1 ? day : ''}
            </div>
          ))}
        </div>

        {/* Activity grid */}
        <div className="flex gap-1">
          {weeks.map((week, weekIndex) => (
            <div key={weekIndex} className="flex flex-col gap-1">
              {week.map((day) => (
                <div
                  key={day.date}
                  className={`w-3 h-3 rounded-sm transition-all cursor-pointer ${
                    day.isInFuture
                      ? 'bg-cream-100 opacity-30'
                      : getActivityColor(day.activityCount)
                  } ${
                    hoveredDate === day.date ? 'ring-2 ring-ink/50 scale-125' : ''
                  }`}
                  onMouseEnter={() => !day.isInFuture && setHoveredDate(day.date)}
                  onMouseLeave={() => setHoveredDate(null)}
                  title={`${day.dateObj.toLocaleDateString()}: ${day.activityCount} ${
                    day.activityCount === 1 ? 'action' : 'actions'
                  }`}
                />
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* Hover tooltip */}
      {hoveredDate && (
        <div className="mt-4 p-3 bg-cream-100 rounded-md text-sm">
          <div className="font-medium text-ink">
            {new Date(hoveredDate).toLocaleDateString('en-US', {
              weekday: 'long',
              month: 'long',
              day: 'numeric'
            })}
          </div>
          <div className="text-ink-light">
            {activityData[hoveredDate] || 0} {activityData[hoveredDate] === 1 ? 'action' : 'actions'} taken
          </div>
        </div>
      )}

      {/* Legend */}
      <div className="flex items-center gap-2 mt-4 text-xs text-ink-light">
        <span>Less</span>
        <div className="flex gap-1">
          <div className="w-3 h-3 rounded-sm bg-cream-200"></div>
          <div className="w-3 h-3 rounded-sm bg-discipline-primary/30"></div>
          <div className="w-3 h-3 rounded-sm bg-values-primary/50"></div>
          <div className="w-3 h-3 rounded-sm bg-control-primary/70"></div>
          <div className="w-3 h-3 rounded-sm bg-vision-primary/90"></div>
        </div>
        <span>More</span>
      </div>
    </div>
  )
}
