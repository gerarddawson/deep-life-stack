import { useState } from 'react'
import { supabase } from '../../lib/supabase'
import AddMilestoneModal from './AddMilestoneModal'

const categoryInfo = {
  career: { icon: '💼', color: 'bg-blue-500' },
  family: { icon: '👨‍👩‍👧‍👦', color: 'bg-pink-500' },
  health: { icon: '❤️', color: 'bg-red-500' },
  creativity: { icon: '🎨', color: 'bg-purple-500' },
  community: { icon: '🤝', color: 'bg-green-500' },
  lifestyle: { icon: '🌴', color: 'bg-orange-500' },
}

const statusInfo = {
  planning: { label: 'Planning', color: 'bg-gray-100 text-gray-700' },
  in_progress: { label: 'In Progress', color: 'bg-blue-100 text-blue-700' },
  completed: { label: 'Completed', color: 'bg-green-100 text-green-700' },
  on_hold: { label: 'On Hold', color: 'bg-yellow-100 text-yellow-700' },
}

export default function AspectDetailView({ aspect, milestones, onBack, onUpdate }) {
  const [showAddMilestone, setShowAddMilestone] = useState(false)
  const [editingMilestone, setEditingMilestone] = useState(null)

  const category = categoryInfo[aspect.category] || { icon: '⭐', color: 'bg-gray-500' }
  const status = statusInfo[aspect.status] || statusInfo.planning

  const handleAddMilestone = async (milestoneData) => {
    try {
      const { data: { user } } = await supabase.auth.getUser()

      // Check for duplicate milestone titles
      const duplicate = milestones.find(m => m.title.toLowerCase() === milestoneData.title.toLowerCase())
      if (duplicate) {
        alert('A milestone with this title already exists. Please choose a different title.')
        return
      }

      const { error } = await supabase
        .from('milestones')
        .insert({
          ...milestoneData,
          user_id: user.id,
          aspect_id: aspect.id,
          order: milestones.length,
        })

      if (error) throw error

      await onUpdate()
      setShowAddMilestone(false)
    } catch (error) {
      console.error('Error adding milestone:', error)
    }
  }

  const handleEditMilestone = async (milestoneId, milestoneData) => {
    try {
      // Check for duplicate milestone titles (excluding current milestone)
      const duplicate = milestones.find(m =>
        m.id !== milestoneId && m.title.toLowerCase() === milestoneData.title.toLowerCase()
      )
      if (duplicate) {
        alert('A milestone with this title already exists. Please choose a different title.')
        return
      }

      const { error } = await supabase
        .from('milestones')
        .update(milestoneData)
        .eq('id', milestoneId)

      if (error) throw error

      await onUpdate()
      setEditingMilestone(null)
    } catch (error) {
      console.error('Error updating milestone:', error)
    }
  }

  const handleToggleMilestone = async (milestone) => {
    try {
      const newDate = milestone.completed_date ? null : new Date().toISOString().split('T')[0]

      const { error } = await supabase
        .from('milestones')
        .update({ completed_date: newDate })
        .eq('id', milestone.id)

      if (error) throw error

      await onUpdate()
    } catch (error) {
      console.error('Error toggling milestone:', error)
    }
  }

  const handleDeleteMilestone = async (e, milestoneId) => {
    e.stopPropagation() // Prevent triggering card click
    if (!confirm('Are you sure you want to delete this milestone? This action cannot be undone.')) return

    try {
      const { error } = await supabase
        .from('milestones')
        .delete()
        .eq('id', milestoneId)

      if (error) throw error

      await onUpdate()
    } catch (error) {
      console.error('Error deleting milestone:', error)
    }
  }

  const handleUpdateStatus = async (newStatus) => {
    try {
      const { error } = await supabase
        .from('remarkable_aspects')
        .update({ status: newStatus })
        .eq('id', aspect.id)

      if (error) throw error

      await onUpdate()
    } catch (error) {
      console.error('Error updating status:', error)
    }
  }

  const completedCount = milestones.filter(m => m.completed_date).length
  const progress = milestones.length > 0 ? (completedCount / milestones.length) * 100 : 0

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
      >
        <span>←</span>
        <span>Back to Vision Board</span>
      </button>

      {/* Aspect Header */}
      <div className="card p-8">
        <div className="flex items-start gap-6">
          {/* Icon */}
          <div className={`w-20 h-20 rounded-2xl ${category.color} text-white flex items-center justify-center text-4xl flex-shrink-0`}>
            {category.icon}
          </div>

          {/* Details */}
          <div className="flex-1">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h2 className="text-3xl font-bold text-gray-900 mb-2">{aspect.title}</h2>
                <div className="flex items-center gap-3">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    aspect.scale === 'large'
                      ? 'bg-vision-primary text-white'
                      : 'bg-gray-200 text-gray-700'
                  }`}>
                    {aspect.scale === 'large' ? 'Large' : 'Small'} Overhaul
                  </span>
                  <span className="text-sm text-gray-500 capitalize">{aspect.category}</span>
                </div>
              </div>

              {/* Status Selector */}
              <select
                value={aspect.status}
                onChange={(e) => handleUpdateStatus(e.target.value)}
                className={`px-4 py-2 rounded-xl text-sm font-medium border-2 border-transparent focus:outline-none ${status.color}`}
              >
                <option value="planning">Planning</option>
                <option value="in_progress">In Progress</option>
                <option value="completed">Completed</option>
                <option value="on_hold">On Hold</option>
              </select>
            </div>

            {/* Description */}
            {aspect.description && (
              <p className="text-gray-600 leading-relaxed">{aspect.description}</p>
            )}

            {/* Progress Bar */}
            {milestones.length > 0 && (
              <div className="mt-6">
                <div className="flex items-center justify-between text-sm mb-2">
                  <span className="text-gray-600">Progress</span>
                  <span className="font-medium text-gray-900">
                    {completedCount} / {milestones.length} milestones
                  </span>
                </div>
                <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full gradient-vision transition-all duration-500"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Milestones Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-2xl font-bold text-gray-900">Milestones</h3>
          <button
            onClick={() => setShowAddMilestone(true)}
            className="px-4 py-2 gradient-vision text-white rounded-xl font-medium hover:scale-105 transition-transform"
          >
            + Add Milestone
          </button>
        </div>

        {/* Milestones List */}
        {milestones.length === 0 ? (
          <div className="card p-12 text-center">
            <div className="text-6xl mb-4">🎯</div>
            <h4 className="text-xl font-bold text-gray-900 mb-2">No Milestones Yet</h4>
            <p className="text-gray-600 mb-6">
              Break down this remarkable aspect into sequential milestones to track your progress.
            </p>
            <button
              onClick={() => setShowAddMilestone(true)}
              className="px-8 py-4 gradient-vision text-white rounded-xl font-medium hover:scale-105 transition-transform"
            >
              Create First Milestone
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {milestones.map((milestone, index) => (
              <div
                key={milestone.id}
                className={`card p-6 cursor-pointer hover:shadow-md transition-shadow ${milestone.completed_date ? 'bg-green-50 border-green-200' : ''}`}
                onClick={() => setEditingMilestone(milestone)}
              >
                <div className="flex items-start gap-4">
                  {/* Checkbox */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      handleToggleMilestone(milestone)
                    }}
                    className={`w-8 h-8 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all ${
                      milestone.completed_date
                        ? 'border-green-500 bg-green-500 text-white'
                        : 'border-gray-300 hover:border-green-500'
                    }`}
                  >
                    {milestone.completed_date && '✓'}
                  </button>

                  {/* Content */}
                  <div className="flex-1">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-3 mb-2">
                          <span className="text-sm font-medium text-gray-500">Step {index + 1}</span>
                          {milestone.target_date && (
                            <span className="text-xs text-gray-400">
                              Target: {new Date(milestone.target_date).toLocaleDateString()}
                            </span>
                          )}
                        </div>
                        <h4 className={`text-lg font-bold mb-1 ${
                          milestone.completed_date ? 'text-green-700 line-through' : 'text-gray-900'
                        }`}>
                          {milestone.title}
                        </h4>
                        {milestone.description && (
                          <p className="text-gray-600 text-sm">{milestone.description}</p>
                        )}
                        {milestone.completed_date && (
                          <p className="text-green-600 text-sm mt-2">
                            ✓ Completed on {new Date(milestone.completed_date).toLocaleDateString()}
                          </p>
                        )}
                      </div>

                      {/* Delete Button */}
                      <button
                        onClick={(e) => handleDeleteMilestone(e, milestone.id)}
                        className="w-8 h-8 rounded-full hover:bg-red-100 flex items-center justify-center transition-colors text-red-600"
                        title="Delete milestone"
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add/Edit Milestone Modal */}
      {(showAddMilestone || editingMilestone) && (
        <AddMilestoneModal
          onClose={() => {
            setShowAddMilestone(false)
            setEditingMilestone(null)
          }}
          onAdd={handleAddMilestone}
          editMilestone={editingMilestone}
          onEdit={handleEditMilestone}
        />
      )}
    </div>
  )
}
