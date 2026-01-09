export default function ValueCard({ value, onDelete, onEdit }) {
  const handleDelete = (e) => {
    e.stopPropagation() // Prevent triggering card click
    if (confirm('Are you sure you want to delete this core value? This action cannot be undone.')) {
      onDelete(value.id)
    }
  }

  return (
    <div
      className="card p-6 hover:shadow-md transition-shadow cursor-pointer"
      onClick={onEdit}
    >
      {/* Header with delete button */}
      <div className="flex items-start justify-between mb-4">
        <h3 className="text-xl font-bold text-gray-900">{value.name}</h3>

        <button
          onClick={handleDelete}
          className="w-8 h-8 rounded-full hover:bg-red-100 flex items-center justify-center transition-colors text-red-600"
          title="Delete value"
        >
          ✕
        </button>
      </div>

      {/* Description */}
      {value.description && (
        <p className="text-gray-600 text-sm leading-relaxed mt-3">
          {value.description}
        </p>
      )}
    </div>
  )
}
