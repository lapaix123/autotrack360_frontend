import { useState, useEffect } from 'react'
import { dashboardAPI } from '../api/services'
import SalesDashboard from './SalesDashboard'
import LogisticsDashboard from './LogisticsDashboard'
import {
  Car, BadgeDollarSign, Ship, Warehouse, TrendingUp,
  CheckCircle, Clock, Package, ArrowUpRight, Truck
} from 'lucide-react'

// ── Colour palette for status badges & charts ──────────────
const STATUS_COLORS = {
  AVAILABLE:  { bg: 'bg-emerald-100', text: 'text-emerald-700', hex: '#10b981' },
  IMPORTED:   { bg: 'bg-blue-100',    text: 'text-blue-700',    hex: '#3b82f6' },
  IN_TRANSIT: { bg: 'bg-amber-100',   text: 'text-amber-700',   hex: '#f59e0b' },
  ARRIVED:    { bg: 'bg-purple-100',  text: 'text-purple-700',  hex: '#8b5cf6' },
  SOLD:       { bg: 'bg-gray-100',    text: 'text-gray-600',    hex: '#6b7280' },
  SHIPPED:    { bg: 'bg-amber-100',   text: 'text-amber-700',   hex: '#f59e0b' },
  CREATED:    { bg: 'bg-blue-100',    text: 'text-blue-700',    hex: '#3b82f6' },
  PENDING:    { bg: 'bg-orange-100',  text: 'text-orange-700',  hex: '#f97316' },
  COMPLETED:  { bg: 'bg-emerald-100', text: 'text-emerald-700', hex: '#10b981' },
}

