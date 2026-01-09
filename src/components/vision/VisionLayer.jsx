import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import RemarkableLifeView from './RemarkableLifeView'
import AspectDetailView from './AspectDetailView'

export default function VisionLayer() {
  const [loading, setLoading] = useState(true)
  const [aspects, setAspects] = useState([])
  const [selectedAspect, setSelectedAspect] = useState(null)
  const [milestones, setMilestones] = useState([])

  useEffect(() => {
    loadVisionData()
  }, [])

  const loadVisionData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()

      // Load remarkable aspects
      const { data: aspectsData } = await supabase
        .from('remarkable_aspects')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      setAspects(aspectsData || [])

      // If we have a selected aspect, load its milestones
      if (selectedAspect) {
        const { data: milestonesData } = await supabase
          .from('milestones')
          .select('*')
          .eq('aspect_id', selectedAspect.id)
          .order('order', { ascending: true })

        setMilestones(milestonesData || [])
      }
    } catch (error) {
      console.error('Error loading vision data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSelectAspect = async (aspect) => {
    setSelectedAspect(aspect)

    // Load milestones for this aspect
    try {
      const { data: milestonesData } = await supabase
        .from('milestones')
        .select('*')
        .eq('aspect_id', aspect.id)
        .order('order', { ascending: true })

      setMilestones(milestonesData || [])
    } catch (error) {
      console.error('Error loading milestones:', error)
    }
  }

  const handleBackToVision = () => {
    setSelectedAspect(null)
    setMilestones([])
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="w-12 h-12 border-4 border-vision-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  return (
    <div className="p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-4xl font-display font-bold text-ink mb-2">Vision Layer</h1>
          <p className="text-lg text-ink-light">
            {selectedAspect
              ? 'Track milestones for your remarkable life transformation'
              : 'Design the remarkable aspects of your life'}
          </p>
        </div>
        <div className="w-24 h-24 rounded-full border-8 border-cream-200 flex items-center justify-center">
          <div className="text-center">
            <div className="text-2xl font-bold text-ink">
              {aspects.length}
            </div>
            <div className="text-xs text-ink-light">aspects</div>
          </div>
        </div>
      </div>

      {/* Content */}
      {selectedAspect ? (
        <AspectDetailView
          aspect={selectedAspect}
          milestones={milestones}
          onBack={handleBackToVision}
          onUpdate={loadVisionData}
        />
      ) : (
        <RemarkableLifeView
          aspects={aspects}
          onSelectAspect={handleSelectAspect}
          onUpdate={loadVisionData}
        />
      )}
    </div>
  )
}
