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

export default function AspectCard({ aspect, onClick, onDelete, onEdit }) {
  const category = categoryInfo[aspect.category] || { icon: '⭐', color: 'bg-gray-500' }
  const status = statusInfo[aspect.status] || statusInfo.planning

  const handleDelete = (e) => {
    e.stopPropagation()
    if (confirm('Are you sure you want to delete this aspect and all its milestones? This action cannot be undone.')) {
      onDelete(aspect.id)
    }
  }

  const handleEdit = (e) => {
    e.stopPropagation()
    onEdit(aspect)
  }

  return (
    <div
      onClick={onClick}
      className="card p-6 hover:shadow-lg transition-all cursor-pointer relative group"
    >
      {/* Action Buttons */}
      <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          onClick={handleEdit}
          className="w-8 h-8 rounded-full hover:bg-blue-100 flex items-center justify-center transition-colors text-blue-600"
          title="Edit aspect"
        >
          ✎
        </button>
        <button
          onClick={handleDelete}
          className="w-8 h-8 rounded-full hover:bg-red-100 flex items-center justify-center transition-colors text-red-600"
          title="Delete aspect"
        >
          ✕
        </button>
      </div>

      {/* Category Icon */}
      <div className="flex items-center justify-between mb-4">
        <div
          className={`w-14 h-14 rounded-xl ${category.color} text-white flex items-center justify-center text-3xl`}
        >
          {category.icon}
        </div>

        {/* Scale Badge */}
        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
          aspect.scale === 'large'
            ? 'bg-vision-primary text-white'
            : 'bg-gray-200 text-gray-700'
        }`}>
          {aspect.scale === 'large' ? 'Large' : 'Small'} Overhaul
        </span>
      </div>

      {/* Title */}
      <h3 className="text-xl font-bold text-gray-900 mb-3">{aspect.title}</h3>

      {/* Description */}
      {aspect.description && (
        <p className="text-gray-600 text-sm mb-4 line-clamp-3">
          {aspect.description}
        </p>
      )}

      {/* Status */}
      <div className="flex items-center justify-between">
        <span className={`px-3 py-1 rounded-full text-xs font-medium ${status.color}`}>
          {status.label}
        </span>

        {/* Click hint */}
        <span className="text-xs text-gray-400 group-hover:text-gray-600 transition-colors">
          View milestones →
        </span>
      </div>
    </div>
  )
}
