import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'

export default function PersonalCodeEditor({ initialContent, onSave }) {
  const [content, setContent] = useState(initialContent || '')
  const [saving, setSaving] = useState(false)
  const [lastSaved, setLastSaved] = useState(null)
  const [hasChanges, setHasChanges] = useState(false)

  useEffect(() => {
    setContent(initialContent || '')
  }, [initialContent])

  useEffect(() => {
    // Auto-save after 2 seconds of no typing
    if (hasChanges) {
      const timer = setTimeout(() => {
        handleSave()
      }, 2000)
      return () => clearTimeout(timer)
    }
  }, [content, hasChanges])

  const handleSave = async () => {
    if (!hasChanges) return

    setSaving(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()

      const { error } = await supabase
        .from('personal_code')
        .upsert({
          user_id: user.id,
          content: content,
          updated_at: new Date().toISOString(),
        })

      if (error) throw error

      setLastSaved(new Date())
      setHasChanges(false)
      if (onSave) onSave()
    } catch (error) {
      console.error('Error saving personal code:', error)
    } finally {
      setSaving(false)
    }
  }

  const handleChange = (e) => {
    setContent(e.target.value)
    setHasChanges(true)
  }

  return (
    <div className="space-y-4">
      {/* Info Card */}
      <div className="card p-6 bg-gradient-to-br from-values-primary/10 to-values-accent/10 border border-values-primary/20">
        <h3 className="text-xl font-bold text-gray-900 mb-2">Your Personal Code</h3>
        <p className="text-gray-600 mb-4">
          Write the principles and rules that guide your life. This is your personal constitution -
          a set of values and behaviors you commit to living by.
        </p>
        <div className="flex items-center gap-4 text-sm">
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${saving ? 'bg-yellow-500' : hasChanges ? 'bg-orange-500' : 'bg-green-500'}`}></div>
            <span className="text-gray-600">
              {saving ? 'Saving...' : hasChanges ? 'Unsaved changes' : 'All changes saved'}
            </span>
          </div>
          {lastSaved && (
            <span className="text-gray-500">
              Last saved: {lastSaved.toLocaleTimeString()}
            </span>
          )}
        </div>
      </div>

      {/* Editor */}
      <div className="card p-6">
        <textarea
          value={content}
          onChange={handleChange}
          placeholder="Example:&#10;&#10;1. I will maintain my keystone habits every day, no matter what.&#10;&#10;2. I will be present with my family, not distracted by devices.&#10;&#10;3. I will speak honestly and act with integrity in all situations.&#10;&#10;4. I will continuously learn and grow, dedicating time to reading and reflection.&#10;&#10;Write your own principles here..."
          className="w-full h-96 px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-values-primary focus:border-transparent outline-none transition resize-none text-gray-900 font-mono text-sm leading-relaxed"
        />
      </div>

      {/* Manual Save Button */}
      <div className="flex justify-end">
        <button
          onClick={handleSave}
          disabled={!hasChanges || saving}
          className="px-6 py-3 gradient-values text-white rounded-xl font-medium hover:scale-105 transition-transform disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
        >
          {saving ? 'Saving...' : 'Save Now'}
        </button>
      </div>
    </div>
  )
}
