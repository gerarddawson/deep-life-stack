import { useState, useEffect } from 'react'

const frequencies = [
  { value: 'daily', label: 'Daily', description: 'Every day' },
  { value: 'weekly', label: 'Weekly', description: 'Once a week' },
  { value: 'monthly', label: 'Monthly', description: 'Once a month' },
  { value: 'quarterly', label: 'Quarterly', description: 'Every 3 months' },
]

export default function AddRitualModal({ onClose, onAdd, values, editRitual = null, onEdit = null }) {
  const isEditMode = editRitual !== null
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [frequency, setFrequency] = useState('weekly')
  const [valueId, setValueId] = useState(values[0]?.id || '')

  // Initialize form with existing ritual data if editing
  useEffect(() => {
    if (editRitual) {
      setName(editRitual.name || '')
      setDescription(editRitual.description || '')
      setFrequency(editRitual.frequency || 'weekly')
      setValueId(editRitual.value_id || '')
    }
  }, [editRitual])

  const handleSubmit = (e) => {
    e.preventDefault()
    const ritualData = {
      name,
      description: description || null,
      frequency,
      value_id: valueId || null,
    }

    if (isEditMode && onEdit) {
      onEdit(editRitual.id, ritualData)
    } else {
      onAdd(ritualData)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-3xl font-bold text-gray-900">
            {isEditMode ? 'Edit Ritual' : 'Add Ritual'}
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
              Ritual Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Weekly Family Dinner, Monthly Review"
              required
              className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-values-primary focus:border-transparent outline-none transition text-gray-900"
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
              placeholder="What does this ritual involve?"
              rows={3}
              className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-values-primary focus:border-transparent outline-none transition resize-none text-gray-900"
            />
          </div>

          {/* Frequency */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Frequency
            </label>
            <div className="grid grid-cols-2 gap-3">
              {frequencies.map((freq) => (
                <button
                  key={freq.value}
                  type="button"
                  onClick={() => setFrequency(freq.value)}
                  className={`
                    p-4 rounded-xl border-2 transition-all text-left
                    ${frequency === freq.value
                      ? 'border-values-primary bg-values-primary bg-opacity-10'
                      : 'border-gray-200 hover:border-gray-300'
                    }
                  `}
                >
                  <div className="font-medium text-gray-900">{freq.label}</div>
                  <div className="text-sm text-gray-500">{freq.description}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Linked Value */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Link to Core Value (Optional)
            </label>
            <select
              value={valueId}
              onChange={(e) => setValueId(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-values-primary focus:border-transparent outline-none transition text-gray-900"
            >
              <option value="">No linked value</option>
              {values.map((value) => (
                <option key={value.id} value={value.id}>
                  {value.icon} {value.name}
                </option>
              ))}
            </select>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={!name}
            className="w-full py-4 gradient-values text-white rounded-xl font-medium text-lg hover:scale-105 transition-transform disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
          >
            {isEditMode ? 'Save Changes' : 'Create Ritual'}
          </button>
        </form>
      </div>
    </div>
  )
}
