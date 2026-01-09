import { useState, useEffect } from 'react'

const availableColors = [
  '#06B6D4', '#3B82F6', '#8B5CF6', '#EC4899',
  '#F59E0B', '#10B981', '#EF4444', '#6B7280'
]

export default function AddHabitModal({ onClose, onAdd, editHabit = null, onEdit = null }) {
  const isEditMode = editHabit !== null
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [selectedColor, setSelectedColor] = useState(availableColors[0])

  // Initialize form with existing habit data if editing
  useEffect(() => {
    if (editHabit) {
      setName(editHabit.name || '')
      setDescription(editHabit.description || '')
      setSelectedColor(editHabit.color || availableColors[0])
    }
  }, [editHabit])

  const handleSubmit = (e) => {
    e.preventDefault()
    const habitData = {
      name,
      description: description || null,
      icon: '',
      color: selectedColor,
    }

    if (isEditMode && onEdit) {
      onEdit(editHabit.id, habitData)
    } else {
      onAdd(habitData)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-3xl font-bold text-gray-900">
            {isEditMode ? 'Edit Habit' : 'New Keystone Habit'}
          </h2>
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-full hover:bg-gray-100 flex items-center justify-center transition-colors"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Habit Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Morning Exercise"
              required
              className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-discipline-primary focus:border-transparent outline-none transition"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description (Optional)
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What does this habit involve?"
              rows={3}
              className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-discipline-primary focus:border-transparent outline-none transition resize-none"
            />
          </div>

          {/* Color Selector */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Choose a Color
            </label>
            <div className="grid grid-cols-8 gap-3">
              {availableColors.map((color) => (
                <button
                  key={color}
                  type="button"
                  onClick={() => setSelectedColor(color)}
                  className={`
                    w-12 h-12 rounded-xl transition-all
                    ${selectedColor === color
                      ? 'ring-4 ring-offset-2 ring-gray-900 scale-110'
                      : 'hover:scale-105'
                    }
                  `}
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={!name}
            className="w-full py-4 gradient-discipline text-white rounded-xl font-medium text-lg hover:scale-105 transition-transform disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
          >
            {isEditMode ? 'Save Changes' : 'Create Habit'}
          </button>
        </form>
      </div>
    </div>
  )
}
