import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import PersonalCodeEditor from './PersonalCodeEditor'
import CoreValuesView from './CoreValuesView'
import RitualsView from './RitualsView'

export default function ValuesLayer() {
  const [activeTab, setActiveTab] = useState('code') // 'code', 'values', 'rituals'
  const [loading, setLoading] = useState(true)
  const [values, setValues] = useState([])
  const [rituals, setRituals] = useState([])
  const [personalCode, setPersonalCode] = useState('')

  useEffect(() => {
    loadValuesData()
  }, [])

  const loadValuesData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()

      // Load personal code
      const { data: codeData } = await supabase
        .from('personal_code')
        .select('*')
        .eq('user_id', user.id)
        .single()

      if (codeData) {
        setPersonalCode(codeData.content || '')
      }

      // Load values
      const { data: valuesData } = await supabase
        .from('values')
        .select('*')
        .eq('user_id', user.id)
        .order('order', { ascending: true })

      setValues(valuesData || [])

      // Load rituals with value names
      const { data: ritualsData } = await supabase
        .from('rituals')
        .select('*, values(name)')
        .eq('user_id', user.id)

      setRituals(ritualsData || [])
    } catch (error) {
      console.error('Error loading values data:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="w-12 h-12 border-4 border-values-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  return (
    <div className="p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-4xl font-display font-bold text-ink mb-2">Values Layer</h1>
          <p className="text-lg text-ink-light">Define your personal code and align your rituals</p>
        </div>
        <div className="w-24 h-24 rounded-full border-8 border-cream-200 flex items-center justify-center">
          <div className="text-center">
            <div className="text-2xl font-bold text-ink">
              {values.length > 0 ? `${values.length}` : '0'}
            </div>
            <div className="text-xs text-ink-light">values</div>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-2 mb-8 border-b border-cream-300">
        <button
          onClick={() => setActiveTab('code')}
          className={`px-6 py-3 font-medium transition-colors relative ${
            activeTab === 'code'
              ? 'text-values-primary'
              : 'text-ink-light hover:text-ink'
          }`}
        >
          Personal Code
          {activeTab === 'code' && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 gradient-values"></div>
          )}
        </button>
        <button
          onClick={() => setActiveTab('values')}
          className={`px-6 py-3 font-medium transition-colors relative ${
            activeTab === 'values'
              ? 'text-values-primary'
              : 'text-ink-light hover:text-ink'
          }`}
        >
          Core Values
          {activeTab === 'values' && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 gradient-values"></div>
          )}
        </button>
        <button
          onClick={() => setActiveTab('rituals')}
          className={`px-6 py-3 font-medium transition-colors relative ${
            activeTab === 'rituals'
              ? 'text-values-primary'
              : 'text-ink-light hover:text-ink'
          }`}
        >
          Rituals
          {activeTab === 'rituals' && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 gradient-values"></div>
          )}
        </button>
      </div>

      {/* Tab Content */}
      <div>
        {activeTab === 'code' && (
          <PersonalCodeEditor
            initialContent={personalCode}
            onSave={loadValuesData}
          />
        )}
        {activeTab === 'values' && (
          <CoreValuesView
            values={values}
            onUpdate={loadValuesData}
          />
        )}
        {activeTab === 'rituals' && (
          <RitualsView
            rituals={rituals}
            values={values}
            onUpdate={loadValuesData}
          />
        )}
      </div>
    </div>
  )
}
