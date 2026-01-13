// Get local date string in YYYY-MM-DD format (avoids timezone issues with toISOString)
function getLocalDateString(date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

/**
 * Calculate the current streak for a habit based on completions
 * @param {Array} completions - Array of completion objects with date and completed fields
 * @returns {number} Current streak in days
 */
export function calculateCurrentStreak(completions) {
  if (!completions || completions.length === 0) return 0

  // Filter only completed entries and sort by date descending
  const completed = completions
    .filter(c => c.completed)
    .sort((a, b) => new Date(b.date) - new Date(a.date))

  if (completed.length === 0) return 0

  const today = getLocalDateString(new Date())
  const yesterdayDate = new Date()
  yesterdayDate.setDate(yesterdayDate.getDate() - 1)
  const yesterday = getLocalDateString(yesterdayDate)

  // Check if the most recent completion is today or yesterday
  const mostRecent = completed[0].date
  if (mostRecent !== today && mostRecent !== yesterday) return 0

  // Count consecutive days
  let streak = 0
  let currentDate = new Date()

  for (let i = 0; i < completed.length; i++) {
    const expectedDate = getLocalDateString(currentDate)

    if (completed[i].date === expectedDate) {
      streak++
      currentDate.setDate(currentDate.getDate() - 1) // Go back one day
    } else {
      break
    }
  }

  return streak
}

/**
 * Calculate completion rate for a habit since creation
 * @param {Array} completions - Array of completion objects
 * @param {string} createdAt - ISO date string of when habit was created
 * @returns {number} Completion rate from 0 to 1
 */
export function calculateCompletionRate(completions, createdAt) {
  if (!createdAt) return 0

  const created = new Date(createdAt)
  const today = new Date()

  // Calculate days since creation
  const daysSinceCreation = Math.floor((today - created) / (1000 * 60 * 60 * 24)) + 1

  if (daysSinceCreation <= 0) return 0

  // Count completed days
  const completedDays = completions?.filter(c => c.completed).length || 0

  return Math.min(completedDays / daysSinceCreation, 1)
}

/**
 * Calculate longest streak for a habit
 * @param {Array} completions - Array of completion objects
 * @returns {number} Longest streak in days
 */
export function calculateLongestStreak(completions) {
  if (!completions || completions.length === 0) return 0

  const completed = completions
    .filter(c => c.completed)
    .sort((a, b) => new Date(a.date) - new Date(b.date))

  if (completed.length === 0) return 0

  let longestStreak = 0
  let currentStreak = 1

  for (let i = 1; i < completed.length; i++) {
    const prevDate = new Date(completed[i - 1].date)
    const currDate = new Date(completed[i].date)
    const dayDiff = Math.floor((currDate - prevDate) / (1000 * 60 * 60 * 24))

    if (dayDiff === 1) {
      currentStreak++
    } else {
      longestStreak = Math.max(longestStreak, currentStreak)
      currentStreak = 1
    }
  }

  return Math.max(longestStreak, currentStreak)
}

/**
 * Get completion data for a calendar heatmap
 * @param {Array} completions - Array of completion objects
 * @param {number} days - Number of days to show (default 30)
 * @returns {Array} Array of {date, completed} objects for each day
 */
export function getHeatmapData(completions, days = 30) {
  const data = []
  const today = new Date()

  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(today)
    date.setDate(date.getDate() - i)
    const dateStr = getLocalDateString(date)

    const completion = completions?.find(c => c.date === dateStr)

    data.push({
      date: dateStr,
      completed: completion?.completed || false,
      day: date.getDate(),
      month: date.getMonth(),
      year: date.getFullYear()
    })
  }

  return data
}
