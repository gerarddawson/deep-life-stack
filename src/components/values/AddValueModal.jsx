import { useState, useEffect } from 'react'

export default function AddValueModal({ onClose, onAdd, editValue = null, onEdit = null }) {
  const isEditMode = editValue !== null
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')

  // Initialize form with existing value data if editing
  useEffect(() => {
    if (editValue) {
      setName(editValue.name || '')
      setDescription(editValue.description || '')
    }
  }, [editValue])

  const handleSubmit = (e) => {
    e.preventDefault()
    const valueData = {
      name,
      description: description || null,
      icon: '',
    }

    if (isEditMode && onEdit) {
      onEdit(editValue.id, valueData)
    } else {
      onAdd(valueData)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-3xl font-bold text-gray-900">
            {isEditMode ? 'Edit Core Value' : 'Add Core Value'}
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
              Value Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Integrity, Family, Growth"
              required
              className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-values-primary focus:border-transparent outline-none transition text-gray-900"
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
              placeholder="What does this value mean to you? How do you want to live it?"
              rows={4}
              className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-values-primary focus:border-transparent outline-none transition resize-none text-gray-900"
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={!name}
            className="w-full py-4 gradient-values text-white rounded-xl font-medium text-lg hover:scale-105 transition-transform disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
          >
            {isEditMode ? 'Save Changes' : 'Add Value'}
          </button>
        </form>
      </div>
    </div>
  )
}
