import { useState } from 'react'
import { supabase } from '../../lib/supabase'
import AddRitualModal from './AddRitualModal'

const frequencyLabels = {
  daily: 'Daily',
  weekly: 'Weekly',
  monthly: 'Monthly',
  quarterly: 'Quarterly'
}

const frequencyColors = {
  daily: 'bg-blue-100 text-blue-700',
  weekly: 'bg-green-100 text-green-700',
  monthly: 'bg-purple-100 text-purple-700',
  quarterly: 'bg-orange-100 text-orange-700'
}

export default function RitualsView({ rituals, values, onUpdate }) {
  const [showAddModal, setShowAddModal] = useState(false)
  const [editingRitual, setEditingRitual] = useState(null)

  const handleAddRitual = async (ritualData) => {
    try {
      const { data: { user } } = await supabase.auth.getUser()

      // Check for duplicate ritual names
      const duplicate = rituals.find(r => r.name.toLowerCase() === ritualData.name.toLowerCase())
      if (duplicate) {
        alert('A ritual with this name already exists. Please choose a different name.')
        return
      }

      const { error } = await supabase
        .from('rituals')
        .insert({
          ...ritualData,
          user_id: user.id,
        })

      if (error) throw error

      await onUpdate()
      setShowAddModal(false)
    } catch (error) {
      console.error('Error adding ritual:', error)
    }
  }

  const handleEditRitual = async (ritualId, ritualData) => {
    try {
      // Check for duplicate ritual names (excluding current ritual)
      const duplicate = rituals.find(r =>
        r.id !== ritualId && r.name.toLowerCase() === ritualData.name.toLowerCase()
      )
      if (duplicate) {
        alert('A ritual with this name already exists. Please choose a different name.')
        return
      }

      const { error } = await supabase
        .from('rituals')
        .update(ritualData)
        .eq('id', ritualId)

      if (error) throw error

      await onUpdate()
      setEditingRitual(null)
    } catch (error) {
      console.error('Error updating ritual:', error)
    }
  }

  const handleDeleteRitual = async (e, ritualId) => {
    e.stopPropagation() // Prevent triggering card click
    if (!confirm('Are you sure you want to delete this ritual? This action cannot be undone.')) return

    try {
      const { error } = await supabase
        .from('rituals')
        .delete()
        .eq('id', ritualId)

      if (error) throw error

      await onUpdate()
    } catch (error) {
      console.error('Error deleting ritual:', error)
    }
  }

  return (
    <div className="space-y-6">
      {/* Info Card */}
      <div className="card p-6 bg-gradient-to-br from-values-primary/10 to-values-accent/10 border border-values-primary/20">
        <h3 className="text-xl font-bold text-gray-900 mb-2">Value-Aligned Rituals</h3>
        <p className="text-gray-600">
          Create rituals that embody your core values. These are regular practices that help you
          live according to your principles.
        </p>
      </div>

      {/* Add Ritual Button */}
      <div>
        <button
          onClick={() => setShowAddModal(true)}
          disabled={values.length === 0}
          className="px-6 py-3 gradient-values text-white rounded-xl font-medium hover:scale-105 transition-transform inline-flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
        >
          <span className="text-xl">+</span>
          Add Ritual
        </button>
        {values.length === 0 && (
          <p className="text-sm text-gray-500 mt-2">
            Add some core values first before creating rituals
          </p>
        )}
      </div>

      {/* Rituals List */}
      {rituals.length === 0 ? (
        <div className="card p-12 text-center">
          <div className="text-6xl mb-4">🕯️</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">No Rituals Yet</h2>
          <p className="text-gray-600 mb-6">
            Create rituals that align with your values and help you live according to your personal code.
          </p>
          {values.length > 0 && (
            <button
              onClick={() => setShowAddModal(true)}
              className="px-8 py-4 gradient-values text-white rounded-xl font-medium hover:scale-105 transition-transform"
            >
              Create Your First Ritual
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {rituals.map((ritual) => (
            <div
              key={ritual.id}
              className="card p-6 hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => setEditingRitual(ritual)}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  {/* Ritual Name */}
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{ritual.name}</h3>

                  {/* Description */}
                  {ritual.description && (
                    <p className="text-gray-600 mb-4">{ritual.description}</p>
                  )}

                  {/* Tags */}
                  <div className="flex items-center gap-3">
                    {/* Frequency Badge */}
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${frequencyColors[ritual.frequency]}`}>
                      {frequencyLabels[ritual.frequency]}
                    </span>

                    {/* Linked Value */}
                    {ritual.values && (
                      <span className="px-3 py-1 rounded-full text-xs font-medium bg-values-primary/10 text-values-primary">
                        {ritual.values.name}
                      </span>
                    )}
                  </div>
                </div>

                {/* Delete Button */}
                <button
                  onClick={(e) => handleDeleteRitual(e, ritual.id)}
                  className="w-8 h-8 rounded-full hover:bg-red-100 flex items-center justify-center transition-colors text-red-600 flex-shrink-0 ml-4"
                  title="Delete ritual"
                >
                  ✕
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add/Edit Ritual Modal */}
      {(showAddModal || editingRitual) && (
        <AddRitualModal
          onClose={() => {
            setShowAddModal(false)
            setEditingRitual(null)
          }}
          onAdd={handleAddRitual}
          editRitual={editingRitual}
          onEdit={handleEditRitual}
          values={values}
        />
      )}
    </div>
  )
}
