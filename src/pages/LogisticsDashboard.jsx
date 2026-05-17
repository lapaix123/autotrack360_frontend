import { useState, useEffect } from 'react'
import { dashboardAPI } from '../api/services'
import {
  Car, Ship, Warehouse, Truck, CheckCircle,
  Package, MapPin, Clock, ArrowRight
} from 'lucide-react'

const STATUS_COLORS = {
  AVAILABLE:  { bg: 'bg-emerald-100', text: 'text-emerald-700', hex: '#10b981' },
  IMPORTED:   { bg: 'bg-blue-100',    text: 'text-blue-700',    hex: '#3b82f6' },
  IN_TRANSIT: { bg: 'bg-amber-100',   text: 'text-amber-700',   hex: '#f59e0b' },
  ARRIVED:    { bg: 'bg-purple-100',  text: 'text-purple-700',  hex: '#8b5cf6' },
  SOLD:       { bg: 'bg-gray-100',    text: 'text-gray-500',    hex: '#6b7280' },
  SHIPPED:    { bg: 'bg-amber-100',   text: 'text-amber-700',   hex: '#f59e0b' },
  CREATED:    { bg: 'bg-blue-100',    text: 'text-blue-700',    hex: '#3b82f6' },
}

function StatusBadge({ status }) {
  const c = STATUS_COLORS[status] || { bg: 'bg-gray-100', text: 'text-gray-600' }
  return <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${c.bg} ${c.text}`}>{status}</span>
}

function DonutChart({ data, size = 140 }) {
  const entries = Object.entries(data || {})
  const total = entries.reduce((s, [, v]) => s + v, 0)
  if (total === 0) return <div className="h-36 flex items-center justify-center text-gray-300 text-sm">No data</div>
  const r = 48, cx = size / 2, cy = size / 2, circ = 2 * Math.PI * r
  let offset = 0
  const slices = entries.map(([label, value], i) => {
    const COLORS = ['#3b82f6', '#f59e0b', '#10b981', '#8b5cf6', '#6b7280']
    const dash = (value / total) * circ
    const s = { label, value, dash, offset, color: STATUS_COLORS[label]?.hex || COLORS[i % COLORS.length] }
    offset += dash
    return s
  })
  return (
    <div className="flex items-center gap-4">
      <div className="relative flex-shrink-0" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90">
          <circle cx={cx} cy={cy} r={r} fill="none" stroke="#f3f4f6" strokeWidth="18" />
          {slices.map(s => (
            <circle key={s.label} cx={cx} cy={cy} r={r} fill="none"
              stroke={s.color} strokeWidth="18"
              strokeDasharray={`${s.dash} ${circ - s.dash}`}
              strokeDashoffset={-s.offset} />
          ))}
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <p className="text-xl font-bold text-gray-800">{total}</p>
          <p className="text-xs text-gray-400">Total</p>
        </div>
      </div>
      <div className="space-y-1.5 flex-1">
        {slices.map(s => (
          <div key={s.label} className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full" style={{ background: s.color }} />
              <span className="text-xs text-gray-600">{s.label}</span>
            </div>
            <span className="text-xs font-semibold text-gray-800">{s.value}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

export default function LogisticsDashboard() {
  const [stats, setStats] = useState(null)

  useEffect(() => {
    dashboardAPI.getLogistics().then(({ data }) => setStats(data)).catch(() => {})
  }, [])

  if (!stats) return (
    <div className="space-y-6 animate-pulse">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">{[...Array(4)].map((_, i) => <div key={i} className="h-28 bg-gray-200 rounded-2xl" />)}</div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">{[...Array(3)].map((_, i) => <div key={i} className="h-56 bg-gray-200 rounded-2xl" />)}</div>
    </div>
  )

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Logistics Dashboard</h1>
        <p className="text-gray-500 text-sm mt-0.5">Fleet and shipment operations overview</p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Vehicles', value: stats.totalVehicles, Icon: Car, gradient: 'from-blue-600 to-blue-400', sub: `${stats.vehiclesInTransit} in transit` },
          { label: 'Active Shipments', value: stats.activeShipments, Icon: Truck, gradient: 'from-amber-500 to-orange-400', sub: 'Currently shipped' },
          { label: 'Arrived', value: stats.vehiclesArrived, Icon: CheckCircle, gradient: 'from-emerald-600 to-emerald-400', sub: 'Vehicles at port' },
          { label: 'Inventory', value: stats.totalInventory, Icon: Warehouse, gradient: 'from-violet-600 to-violet-400', sub: `${stats.vehiclesAvailable} available` },
        ].map(({ label, value, Icon, gradient, sub }) => (
          <div key={label} className={`relative overflow-hidden rounded-2xl p-5 text-white bg-gradient-to-br ${gradient}`}>
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium opacity-80">{label}</p>
                <p className="text-3xl font-bold mt-1">{value}</p>
                <p className="text-xs opacity-70 mt-1">{sub}</p>
              </div>
              <div className="w-11 h-11 rounded-xl bg-white/20 flex items-center justify-center">
                <Icon size={22} className="text-white" />
              </div>
            </div>
            <div className="absolute -bottom-4 -right-4 w-24 h-24 rounded-full bg-white/10" />
          </div>
        ))}
      </div>

      {/* Secondary stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Shipments', value: stats.totalShipments, Icon: Ship, color: 'blue' },
          { label: 'In Transit', value: stats.vehiclesInTransit, Icon: Truck, color: 'amber' },
          { label: 'Available', value: stats.vehiclesAvailable, Icon: CheckCircle, color: 'emerald' },
          { label: 'Arrived Shipments', value: stats.arrivedShipments, Icon: Package, color: 'purple' },
        ].map(({ label, value, Icon, color }) => {
          const cls = { blue: 'bg-blue-50 text-blue-600', amber: 'bg-amber-50 text-amber-600', emerald: 'bg-emerald-50 text-emerald-600', purple: 'bg-purple-50 text-purple-600' }
          return (
            <div key={label} className="bg-white rounded-2xl border border-gray-200 p-4 flex items-center gap-3">
              <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${cls[color]}`}>
                <Icon size={20} />
              </div>
              <div>
                <p className="text-xs text-gray-500">{label}</p>
                <p className="text-2xl font-bold text-gray-800">{value}</p>
              </div>
            </div>
          )
        })}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl border border-gray-200 p-5">
          <p className="font-semibold text-gray-800 mb-1">Vehicles by Status</p>
          <p className="text-xs text-gray-400 mb-4">Fleet breakdown</p>
          <DonutChart data={stats.vehiclesByStatus} />
        </div>
        <div className="bg-white rounded-2xl border border-gray-200 p-5">
          <p className="font-semibold text-gray-800 mb-1">Shipments by Status</p>
          <p className="text-xs text-gray-400 mb-4">Pipeline status</p>
          <DonutChart data={stats.shipmentsByStatus} />
        </div>

        {/* Active shipments list */}
        <div className="bg-white rounded-2xl border border-gray-200 p-5">
          <p className="font-semibold text-gray-800 mb-4">Active Shipments</p>
          <div className="space-y-3 max-h-52 overflow-y-auto">
            {(stats.activeShipmentList || []).length === 0 && (
              <p className="text-sm text-gray-400 text-center py-4">No active shipments</p>
            )}
            {(stats.activeShipmentList || []).map(s => (
              <div key={s.id} className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl">
                <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center flex-shrink-0">
                  <Ship size={15} className="text-amber-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-medium text-gray-800 truncate">{s.name}</p>
                    <StatusBadge status={s.status} />
                  </div>
                  <div className="flex items-center gap-1 text-xs text-gray-400 mt-0.5">
                    <MapPin size={10} />
                    <span className="truncate">{s.origin}</span>
                    <ArrowRight size={10} />
                    <span className="truncate">{s.destination}</span>
                  </div>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="text-xs text-gray-500 flex items-center gap-1"><Car size={10} /> {s.vehicleCount} vehicles</span>
                    {s.estimatedArrival && <span className="text-xs text-gray-400 flex items-center gap-1"><Clock size={10} /> {s.estimatedArrival}</span>}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent vehicles with images */}
      <div className="bg-white rounded-2xl border border-gray-200 p-5">
        <p className="font-semibold text-gray-800 mb-4">Recent Vehicles</p>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {(stats.recentVehicles || []).map(v => (
            <div key={v.id} className="rounded-xl border border-gray-100 overflow-hidden hover:shadow-md transition-shadow">
              <div className="h-24 bg-gray-100 relative">
                {v.imageUrl
                  ? <img src={v.imageUrl} alt={`${v.make} ${v.model}`} className="w-full h-full object-cover" />
                  : <div className="w-full h-full flex items-center justify-center"><Car size={28} className="text-gray-300" /></div>
                }
                <div className="absolute top-1.5 left-1.5">
                  <StatusBadge status={v.status} />
                </div>
              </div>
              <div className="p-2">
                <p className="text-xs font-semibold text-gray-800 truncate">{v.make} {v.model}</p>
                <p className="text-xs text-gray-400">{v.year}</p>
              </div>
            </div>
          ))}
          {(stats.recentVehicles || []).length === 0 && (
            <div className="col-span-full text-center py-8 text-gray-400 text-sm">No vehicles yet</div>
          )}
        </div>
      </div>
    </div>
  )
}
