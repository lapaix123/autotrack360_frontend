import { useState, useEffect } from 'react'
import { dashboardAPI } from '../api/services'

function StatCard({ label, value, icon, color }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 flex items-center gap-4">
      <div className={`w-12 h-12 rounded-lg flex items-center justify-center text-2xl ${color}`}>{icon}</div>
      <div>
        <p className="text-sm text-gray-500">{label}</p>
        <p className="text-3xl font-bold text-gray-800">{value ?? '—'}</p>
      </div>
    </div>
  )
}

export default function Dashboard() {
  const [stats, setStats] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    dashboardAPI.get()
      .then(({ data }) => setStats(data))
      .catch(() => setError('Failed to load dashboard data'))
  }, [])

  if (error) return <p className="text-red-500">{error}</p>

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>
        <p className="text-gray-500 text-sm mt-1">System overview</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <StatCard label="Total Vehicles" value={stats?.totalVehicles} icon="🚗" color="bg-blue-50" />
        <StatCard label="Available Inventory" value={stats?.availableInventory} icon="🏭" color="bg-green-50" />
        <StatCard label="Total Sales" value={stats?.totalSales} icon="💰" color="bg-yellow-50" />
        <StatCard label="Completed Sales" value={stats?.completedSales} icon="✅" color="bg-emerald-50" />
        <StatCard label="Pending Sales" value={stats?.pendingSales} icon="⏳" color="bg-orange-50" />
      </div>
    </div>
  )
}
