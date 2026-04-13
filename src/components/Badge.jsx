const colors = {
  IMPORTED: 'bg-gray-100 text-gray-700',
  IN_TRANSIT: 'bg-blue-100 text-blue-700',
  ARRIVED: 'bg-yellow-100 text-yellow-700',
  AVAILABLE: 'bg-green-100 text-green-700',
  SOLD: 'bg-red-100 text-red-700',
  CREATED: 'bg-gray-100 text-gray-700',
  SHIPPED: 'bg-blue-100 text-blue-700',
  RESERVED: 'bg-purple-100 text-purple-700',
  PENDING: 'bg-yellow-100 text-yellow-700',
  COMPLETED: 'bg-green-100 text-green-700',
}

export default function Badge({ status }) {
  return (
    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${colors[status] || 'bg-gray-100 text-gray-600'}`}>
      {status}
    </span>
  )
}
