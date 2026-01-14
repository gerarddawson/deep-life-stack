import { useState } from 'react'

// Convert 24-hour time to 12-hour format with AM/PM
function formatTime12Hour(time24) {
  if (!time24) return ''
  const [hours, minutes] = time24.split(':').map(Number)
  const period = hours >= 12 ? 'PM' : 'AM'
  const hours12 = hours % 12 || 12
  return `${hours12}:${minutes.toString().padStart(2, '0')} ${period}`
}

const categories = [
  { value: 'deep-work', label: 'Deep Work', color: 'bg-blue-500' },
  { value: 'meetings', label: 'Meetings', color: 'bg-purple-500' },
  { value: 'admin', label: 'Admin', color: 'bg-gray-500' },
  { value: 'exercise', label: 'Exercise', color: 'bg-green-500' },
  { value: 'family', label: 'Family', color: 'bg-pink-500' },
  { value: 'personal', label: 'Personal', color: 'bg-orange-500' },
]

export default function TimeBlockingView({ timeBlocks, onChange }) {
  const [showAddBlock, setShowAddBlock] = useState(false)
  const [editingIndex, setEditingIndex] = useState(null)
  const [newBlock, setNewBlock] = useState({
    start: '09:00',
    end: '10:00',
    title: '',
    category: 'deep-work'
  })

  // Calculate start/end time for a new block based on last block's end time
  const getNextBlockTimes = () => {
    if (timeBlocks.length === 0) {
      return { start: '09:00', end: '10:00' }
    }
    // Sort blocks by start time and get the last one's end time
    const sortedBlocks = [...timeBlocks].sort((a, b) => a.start.localeCompare(b.start))
    const lastBlock = sortedBlocks[sortedBlocks.length - 1]
    const startTime = lastBlock.end

    // Calculate end time (1 hour later)
    const [hours, minutes] = startTime.split(':').map(Number)
    const endHours = (hours + 1) % 24
    const endTime = `${endHours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`

    return { start: startTime, end: endTime }
  }

  const handleShowAddBlock = () => {
    const { start, end } = getNextBlockTimes()
    setNewBlock({
      start,
      end,
      title: '',
      category: 'deep-work'
    })
    setShowAddBlock(true)
  }

  const handleAddBlock = () => {
    if (!newBlock.title.trim()) return

    const updatedBlocks = [...timeBlocks, newBlock].sort((a, b) => {
      return a.start.localeCompare(b.start)
    })

    onChange(updatedBlocks)
    setNewBlock({
      start: '09:00',
      end: '10:00',
      title: '',
      category: 'deep-work'
    })
    setShowAddBlock(false)
  }

  const handleRemoveBlock = (index) => {
    onChange(timeBlocks.filter((_, i) => i !== index))
  }

  const handleEditBlock = (index) => {
    setNewBlock({ ...timeBlocks[index] })
    setEditingIndex(index)
    setShowAddBlock(false)
  }

  const handleSaveEdit = () => {
    if (!newBlock.title.trim()) return

    const updatedBlocks = [...timeBlocks]
    updatedBlocks[editingIndex] = newBlock
    updatedBlocks.sort((a, b) => a.start.localeCompare(b.start))

    onChange(updatedBlocks)
    setEditingIndex(null)
    setNewBlock({
      start: '09:00',
      end: '10:00',
      title: '',
      category: 'deep-work'
    })
  }

  const handleCancelEdit = () => {
    setEditingIndex(null)
    setNewBlock({
      start: '09:00',
      end: '10:00',
      title: '',
      category: 'deep-work'
    })
  }

  const getCategoryColor = (categoryValue) => {
    return categories.find(c => c.value === categoryValue)?.color || 'bg-gray-500'
  }

  const getCategoryLabel = (categoryValue) => {
    return categories.find(c => c.value === categoryValue)?.label || categoryValue
  }

  return (
    <div className="space-y-3">
      {/* Existing Time Blocks */}
      {timeBlocks.length === 0 && !showAddBlock && (
        <div className="text-center py-8 text-gray-500">
          <p className="mb-4">No time blocks yet</p>
          <button
            onClick={handleShowAddBlock}
            className="px-4 py-2 bg-control-primary text-white rounded-lg hover:bg-control-accent transition-colors"
          >
            Add Time Block
          </button>
        </div>
      )}

      {timeBlocks.map((block, index) => (
        editingIndex === index ? (
          /* Edit Form */
          <div key={index} className="p-4 bg-gray-50 rounded-xl border-2 border-control-primary space-y-3">
            {/* Time Range */}
            <div className="flex items-center gap-3">
              <input
                type="time"
                value={newBlock.start}
                onChange={(e) => setNewBlock({ ...newBlock, start: e.target.value })}
                className="px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-control-primary outline-none text-gray-900"
              />
              <span className="text-gray-500">to</span>
              <input
                type="time"
                value={newBlock.end}
                onChange={(e) => setNewBlock({ ...newBlock, end: e.target.value })}
                className="px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-control-primary outline-none text-gray-900"
              />
            </div>

            {/* Title */}
            <input
              type="text"
              value={newBlock.title}
              onChange={(e) => setNewBlock({ ...newBlock, title: e.target.value })}
              placeholder="What are you working on?"
              className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-control-primary outline-none text-gray-900"
            />

            {/* Category */}
            <select
              value={newBlock.category}
              onChange={(e) => setNewBlock({ ...newBlock, category: e.target.value })}
              className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-control-primary outline-none text-gray-900"
            >
              {categories.map(cat => (
                <option key={cat.value} value={cat.value}>
                  {cat.label}
                </option>
              ))}
            </select>

            {/* Buttons */}
            <div className="flex gap-2">
              <button
                onClick={handleSaveEdit}
                className="flex-1 px-4 py-2 bg-control-primary text-white rounded-lg hover:bg-control-accent transition-colors font-medium"
              >
                Save
              </button>
              <button
                onClick={handleCancelEdit}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  handleRemoveBlock(index)
                  handleCancelEdit()
                }}
                className="px-4 py-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        ) : (
          /* Display Mode */
          <div
            key={index}
            className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl border border-gray-200 cursor-pointer hover:border-control-primary/50 transition-colors"
            onClick={() => handleEditBlock(index)}
          >
            {/* Time */}
            <div className="flex items-center gap-2 text-sm font-medium text-gray-700 min-w-[160px]">
              <span>{formatTime12Hour(block.start)}</span>
              <span>→</span>
              <span>{formatTime12Hour(block.end)}</span>
            </div>

            {/* Category Badge */}
            <div className={`px-3 py-1 ${getCategoryColor(block.category)} text-white text-xs rounded-full font-medium`}>
              {getCategoryLabel(block.category)}
            </div>

            {/* Title */}
            <div className="flex-1 font-medium text-gray-900">
              {block.title}
            </div>

            {/* Edit indicator */}
            <span className="text-gray-400 text-sm">Click to edit</span>
          </div>
        )
      ))}

      {/* Add Block Form */}
      {showAddBlock ? (
        <div className="p-4 bg-gray-50 rounded-xl border-2 border-control-primary space-y-3">
          {/* Time Range */}
          <div className="flex items-center gap-3">
            <input
              type="time"
              value={newBlock.start}
              onChange={(e) => setNewBlock({ ...newBlock, start: e.target.value })}
              className="px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-control-primary outline-none text-gray-900"
            />
            <span className="text-gray-500">to</span>
            <input
              type="time"
              value={newBlock.end}
              onChange={(e) => setNewBlock({ ...newBlock, end: e.target.value })}
              className="px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-control-primary outline-none text-gray-900"
            />
          </div>

          {/* Title */}
          <input
            type="text"
            value={newBlock.title}
            onChange={(e) => setNewBlock({ ...newBlock, title: e.target.value })}
            placeholder="What are you working on?"
            className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-control-primary outline-none text-gray-900"
          />

          {/* Category */}
          <select
            value={newBlock.category}
            onChange={(e) => setNewBlock({ ...newBlock, category: e.target.value })}
            className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-control-primary outline-none text-gray-900"
          >
            {categories.map(cat => (
              <option key={cat.value} value={cat.value}>
                {cat.label}
              </option>
            ))}
          </select>

          {/* Buttons */}
          <div className="flex gap-2">
            <button
              onClick={handleAddBlock}
              className="flex-1 px-4 py-2 bg-control-primary text-white rounded-lg hover:bg-control-accent transition-colors font-medium"
            >
              Add Block
            </button>
            <button
              onClick={() => setShowAddBlock(false)}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : timeBlocks.length > 0 && (
        <button
          onClick={handleShowAddBlock}
          className="w-full py-3 border-2 border-dashed border-gray-300 rounded-xl text-gray-600 hover:border-control-primary hover:text-control-primary transition-colors font-medium"
        >
          + Add Time Block
        </button>
      )}
    </div>
  )
}
