import { useState, useEffect } from 'react'
import { dashboardAPI } from '../api/services'
import {
  BadgeDollarSign, Users, CheckCircle, Clock,
  TrendingUp, ArrowUpRight, ShoppingCart, DollarSign
} from 'lucide-react'

const STATUS_COLORS = {
  PENDING:   { bg: 'bg-orange-100', text: 'text-orange-700', hex: '#f97316' },
  COMPLETED: { bg: 'bg-emerald-100', text: 'text-emerald-700', hex: '#10b981' },
  CANCELLED: { bg: 'bg-red-100', text: 'text-red-700', hex: '#ef4444' },
}

function StatusBadge({ status }) {
  const c = STATUS_COLORS[status] || { bg: 'bg-gray-100', text: 'text-gray-600' }
  return <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${c.bg} ${c.text}`}>{status}</span>
}

function BarChart({ data }) {
  if (!data || data.length === 0) return <div className="h-32 flex items-center justify-center text-gray-300 text-sm">No data</div>
  const max = Math.max(...data.map(d => Number(d.amount)), 1)
  const H = 100
  return (
    <div className="flex items-end gap-1.5 px-1" style={{ height: H + 36 }}>
      {data.map((d, i) => {
        const barH = Math.max((Number(d.amount) / max) * H, Number(d.amount) > 0 ? 4 : 2)
        return (
          <div key={i} className="flex flex-col items-center flex-1 group">
            <div className="opacity-0 group-hover:opacity-100 transition-opacity bg-gray-800 text-white text-xs rounded px-1.5 py-0.5 mb-1 whitespace-nowrap pointer-events-none">
              ${Number(d.amount).toLocaleString()}
            </div>
            <div className="w-full rounded-t-md transition-all duration-500"
              style={{ height: barH, background: Number(d.amount) > 0 ? 'linear-gradient(to top,#16a34a,#4ade80)' : '#e5e7eb' }} />
            <p className="text-xs text-gray-400 mt-1.5 truncate w-full text-center">{d.month.split(' ')[0]}</p>
          </div>
        )
      })}
    </div>
  )
}

function DonutChart({ data, size = 140 }) {
  const entries = Object.entries(data || {})
  const total = entries.reduce((s, [, v]) => s + v, 0)
  if (total === 0) return <div className="h-36 flex items-center justify-center text-gray-300 text-sm">No data</div>
  const COLORS = ['#f97316', '#10b981', '#ef4444', '#3b82f6']
  const r = 48, cx = size / 2, cy = size / 2, circ = 2 * Math.PI * r
  let offset = 0
  const slices = entries.map(([label, value], i) => {
    const dash = (value / total) * circ
    const s = { label, value, dash, offset, color: COLORS[i % COLORS.length] }
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
          <p className="text-xs text-gray-400">Orders</p>
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

export default function SalesDashboard() {
  const [stats, setStats] = useState(null)

  useEffect(() => {
    dashboardAPI.getSales().then(({ data }) => setStats(data)).catch(() => {})
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
        <h1 className="text-2xl font-bold text-gray-900">Sales Dashboard</h1>
        <p className="text-gray-500 text-sm mt-0.5">Your sales performance overview</p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Orders', value: stats.totalOrders, Icon: ShoppingCart, gradient: 'from-green-600 to-green-400', sub: `${stats.pendingOrders} pending` },
          { label: 'Total Revenue', value: `$${Number(stats.totalRevenue).toLocaleString()}`, Icon: DollarSign, gradient: 'from-emerald-600 to-teal-400', sub: 'Collected payments' },
          { label: 'Completed', value: stats.completedOrders, Icon: CheckCircle, gradient: 'from-blue-600 to-blue-400', sub: 'Closed deals' },
          { label: 'Customers', value: stats.totalCustomers, Icon: Users, gradient: 'from-violet-600 to-violet-400', sub: 'Unique buyers' },
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

      {/* Pending revenue banner */}
      {Number(stats.pendingRevenue) > 0 && (
        <div className="bg-orange-50 border border-orange-200 rounded-2xl px-5 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Clock size={20} className="text-orange-500" />
            <div>
              <p className="text-sm font-semibold text-orange-800">Pending Revenue</p>
              <p className="text-xs text-orange-600">Orders awaiting completion</p>
            </div>
          </div>
          <p className="text-xl font-bold text-orange-700">${Number(stats.pendingRevenue).toLocaleString()}</p>
        </div>
      )}

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-200 p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="font-semibold text-gray-800">Monthly Revenue</p>
              <p className="text-xs text-gray-400">Last 6 months</p>
            </div>
            <span className="text-xs bg-green-50 text-green-700 font-medium px-2.5 py-1 rounded-full border border-green-100">
              ${Number(stats.totalRevenue).toLocaleString()} total
            </span>
          </div>
          <BarChart data={stats.monthlyRevenue} />
        </div>
        <div className="bg-white rounded-2xl border border-gray-200 p-5">
          <p className="font-semibold text-gray-800 mb-1">Orders by Status</p>
          <p className="text-xs text-gray-400 mb-4">Breakdown</p>
          <DonutChart data={stats.ordersByStatus} />
        </div>
      </div>

      {/* Bottom row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Recent orders */}
        <div className="bg-white rounded-2xl border border-gray-200 p-5">
          <p className="font-semibold text-gray-800 mb-4">Recent Orders</p>
          <div className="space-y-2">
            {(stats.recentOrders || []).map(o => (
              <div key={o.id} className="flex items-center justify-between py-2.5 border-b border-gray-50 last:border-0">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-green-50 flex items-center justify-center">
                    <BadgeDollarSign size={15} className="text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-800">{o.vehicle}</p>
                    <p className="text-xs text-gray-400">{o.customerName}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <p className="text-sm font-semibold">${Number(o.amount).toLocaleString()}</p>
                  <StatusBadge status={o.status} />
                </div>
              </div>
            ))}
            {(stats.recentOrders || []).length === 0 && <p className="text-sm text-gray-400 text-center py-4">No orders yet</p>}
          </div>
        </div>

        {/* Top customers */}
        <div className="bg-white rounded-2xl border border-gray-200 p-5">
          <p className="font-semibold text-gray-800 mb-4">Top Customers</p>
          <div className="space-y-3">
            {(stats.topCustomers || []).map((c, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-violet-100 flex items-center justify-center text-violet-700 text-xs font-bold flex-shrink-0">
                  {(c.name || '?')[0].toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-800 truncate">{c.name}</p>
                  <p className="text-xs text-gray-400 truncate">{c.email}</p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-sm font-semibold text-gray-800">${Number(c.totalSpent).toLocaleString()}</p>
                  <p className="text-xs text-gray-400">{c.orderCount} order{c.orderCount !== 1 ? 's' : ''}</p>
                </div>
              </div>
            ))}
            {(stats.topCustomers || []).length === 0 && <p className="text-sm text-gray-400 text-center py-4">No customers yet</p>}
          </div>
        </div>
      </div>
    </div>
  )
}