function StatusBadge({ status }) {
  const c = STATUS_COLORS[status] || { bg: 'bg-gray-100', text: 'text-gray-600' }
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${c.bg} ${c.text}`}>
      {status}
    </span>
  )
}

// ── Donut chart (pure SVG) ─────────────────────────────────
function DonutChart({ data, size = 160 }) {
  const entries = Object.entries(data || {})
  const total = entries.reduce((s, [, v]) => s + v, 0)
  if (total === 0) return <div className="flex items-center justify-center h-40 text-gray-300 text-sm">No data</div>

  const r = 54, cx = size / 2, cy = size / 2
  const circumference = 2 * Math.PI * r
  let offset = 0
  const slices = entries.map(([label, value], i) => {
    const pct = value / total
    const dash = pct * circumference
    const slice = { label, value, dash, offset, color: Object.values(STATUS_COLORS)[i % Object.keys(STATUS_COLORS).length].hex }
    offset += dash
    return slice
  })

  return (
    <div className="flex items-center gap-6">
      <div className="relative flex-shrink-0" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90">
          <circle cx={cx} cy={cy} r={r} fill="none" stroke="#f3f4f6" strokeWidth="20" />
          {slices.map((s) => (
            <circle key={s.label} cx={cx} cy={cy} r={r} fill="none"
              stroke={s.color} strokeWidth="20"
              strokeDasharray={`${s.dash} ${circumference - s.dash}`}
              strokeDashoffset={-s.offset}
              className="transition-all duration-500"
            />
          ))}
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <p className="text-2xl font-bold text-gray-800">{total}</p>
          <p className="text-xs text-gray-400">Total</p>
        </div>
      </div>
      <div className="space-y-2 flex-1">
        {slices.map((s) => (
          <div key={s.label} className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: s.color }} />
              <span className="text-xs text-gray-600">{s.label}</span>
            </div>
            <span className="text-xs font-semibold text-gray-800">{s.value}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

// ── Bar chart (pure SVG) ───────────────────────────────────
function BarChart({ data }) {
  if (!data || data.length === 0) return <div className="flex items-center justify-center h-40 text-gray-300 text-sm">No data</div>
  const max = Math.max(...data.map(d => Number(d.amount)), 1)
  const H = 120, W = 100

  return (
    <div className="w-full overflow-x-auto">
      <div className="flex items-end gap-2 min-w-0 px-1" style={{ height: H + 40 }}>
        {data.map((d, i) => {
          const pct = Number(d.amount) / max
          const barH = Math.max(pct * H, Number(d.amount) > 0 ? 4 : 2)
          return (
            <div key={i} className="flex flex-col items-center flex-1 min-w-0 group">
              {/* Tooltip */}
              <div className="opacity-0 group-hover:opacity-100 transition-opacity bg-gray-800 text-white text-xs rounded px-2 py-1 mb-1 whitespace-nowrap pointer-events-none">
                ${Number(d.amount).toLocaleString()}
              </div>
              <div
                className="w-full rounded-t-md transition-all duration-500"
                style={{
                  height: barH,
                  background: Number(d.amount) > 0
                    ? 'linear-gradient(to top, #2563eb, #60a5fa)'
                    : '#e5e7eb'
                }}
              />
              <p className="text-xs text-gray-400 mt-1.5 truncate w-full text-center">{d.month.split(' ')[0]}</p>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ── Stat card ──────────────────────────────────────────────
function StatCard({ label, value, sub, Icon, gradient, trend }) {
  return (
    <div className={`relative overflow-hidden rounded-2xl p-5 text-white ${gradient}`}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium opacity-80">{label}</p>
          <p className="text-3xl font-bold mt-1">{value ?? '—'}</p>
          {sub && <p className="text-xs opacity-70 mt-1">{sub}</p>}
        </div>
        <div className="w-11 h-11 rounded-xl bg-white/20 flex items-center justify-center flex-shrink-0">
          <Icon size={22} className="text-white" />
        </div>
      </div>
      {trend != null && (
        <div className="flex items-center gap-1 mt-3">
          <ArrowUpRight size={13} className="opacity-80" />
          <span className="text-xs opacity-80">{trend}</span>
        </div>
      )}
      {/* decorative circle */}
      <div className="absolute -bottom-4 -right-4 w-24 h-24 rounded-full bg-white/10" />
    </div>
  )
}

// ── Main Dashboard ─────────────────────────────────────────
function AdminDashboard() {
  const [stats, setStats] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    dashboardAPI.get()
      .then(({ data }) => setStats(data))
      .catch(() => setError('Failed to load dashboard'))
  }, [])

  if (error) return (
    <div className="flex items-center justify-center h-64">
      <p className="text-red-500">{error}</p>
    </div>
  )

  if (!stats) return (
    <div className="space-y-6 animate-pulse">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(8)].map((_, i) => <div key={i} className="h-28 bg-gray-200 rounded-2xl" />)}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {[...Array(3)].map((_, i) => <div key={i} className="h-64 bg-gray-200 rounded-2xl" />)}
      </div>
    </div>
  )

  const totalRevenueFormatted = stats.totalRevenue != null
    ? `$${Number(stats.totalRevenue).toLocaleString()}`
    : '$0'

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-500 text-sm mt-0.5">Live overview of AutoTrack360 operations</p>
      </div>

      {/* Stat Cards — row 1 */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Total Vehicles"
          value={stats.totalVehicles}
          sub={`${stats.vehiclesByStatus?.IN_TRANSIT ?? 0} in transit`}
          Icon={Car}
          gradient="bg-gradient-to-br from-blue-600 to-blue-400"
          trend="Fleet inventory"
        />
        <StatCard
          label="Total Revenue"
          value={totalRevenueFormatted}
          sub="From all payments"
          Icon={TrendingUp}
          gradient="bg-gradient-to-br from-emerald-600 to-emerald-400"
          trend="Collected payments"
        />
        <StatCard
          label="Sales Orders"
          value={stats.totalSales}
          sub={`${stats.pendingSales} pending`}
          Icon={BadgeDollarSign}
          gradient="bg-gradient-to-br from-violet-600 to-violet-400"
          trend={`${stats.completedSales} completed`}
        />
        <StatCard
          label="Shipments"
          value={stats.totalShipments}
          sub={`${stats.activeShipments} active`}
          Icon={Ship}
          gradient="bg-gradient-to-br from-amber-500 to-orange-400"
          trend="Logistics pipeline"
        />
      </div>

      {/* Stat Cards — row 2 */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl border border-gray-200 p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center">
            <CheckCircle size={22} className="text-emerald-600" />
          </div>
          <div>
            <p className="text-xs text-gray-500">Completed Sales</p>
            <p className="text-2xl font-bold text-gray-800">{stats.completedSales}</p>
          </div>
        </div>
        <div className="bg-white rounded-2xl border border-gray-200 p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-orange-50 flex items-center justify-center">
            <Clock size={22} className="text-orange-500" />
          </div>
          <div>
            <p className="text-xs text-gray-500">Pending Sales</p>
            <p className="text-2xl font-bold text-gray-800">{stats.pendingSales}</p>
          </div>
        </div>
        <div className="bg-white rounded-2xl border border-gray-200 p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center">
            <Warehouse size={22} className="text-blue-600" />
          </div>
          <div>
            <p className="text-xs text-gray-500">Available Inventory</p>
            <p className="text-2xl font-bold text-gray-800">{stats.availableInventory}</p>
          </div>
        </div>
        <div className="bg-white rounded-2xl border border-gray-200 p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-50 flex items-center justify-center">
            <Truck size={22} className="text-amber-500" />
          </div>
          <div>
            <p className="text-xs text-gray-500">Active Shipments</p>
            <p className="text-2xl font-bold text-gray-800">{stats.activeShipments}</p>
          </div>
        </div>
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Revenue bar chart */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-200 p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="font-semibold text-gray-800">Monthly Revenue</p>
              <p className="text-xs text-gray-400">Last 6 months · collected payments</p>
            </div>
            <span className="text-xs bg-blue-50 text-blue-600 font-medium px-2.5 py-1 rounded-full border border-blue-100">
              {totalRevenueFormatted} total
            </span>
          </div>
          <BarChart data={stats.monthlyRevenue} />
        </div>

        {/* Vehicle donut */}
        <div className="bg-white rounded-2xl border border-gray-200 p-5">
          <div className="mb-4">
            <p className="font-semibold text-gray-800">Vehicles by Status</p>
            <p className="text-xs text-gray-400">Current fleet breakdown</p>
          </div>
          <DonutChart data={stats.vehiclesByStatus} />
        </div>
      </div>

      {/* Second charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Shipments donut */}
        <div className="bg-white rounded-2xl border border-gray-200 p-5">
          <div className="mb-4">
            <p className="font-semibold text-gray-800">Shipments by Status</p>
            <p className="text-xs text-gray-400">Logistics pipeline</p>
          </div>
          <DonutChart data={stats.shipmentsByStatus} />
        </div>

        {/* Recent Sales */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-200 p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="font-semibold text-gray-800">Recent Sales</p>
              <p className="text-xs text-gray-400">Latest 5 orders</p>
            </div>
            <BadgeDollarSign size={18} className="text-gray-300" />
          </div>
          <div className="space-y-2">
            {(stats.recentSales || []).length === 0 && (
              <p className="text-sm text-gray-400 text-center py-6">No sales yet</p>
            )}
            {(stats.recentSales || []).map((s) => (
              <div key={s.id} className="flex items-center justify-between py-2.5 border-b border-gray-50 last:border-0">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-violet-50 flex items-center justify-center flex-shrink-0">
                    <Car size={15} className="text-violet-500" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-800">{s.vehicle}</p>
                    <p className="text-xs text-gray-400">{s.customerName}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <p className="text-sm font-semibold text-gray-800">${Number(s.amount).toLocaleString()}</p>
                  <StatusBadge status={s.status} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Shipments */}
      <div className="bg-white rounded-2xl border border-gray-200 p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="font-semibold text-gray-800">Recent Shipments</p>
            <p className="text-xs text-gray-400">Latest logistics activity</p>
          </div>
          <Ship size={18} className="text-gray-300" />
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-xs text-gray-400 uppercase border-b border-gray-100">
                <th className="pb-3 text-left font-medium">Shipment</th>
                <th className="pb-3 text-left font-medium">Tracking</th>
                <th className="pb-3 text-left font-medium">Route</th>
                <th className="pb-3 text-left font-medium">Vehicles</th>
                <th className="pb-3 text-left font-medium">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {(stats.recentShipments || []).length === 0 && (
                <tr><td colSpan={5} className="py-6 text-center text-gray-400">No shipments yet</td></tr>
              )}
              {(stats.recentShipments || []).map((s) => (
                <tr key={s.id} className="hover:bg-gray-50 transition-colors">
                  <td className="py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-amber-50 flex items-center justify-center">
                        <Package size={13} className="text-amber-500" />
                      </div>
                      <span className="font-medium text-gray-800">{s.name}</span>
                    </div>
                  </td>
                  <td className="py-3">
                    {s.trackingNumber
                      ? <span className="font-mono text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded border border-blue-100">{s.trackingNumber}</span>
                      : <span className="text-gray-300 text-xs">—</span>}
                  </td>
                  <td className="py-3 text-gray-500 text-xs">
                    {s.origin} <span className="text-gray-300 mx-1">→</span> {s.destination}
                  </td>
                  <td className="py-3">
                    <span className="flex items-center gap-1 text-gray-600">
                      <Car size={13} className="text-gray-400" /> {s.vehicleCount}
                    </span>
                  </td>
                  <td className="py-3"><StatusBadge status={s.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

export default function Dashboard() {
  const role = localStorage.getItem('role') || 'ADMIN'
  if (role === 'SALES') return <SalesDashboard />
  if (role === 'LOGISTICS') return <LogisticsDashboard />
  return <AdminDashboard />
}
