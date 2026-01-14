import { useState, useEffect } from 'react'

// Newport's three keystone habit categories
const habitCategories = [
  {
    value: 'body',
    label: 'Body',
    description: 'Physical health and wellness',
    examples: 'Morning walk, Exercise, Stretching, Sleep routine',
    color: '#10B981' // Green
  },
  {
    value: 'mind',
    label: 'Mind',
    description: 'Mental acuity and learning',
    examples: 'Daily reading, Journaling, Learning a skill, Meditation',
    color: '#3B82F6' // Blue
  },
  {
    value: 'heart',
    label: 'Heart',
    description: 'Emotional connection and relationships',
    examples: 'Family dinner, Call a friend, Quality time, Acts of kindness',
    color: '#EC4899' // Pink
  }
]

export default function AddHabitModal({ onClose, onAdd, editHabit = null, onEdit = null, onDelete = null, existingCategories = [] }) {
  const isEditMode = editHabit !== null
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('')

  // Initialize form with existing habit data if editing
  useEffect(() => {
    if (editHabit) {
      setName(editHabit.name || '')
      setDescription(editHabit.description || '')
      setSelectedCategory(editHabit.category || '')
    }
  }, [editHabit])

  const handleSubmit = (e) => {
    e.preventDefault()
    const categoryData = habitCategories.find(c => c.value === selectedCategory)
    const habitData = {
      name,
      description: description || null,
      icon: '',
      color: categoryData?.color || '#06B6D4',
      category: selectedCategory,
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

          {/* Category Selector - Body/Mind/Heart */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Choose a Category
            </label>
            <p className="text-sm text-gray-500 mb-4">
              Cal Newport recommends one keystone habit in each area: Body, Mind, and Heart.
            </p>
            <div className="grid grid-cols-1 gap-3">
              {habitCategories.map((category) => {
                const isSelected = selectedCategory === category.value
                const isUsed = existingCategories.includes(category.value) && (!editHabit || editHabit.category !== category.value)

                return (
                  <button
                    key={category.value}
                    type="button"
                    onClick={() => !isUsed && setSelectedCategory(category.value)}
                    disabled={isUsed}
                    className={`
                      p-4 rounded-xl border-2 text-left transition-all
                      ${isSelected
                        ? 'border-gray-900 ring-2 ring-gray-900 ring-offset-2'
                        : isUsed
                          ? 'border-gray-200 bg-gray-50 opacity-50 cursor-not-allowed'
                          : 'border-gray-200 hover:border-gray-400'
                      }
                    `}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold"
                        style={{ backgroundColor: category.color }}
                      >
                        {category.label[0]}
                      </div>
                      <div className="flex-1">
                        <div className="font-medium text-gray-900 flex items-center gap-2">
                          {category.label}
                          {isUsed && <span className="text-xs text-gray-500">(already have one)</span>}
                        </div>
                        <div className="text-sm text-gray-500">{category.description}</div>
                        <div className="text-xs text-gray-400 mt-1">e.g., {category.examples}</div>
                      </div>
                    </div>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={!name || !selectedCategory}
            className="w-full py-4 gradient-discipline text-white rounded-xl font-medium text-lg hover:scale-105 transition-transform disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
          >
            {isEditMode ? 'Save Changes' : 'Create Habit'}
          </button>

          {/* Delete Button - Only in edit mode */}
          {isEditMode && onDelete && (
            <button
              type="button"
              onClick={() => {
                if (window.confirm('Are you sure you want to delete this habit? All completion history will be lost.')) {
                  onDelete(editHabit.id)
                }
              }}
              className="w-full py-3 mt-3 text-red-600 hover:bg-red-50 rounded-xl font-medium transition-colors"
            >
              Delete Habit
            </button>
          )}
        </form>
      </div>
    </div>
  )
}
