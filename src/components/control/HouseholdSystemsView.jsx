import { useState, useEffect } from 'react'

// Default categories for household organization
const defaultCategories = [
  { name: 'Cleaning', icon: '🧹', items: [] },
  { name: 'Maintenance', icon: '🔧', items: [] },
  { name: 'Finances', icon: '💰', items: [] },
  { name: 'Shopping', icon: '🛒', items: [] },
  { name: 'Meal Planning', icon: '🍽️', items: [] },
]

export default function HouseholdSystemsView() {
  const [categories, setCategories] = useState([])
  const [expandedCategory, setExpandedCategory] = useState(null)
  const [newItem, setNewItem] = useState('')

  useEffect(() => {
    // Load from localStorage
    const saved = localStorage.getItem('household_systems')
    if (saved) {
      setCategories(JSON.parse(saved))
    } else {
      setCategories(defaultCategories)
    }
  }, [])

  const saveToStorage = (updatedCategories) => {
    localStorage.setItem('household_systems', JSON.stringify(updatedCategories))
    setCategories(updatedCategories)
  }

  const addItem = (categoryIndex) => {
    if (!newItem.trim()) return

    const updated = [...categories]
    updated[categoryIndex].items.push({
      text: newItem,
      completed: false,
      id: Date.now()
    })
    saveToStorage(updated)
    setNewItem('')
  }

  const toggleItem = (categoryIndex, itemId) => {
    const updated = [...categories]
    const item = updated[categoryIndex].items.find(i => i.id === itemId)
    if (item) {
      item.completed = !item.completed
      saveToStorage(updated)
    }
  }

  const removeItem = (categoryIndex, itemId) => {
    const updated = [...categories]
    updated[categoryIndex].items = updated[categoryIndex].items.filter(i => i.id !== itemId)
    saveToStorage(updated)
  }

  const addCategory = () => {
    const categoryName = prompt('Enter category name:')
    if (!categoryName) return

    const icon = prompt('Enter emoji icon (optional):') || '📋'

    const updated = [...categories, {
      name: categoryName,
      icon: icon,
      items: []
    }]
    saveToStorage(updated)
  }

  return (
    <div className="space-y-6">
      {/* Info Card */}
      <div className="card p-6 bg-gradient-to-br from-control-primary/10 to-control-accent/10 border border-control-primary/20">
        <h3 className="text-xl font-bold text-gray-900 mb-2">Household Systems</h3>
        <p className="text-gray-600">
          Organize your household tasks and recurring systems. Create categories and track items
          that need attention.
        </p>
      </div>

      {/* Add Category Button */}
      <div>
        <button
          onClick={addCategory}
          className="px-6 py-3 gradient-control text-white rounded-xl font-medium hover:scale-105 transition-transform inline-flex items-center gap-2"
        >
          <span className="text-xl">+</span>
          Add Category
        </button>
      </div>

      {/* Categories */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {categories.map((category, categoryIndex) => (
          <div key={categoryIndex} className="card p-6">
            {/* Category Header */}
            <div
              className="flex items-center justify-between cursor-pointer"
              onClick={() => setExpandedCategory(
                expandedCategory === categoryIndex ? null : categoryIndex
              )}
            >
              <div className="flex items-center gap-3">
                <span className="text-3xl">{category.icon}</span>
                <div>
                  <h4 className="font-bold text-gray-900">{category.name}</h4>
                  <p className="text-sm text-gray-500">
                    {category.items.filter(i => !i.completed).length} pending
                  </p>
                </div>
              </div>
              <span className="text-gray-400">
                {expandedCategory === categoryIndex ? '▼' : '▶'}
              </span>
            </div>

            {/* Category Items */}
            {expandedCategory === categoryIndex && (
              <div className="mt-4 space-y-2">
                {/* Items List */}
                {category.items.map(item => (
                  <div
                    key={item.id}
                    className="flex items-center gap-3 p-2 bg-gray-50 rounded-lg"
                  >
                    <input
                      type="checkbox"
                      checked={item.completed}
                      onChange={() => toggleItem(categoryIndex, item.id)}
                      className="w-5 h-5 rounded border-gray-300 text-control-primary focus:ring-control-primary"
                    />
                    <span className={`flex-1 ${item.completed ? 'line-through text-gray-400' : 'text-gray-900'}`}>
                      {item.text}
                    </span>
                    <button
                      onClick={() => removeItem(categoryIndex, item.id)}
                      className="text-red-600 hover:text-red-700 text-sm"
                    >
                      ✕
                    </button>
                  </div>
                ))}

                {/* Add Item */}
                <div className="flex gap-2 mt-3">
                  <input
                    type="text"
                    value={newItem}
                    onChange={(e) => setNewItem(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && addItem(categoryIndex)}
                    placeholder="Add item..."
                    className="flex-1 px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-control-primary outline-none text-gray-900"
                  />
                  <button
                    onClick={() => addItem(categoryIndex)}
                    className="px-4 py-2 bg-control-primary text-white rounded-lg hover:bg-control-accent transition-colors"
                  >
                    Add
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Note */}
      <div className="card p-4 bg-blue-50 border border-blue-200">
        <p className="text-sm text-blue-900">
          💡 <strong>Note:</strong> Household systems are currently stored in your browser.
          They won't sync across devices.
        </p>
      </div>
    </div>
  )
}
