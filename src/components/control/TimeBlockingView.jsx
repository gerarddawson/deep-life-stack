import { useState } from 'react'

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
        <div
          key={index}
          className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl border border-gray-200"
        >
          {/* Time */}
          <div className="flex items-center gap-2 text-sm font-medium text-gray-700 min-w-[120px]">
            <span>{block.start}</span>
            <span>→</span>
            <span>{block.end}</span>
          </div>

          {/* Category Badge */}
          <div className={`px-3 py-1 ${getCategoryColor(block.category)} text-white text-xs rounded-full font-medium`}>
            {getCategoryLabel(block.category)}
          </div>

          {/* Title */}
          <div className="flex-1 font-medium text-gray-900">
            {block.title}
          </div>

          {/* Remove Button */}
          <button
            onClick={() => handleRemoveBlock(index)}
            className="w-8 h-8 rounded-full hover:bg-red-100 flex items-center justify-center transition-colors text-red-600"
          >
            ✕
          </button>
        </div>
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
