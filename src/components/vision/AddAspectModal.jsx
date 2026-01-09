import { useState, useEffect } from 'react'

const categories = [
  { value: 'career', label: 'Career', icon: '💼' },
  { value: 'family', label: 'Family', icon: '👨‍👩‍👧‍👦' },
  { value: 'health', label: 'Health', icon: '❤️' },
  { value: 'creativity', label: 'Creativity', icon: '🎨' },
  { value: 'community', label: 'Community', icon: '🤝' },
  { value: 'lifestyle', label: 'Lifestyle', icon: '🌴' },
]

const scales = [
  { value: 'small', label: 'Small Overhaul', description: 'Targeted improvement in one area' },
  { value: 'large', label: 'Large Overhaul', description: 'Major life transformation' },
]

export default function AddAspectModal({ onClose, onAdd, editAspect = null, onEdit = null }) {
  const isEditMode = editAspect !== null
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [category, setCategory] = useState('career')
  const [scale, setScale] = useState('small')
  const [status, setStatus] = useState('planning')

  // Initialize form with existing aspect data if editing
  useEffect(() => {
    if (editAspect) {
      setTitle(editAspect.title || '')
      setDescription(editAspect.description || '')
      setCategory(editAspect.category || 'career')
      setScale(editAspect.scale || 'small')
      setStatus(editAspect.status || 'planning')
    }
  }, [editAspect])

  const handleSubmit = (e) => {
    e.preventDefault()
    const aspectData = {
      title,
      description: description || null,
      category,
      scale,
      status,
    }

    if (isEditMode && onEdit) {
      onEdit(editAspect.id, aspectData)
    } else {
      onAdd(aspectData)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-3xl font-bold text-gray-900">
            {isEditMode ? 'Edit Remarkable Aspect' : 'Add Remarkable Aspect'}
          </h2>
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-full hover:bg-gray-100 flex items-center justify-center transition-colors"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Aspect Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Become a published author, Run a marathon"
              required
              className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-vision-primary focus:border-transparent outline-none transition text-gray-900"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What does this transformation look like? Why is it important to you?"
              rows={4}
              className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-vision-primary focus:border-transparent outline-none transition resize-none text-gray-900"
            />
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Category
            </label>
            <div className="grid grid-cols-3 gap-3">
              {categories.map((cat) => (
                <button
                  key={cat.value}
                  type="button"
                  onClick={() => setCategory(cat.value)}
                  className={`
                    p-4 rounded-xl border-2 transition-all text-center
                    ${category === cat.value
                      ? 'border-vision-primary bg-vision-primary bg-opacity-10'
                      : 'border-gray-200 hover:border-gray-300'
                    }
                  `}
                >
                  <div className="text-3xl mb-1">{cat.icon}</div>
                  <div className="text-sm font-medium text-gray-900">{cat.label}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Scale */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Scale
            </label>
            <div className="grid grid-cols-2 gap-3">
              {scales.map((s) => (
                <button
                  key={s.value}
                  type="button"
                  onClick={() => setScale(s.value)}
                  className={`
                    p-4 rounded-xl border-2 transition-all text-left
                    ${scale === s.value
                      ? 'border-vision-accent bg-vision-accent bg-opacity-10'
                      : 'border-gray-200 hover:border-gray-300'
                    }
                  `}
                >
                  <div className="font-medium text-gray-900 mb-1">{s.label}</div>
                  <div className="text-sm text-gray-500">{s.description}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Status */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Initial Status
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-vision-primary focus:border-transparent outline-none transition text-gray-900"
            >
              <option value="planning">Planning</option>
              <option value="in_progress">In Progress</option>
              <option value="on_hold">On Hold</option>
            </select>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={!title}
            className="w-full py-4 gradient-vision text-white rounded-xl font-medium text-lg hover:scale-105 transition-transform disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
          >
            {isEditMode ? 'Save Changes' : 'Add Aspect'}
          </button>
        </form>
      </div>
    </div>
  )
}
