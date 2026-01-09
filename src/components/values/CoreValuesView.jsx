import { useState } from 'react'
import { supabase } from '../../lib/supabase'
import AddValueModal from './AddValueModal'
import ValueCard from './ValueCard'

export default function CoreValuesView({ values, onUpdate }) {
  const [showAddModal, setShowAddModal] = useState(false)
  const [editingValue, setEditingValue] = useState(null)

  const handleAddValue = async (valueData) => {
    try {
      const { data: { user } } = await supabase.auth.getUser()

      // Check for duplicate value names
      const duplicate = values.find(v => v.name.toLowerCase() === valueData.name.toLowerCase())
      if (duplicate) {
        alert('A value with this name already exists. Please choose a different name.')
        return
      }

      const { error } = await supabase
        .from('values')
        .insert({
          ...valueData,
          user_id: user.id,
          order: values.length,
        })

      if (error) throw error

      await onUpdate()
      setShowAddModal(false)
    } catch (error) {
      console.error('Error adding value:', error)
    }
  }

  const handleEditValue = async (valueId, valueData) => {
    try {
      // Check for duplicate value names (excluding current value)
      const duplicate = values.find(v =>
        v.id !== valueId && v.name.toLowerCase() === valueData.name.toLowerCase()
      )
      if (duplicate) {
        alert('A value with this name already exists. Please choose a different name.')
        return
      }

      const { error } = await supabase
        .from('values')
        .update(valueData)
        .eq('id', valueId)

      if (error) throw error

      await onUpdate()
      setEditingValue(null)
    } catch (error) {
      console.error('Error updating value:', error)
    }
  }

  const handleDeleteValue = async (valueId) => {
    if (!confirm('Are you sure you want to delete this core value?')) return

    try {
      const { error } = await supabase
        .from('values')
        .delete()
        .eq('id', valueId)

      if (error) throw error

      await onUpdate()
    } catch (error) {
      console.error('Error deleting value:', error)
    }
  }

  return (
    <div className="space-y-6">
      {/* Info Card */}
      <div className="card p-6 bg-gradient-to-br from-values-primary/10 to-values-accent/10 border border-values-primary/20">
        <h3 className="text-xl font-bold text-gray-900 mb-2">Define Your Core Values</h3>
        <p className="text-gray-600">
          Identify the 3-5 principles that are most important to you. These values will guide your
          decisions and help you create meaningful rituals.
        </p>
      </div>

      {/* Add Value Button */}
      {values.length < 5 && (
        <div>
          <button
            onClick={() => setShowAddModal(true)}
            className="px-6 py-3 gradient-values text-white rounded-xl font-medium hover:scale-105 transition-transform inline-flex items-center gap-2"
          >
            <span className="text-xl">+</span>
            Add Core Value
          </button>
        </div>
      )}

      {/* Values Grid */}
      {values.length === 0 ? (
        <div className="card p-12 text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">No Core Values Yet</h2>
          <p className="text-gray-600 mb-6">
            Start by defining 3-5 core values that are most important to you.
          </p>
          <button
            onClick={() => setShowAddModal(true)}
            className="px-8 py-4 gradient-values text-white rounded-xl font-medium hover:scale-105 transition-transform"
          >
            Add Your First Value
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {values.map((value) => (
            <ValueCard
              key={value.id}
              value={value}
              onDelete={handleDeleteValue}
              onEdit={() => setEditingValue(value)}
            />
          ))}
        </div>
      )}

      {/* Add/Edit Value Modal */}
      {(showAddModal || editingValue) && (
        <AddValueModal
          onClose={() => {
            setShowAddModal(false)
            setEditingValue(null)
          }}
          onAdd={handleAddValue}
          editValue={editingValue}
          onEdit={handleEditValue}
        />
      )}
    </div>
  )
}
