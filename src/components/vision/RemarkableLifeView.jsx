import { useState } from 'react'
import AspectCard from './AspectCard'
import AddAspectModal from './AddAspectModal'
import { supabase } from '../../lib/supabase'

const scaleFilters = [
  { value: 'all', label: 'All Aspects' },
  { value: 'small', label: 'Small Overhauls' },
  { value: 'large', label: 'Large Overhauls' },
]

const categoryFilters = [
  { value: 'all', label: 'All Categories' },
  { value: 'career', label: 'Career' },
  { value: 'family', label: 'Family' },
  { value: 'health', label: 'Health' },
  { value: 'creativity', label: 'Creativity' },
  { value: 'community', label: 'Community' },
  { value: 'lifestyle', label: 'Lifestyle' },
]

export default function RemarkableLifeView({ aspects, onSelectAspect, onUpdate }) {
  const [showAddModal, setShowAddModal] = useState(false)
  const [editingAspect, setEditingAspect] = useState(null)
  const [scaleFilter, setScaleFilter] = useState('all')
  const [categoryFilter, setCategoryFilter] = useState('all')

  const handleAddAspect = async (aspectData) => {
    try {
      const { data: { user } } = await supabase.auth.getUser()

      // Check for duplicate aspect titles
      const duplicate = aspects.find(a => a.title.toLowerCase() === aspectData.title.toLowerCase())
      if (duplicate) {
        alert('An aspect with this title already exists. Please choose a different title.')
        return
      }

      const { error } = await supabase
        .from('remarkable_aspects')
        .insert({
          ...aspectData,
          user_id: user.id,
        })

      if (error) throw error

      await onUpdate()
      setShowAddModal(false)
    } catch (error) {
      console.error('Error adding aspect:', error)
    }
  }

  const handleEditAspect = async (aspectId, aspectData) => {
    try {
      // Check for duplicate aspect titles (excluding current aspect)
      const duplicate = aspects.find(a =>
        a.id !== aspectId && a.title.toLowerCase() === aspectData.title.toLowerCase()
      )
      if (duplicate) {
        alert('An aspect with this title already exists. Please choose a different title.')
        return
      }

      const { error } = await supabase
        .from('remarkable_aspects')
        .update(aspectData)
        .eq('id', aspectId)

      if (error) throw error

      await onUpdate()
      setEditingAspect(null)
    } catch (error) {
      console.error('Error updating aspect:', error)
    }
  }

  const handleDeleteAspect = async (aspectId) => {
    if (!confirm('Are you sure you want to delete this aspect and all its milestones?')) return

    try {
      const { error } = await supabase
        .from('remarkable_aspects')
        .delete()
        .eq('id', aspectId)

      if (error) throw error

      await onUpdate()
    } catch (error) {
      console.error('Error deleting aspect:', error)
    }
  }

  // Filter aspects
  const filteredAspects = aspects.filter(aspect => {
    if (scaleFilter !== 'all' && aspect.scale !== scaleFilter) return false
    if (categoryFilter !== 'all' && aspect.category !== categoryFilter) return false
    return true
  })

  return (
    <div className="space-y-6">
      {/* Info Card */}
      <div className="card p-6 bg-gradient-to-br from-vision-primary/10 to-vision-accent/10 border border-vision-primary/20">
        <h3 className="text-xl font-bold text-gray-900 mb-2">Your Remarkable Life</h3>
        <p className="text-gray-600">
          Define the aspects of your life you want to transform. Break down small and large overhauls
          across different areas: career, family, health, creativity, community, and lifestyle.
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4">
        {/* Scale Filter */}
        <div className="flex gap-2">
          {scaleFilters.map(filter => (
            <button
              key={filter.value}
              onClick={() => setScaleFilter(filter.value)}
              className={`px-4 py-2 rounded-xl font-medium transition-all cursor-pointer ${
                scaleFilter === filter.value
                  ? 'bg-vision-primary text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {filter.label}
            </button>
          ))}
        </div>

        {/* Category Filter */}
        <div className="flex gap-2 flex-wrap">
          {categoryFilters.map(filter => (
            <button
              key={filter.value}
              onClick={() => setCategoryFilter(filter.value)}
              className={`px-4 py-2 rounded-xl font-medium transition-all cursor-pointer ${
                categoryFilter === filter.value
                  ? 'bg-vision-accent text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {filter.label}
            </button>
          ))}
        </div>
      </div>

      {/* Add Aspect Button */}
      <div>
        <button
          onClick={() => setShowAddModal(true)}
          className="px-6 py-3 gradient-vision text-white rounded-xl font-medium hover:scale-105 transition-transform inline-flex items-center gap-2"
        >
          <span className="text-xl">+</span>
          Add Remarkable Aspect
        </button>
      </div>

      {/* Aspects Grid */}
      {filteredAspects.length === 0 ? (
        <div className="card p-12 text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            {aspects.length === 0 ? 'No Aspects Yet' : 'No Matching Aspects'}
          </h2>
          <p className="text-gray-600 mb-6">
            {aspects.length === 0
              ? 'Start designing your remarkable life by adding aspects you want to transform.'
              : 'Try adjusting your filters to see more aspects.'}
          </p>
          {aspects.length === 0 && (
            <button
              onClick={() => setShowAddModal(true)}
              className="px-8 py-4 gradient-vision text-white rounded-xl font-medium hover:scale-105 transition-transform"
            >
              Create Your First Aspect
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAspects.map((aspect) => (
            <AspectCard
              key={aspect.id}
              aspect={aspect}
              onClick={() => onSelectAspect(aspect)}
              onDelete={handleDeleteAspect}
              onEdit={setEditingAspect}
            />
          ))}
        </div>
      )}

      {/* Add/Edit Aspect Modal */}
      {(showAddModal || editingAspect) && (
        <AddAspectModal
          onClose={() => {
            setShowAddModal(false)
            setEditingAspect(null)
          }}
          onAdd={handleAddAspect}
          editAspect={editingAspect}
          onEdit={handleEditAspect}
        />
      )}
    </div>
  )
}
