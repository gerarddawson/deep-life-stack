import { useState, useEffect } from 'react'

const automationCategories = [
  { value: 'financial', label: 'Financial', icon: '💰', color: 'bg-green-500' },
  { value: 'digital', label: 'Digital', icon: '💻', color: 'bg-blue-500' },
  { value: 'household', label: 'Household', icon: '🏠', color: 'bg-purple-500' },
  { value: 'health', label: 'Health', icon: '❤️', color: 'bg-red-500' },
  { value: 'work', label: 'Work', icon: '💼', color: 'bg-gray-500' },
]

export default function AutomationsView() {
  const [automations, setAutomations] = useState([])
  const [showAddModal, setShowAddModal] = useState(false)
  const [newAutomation, setNewAutomation] = useState({
    title: '',
    description: '',
    category: 'financial',
    status: 'active'
  })

  useEffect(() => {
    // Load from localStorage
    const saved = localStorage.getItem('automations')
    if (saved) {
      setAutomations(JSON.parse(saved))
    }
  }, [])

  const saveToStorage = (updatedAutomations) => {
    localStorage.setItem('automations', JSON.stringify(updatedAutomations))
    setAutomations(updatedAutomations)
  }

  const handleAdd = () => {
    if (!newAutomation.title.trim()) return

    const automation = {
      ...newAutomation,
      id: Date.now(),
      createdAt: new Date().toISOString()
    }

    saveToStorage([...automations, automation])
    setNewAutomation({
      title: '',
      description: '',
      category: 'financial',
      status: 'active'
    })
    setShowAddModal(false)
  }

  const handleDelete = (id) => {
    if (!confirm('Are you sure you want to delete this automation?')) return
    saveToStorage(automations.filter(a => a.id !== id))
  }

  const toggleStatus = (id) => {
    const updated = automations.map(a =>
      a.id === id
        ? { ...a, status: a.status === 'active' ? 'inactive' : 'active' }
        : a
    )
    saveToStorage(updated)
  }

  const getCategoryInfo = (categoryValue) => {
    return automationCategories.find(c => c.value === categoryValue) || automationCategories[0]
  }

  const groupedAutomations = automationCategories.map(category => ({
    ...category,
    items: automations.filter(a => a.category === category.value)
  }))

  return (
    <div className="space-y-6">
      {/* Info Card */}
      <div className="card p-6 bg-gradient-to-br from-control-primary/10 to-control-accent/10 border border-control-primary/20">
        <h3 className="text-xl font-bold text-gray-900 mb-2">Automations</h3>
        <p className="text-gray-600">
          Track all your automated systems - bill payments, digital workflows, recurring tasks, and more.
          Automation is key to maintaining control without constant effort.
        </p>
      </div>

      {/* Add Automation Button */}
      <div>
        <button
          onClick={() => setShowAddModal(true)}
          className="px-6 py-3 gradient-control text-white rounded-xl font-medium hover:scale-105 transition-transform inline-flex items-center gap-2"
        >
          <span className="text-xl">+</span>
          Add Automation
        </button>
      </div>

      {/* Automations by Category */}
      {automations.length === 0 ? (
        <div className="card p-12 text-center">
          <div className="text-6xl mb-4">⚙️</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">No Automations Yet</h2>
          <p className="text-gray-600 mb-6">
            Start tracking your automated systems to reduce mental overhead and maintain control.
          </p>
          <button
            onClick={() => setShowAddModal(true)}
            className="px-8 py-4 gradient-control text-white rounded-xl font-medium hover:scale-105 transition-transform"
          >
            Add Your First Automation
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {groupedAutomations.map(category => (
            category.items.length > 0 && (
              <div key={category.value} className="space-y-3">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{category.icon}</span>
                  <h3 className="text-xl font-bold text-gray-900">{category.label}</h3>
                  <span className="text-sm text-gray-500">({category.items.length})</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {category.items.map(automation => (
                    <div key={automation.id} className="card p-6">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <h4 className="font-bold text-gray-900 mb-1">{automation.title}</h4>
                          {automation.description && (
                            <p className="text-sm text-gray-600">{automation.description}</p>
                          )}
                        </div>
                        <button
                          onClick={() => handleDelete(automation.id)}
                          className="w-8 h-8 rounded-full hover:bg-red-100 flex items-center justify-center transition-colors text-red-600 flex-shrink-0 ml-2"
                        >
                          ✕
                        </button>
                      </div>

                      <div className="flex items-center justify-between">
                        <button
                          onClick={() => toggleStatus(automation.id)}
                          className={`px-3 py-1 rounded-full text-xs font-medium ${
                            automation.status === 'active'
                              ? 'bg-green-100 text-green-700'
                              : 'bg-gray-100 text-gray-700'
                          }`}
                        >
                          {automation.status === 'active' ? 'Active' : 'Inactive'}
                        </button>
                        <span className="text-xs text-gray-500">
                          {new Date(automation.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )
          ))}
        </div>
      )}

      {/* Add Automation Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-8 max-w-2xl w-full">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-3xl font-bold text-gray-900">Add Automation</h2>
              <button
                onClick={() => setShowAddModal(false)}
                className="w-10 h-10 rounded-full hover:bg-gray-100 flex items-center justify-center transition-colors"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Automation Title
                </label>
                <input
                  type="text"
                  value={newAutomation.title}
                  onChange={(e) => setNewAutomation({ ...newAutomation, title: e.target.value })}
                  placeholder="e.g., Auto-pay rent, Weekly backup script"
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-control-primary outline-none text-gray-900"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description (Optional)
                </label>
                <textarea
                  value={newAutomation.description}
                  onChange={(e) => setNewAutomation({ ...newAutomation, description: e.target.value })}
                  placeholder="How does this automation work?"
                  rows={3}
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-control-primary outline-none resize-none text-gray-900"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category
                </label>
                <select
                  value={newAutomation.category}
                  onChange={(e) => setNewAutomation({ ...newAutomation, category: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-control-primary outline-none text-gray-900"
                >
                  {automationCategories.map(cat => (
                    <option key={cat.value} value={cat.value}>
                      {cat.icon} {cat.label}
                    </option>
                  ))}
                </select>
              </div>

              <button
                onClick={handleAdd}
                disabled={!newAutomation.title.trim()}
                className="w-full py-4 gradient-control text-white rounded-xl font-medium text-lg hover:scale-105 transition-transform disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
              >
                Add Automation
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Note */}
      <div className="card p-4 bg-blue-50 border border-blue-200">
        <p className="text-sm text-blue-900">
          💡 <strong>Note:</strong> Automations are currently stored in your browser.
          They won't sync across devices.
        </p>
      </div>
    </div>
  )
}
