import { useState, useEffect } from 'react'

export default function AddMilestoneModal({ onClose, onAdd, editMilestone = null, onEdit = null }) {
  const isEditMode = editMilestone !== null
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [targetDate, setTargetDate] = useState('')

  // Initialize form with existing milestone data if editing
  useEffect(() => {
    if (editMilestone) {
      setTitle(editMilestone.title || '')
      setDescription(editMilestone.description || '')
      setTargetDate(editMilestone.target_date || '')
    }
  }, [editMilestone])

  const handleSubmit = (e) => {
    e.preventDefault()
    const milestoneData = {
      title,
      description: description || null,
      target_date: targetDate || null,
    }

    if (isEditMode && onEdit) {
      onEdit(editMilestone.id, milestoneData)
    } else {
      onAdd(milestoneData)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl p-8 max-w-2xl w-full">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-3xl font-bold text-gray-900">
            {isEditMode ? 'Edit Milestone' : 'Add Milestone'}
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
              Milestone Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Complete first draft, Launch beta version"
              required
              className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-vision-primary focus:border-transparent outline-none transition text-gray-900"
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
              placeholder="What needs to happen to complete this milestone?"
              rows={3}
              className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-vision-primary focus:border-transparent outline-none transition resize-none text-gray-900"
            />
          </div>

          {/* Target Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Target Date (Optional)
            </label>
            <input
              type="date"
              value={targetDate}
              onChange={(e) => setTargetDate(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-vision-primary focus:border-transparent outline-none transition text-gray-900"
            />
          </div>

          {/* Info */}
          <div className="bg-vision-primary bg-opacity-10 border border-vision-primary border-opacity-20 rounded-xl p-4">
            <p className="text-sm text-gray-700">
              💡 <strong>Tip:</strong> Break down your remarkable aspect into sequential milestones.
              Each milestone should be a clear, achievable step toward your vision.
            </p>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={!title}
            className="w-full py-4 gradient-vision text-white rounded-xl font-medium text-lg hover:scale-105 transition-transform disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
          >
            {isEditMode ? 'Save Changes' : 'Add Milestone'}
          </button>
        </form>
      </div>
    </div>
  )
}
