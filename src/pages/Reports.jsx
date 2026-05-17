import { useState, useEffect } from 'react'
import { reportsAPI } from '../api/services'
import PageHeader from '../components/PageHeader'
import Badge from '../components/Badge'
import { BarChart3, Download, TrendingUp, Car, Ship, RefreshCw } from 'lucide-react'

const tabs = [
  { key: 'sales', label: 'Sales Report', Icon: TrendingUp },
  { key: 'vehicles', label: 'Vehicles Report', Icon: Car },
  { key: 'shipments', label: 'Shipments Report', Icon: Ship },
]

export default function Reports() {
  const [activeTab, setActiveTab] = useState('sales')
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(false)
  const token = localStorage.getItem('token')

  async function load(tab) {
    setLoading(true)
    setData(null)
    try {
      const fetchers = { sales: reportsAPI.getSales, vehicles: reportsAPI.getVehicles, shipments: reportsAPI.getShipments }
      const { data: res } = await fetchers[tab]()
      setData(res)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load(activeTab) }, [activeTab])

  function exportCsv() {
    const urls = {
      sales: reportsAPI.exportSalesCsv(),
      vehicles: reportsAPI.exportVehiclesCsv(),
      shipments: reportsAPI.exportShipmentsCsv(),
    }
    const a = document.createElement('a')
    a.href = urls[activeTab] + (token ? `?token=${token}` : '')
    a.setAttribute('download', '')
    // Use Authorization header approach via fetch + blob
    fetch(urls[activeTab], { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.blob())
      .then(blob => {
        const url = URL.createObjectURL(blob)
        a.href = url
        a.click()
        URL.revokeObjectURL(url)
      })
  }

  return (
    <div>
      <PageHeader
        title="Reports"
        action={
          <div className="flex items-center gap-2">
            <button onClick={() => load(activeTab)} className="flex items-center gap-1.5 border border-gray-200 text-gray-600 hover:bg-gray-50 text-sm px-3 py-2 rounded-lg">
              <RefreshCw size={14} /> Refresh
            </button>
            <button onClick={exportCsv} className="flex items-center gap-1.5 bg-green-600 hover:bg-green-700 text-white text-sm px-4 py-2 rounded-lg">
              <Download size={14} /> Export CSV
            </button>
          </div>
        }
      />

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 p-1 rounded-xl mb-6 w-fit">
        {tabs.map(({ key, label, Icon }) => (
          <button
            key={key}
            onClick={() => setActiveTab(key)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              activeTab === key ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <Icon size={15} /> {label}
          </button>
        ))}
      </div>

      {loading && (
        <div className="flex items-center justify-center py-20 text-gray-400">
          <BarChart3 size={32} className="animate-pulse" />
        </div>
      )}

      {!loading && data && activeTab === 'sales' && <SalesReport data={data} />}
      {!loading && data && activeTab === 'vehicles' && <VehiclesReport data={data} />}
      {!loading && data && activeTab === 'shipments' && <ShipmentsReport data={data} />}
    </div>
  )
}

function StatBox({ label, value, color = 'blue' }) {
  const colors = { blue: 'bg-blue-50 text-blue-700', green: 'bg-green-50 text-green-700', orange: 'bg-orange-50 text-orange-700', purple: 'bg-purple-50 text-purple-700' }
  return (
    <div className={`rounded-xl p-4 ${colors[color]}`}>
      <p className="text-xs font-medium opacity-70 mb-1">{label}</p>
      <p className="text-2xl font-bold">{value}</p>
    </div>
  )
}

function SalesReport({ data }) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatBox label="Total Sales" value={data.totalSales} color="blue" />
        <StatBox label="Completed" value={data.completedSales} color="green" />
        <StatBox label="Pending" value={data.pendingSales} color="orange" />
        <StatBox label="Total Revenue" value={`$${Number(data.totalRevenue).toLocaleString()}`} color="purple" />
      </div>
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-100">
          <p className="text-sm font-semibold text-gray-700">All Sales</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-xs text-gray-500 uppercase">
              <tr>
                {['ID', 'Customer', 'Email', 'Vehicle', 'VIN', 'Amount', 'Status'].map(h => (
                  <th key={h} className="px-4 py-3 text-left font-medium">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {(data.sales || []).map(s => (
                <tr key={s.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-gray-400">#{s.id}</td>
                  <td className="px-4 py-3 font-medium">{s.customer}</td>
                  <td className="px-4 py-3 text-gray-500">{s.customerEmail}</td>
                  <td className="px-4 py-3">{s.vehicle}</td>
                  <td className="px-4 py-3 font-mono text-xs text-gray-500">{s.vin}</td>
                  <td className="px-4 py-3 font-semibold">${Number(s.amount).toLocaleString()}</td>
                  <td className="px-4 py-3"><Badge status={s.status} /></td>
                </tr>
              ))}
              {(data.sales || []).length === 0 && (
                <tr><td colSpan={7} className="px-4 py-8 text-center text-gray-400">No sales data</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

function VehiclesReport({ data }) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatBox label="Total Vehicles" value={data.totalVehicles} color="blue" />
        {Object.entries(data.byStatus || {}).map(([status, count], i) => (
          <StatBox key={status} label={status} value={count} color={['green', 'orange', 'purple', 'blue'][i % 4]} />
        ))}
      </div>
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-100">
          <p className="text-sm font-semibold text-gray-700">All Vehicles</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-xs text-gray-500 uppercase">
              <tr>
                {['ID', 'VIN', 'Make', 'Model', 'Year', 'Color', 'Status', 'Price'].map(h => (
                  <th key={h} className="px-4 py-3 text-left font-medium">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {(data.vehicles || []).map(v => (
                <tr key={v.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-gray-400">#{v.id}</td>
                  <td className="px-4 py-3 font-mono text-xs">{v.vin}</td>
                  <td className="px-4 py-3 font-medium">{v.make}</td>
                  <td className="px-4 py-3">{v.model}</td>
                  <td className="px-4 py-3">{v.year}</td>
                  <td className="px-4 py-3">{v.color}</td>
                  <td className="px-4 py-3"><Badge status={v.status} /></td>
                  <td className="px-4 py-3 font-semibold">${Number(v.price).toLocaleString()}</td>
                </tr>
              ))}
              {(data.vehicles || []).length === 0 && (
                <tr><td colSpan={8} className="px-4 py-8 text-center text-gray-400">No vehicle data</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

function ShipmentsReport({ data }) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatBox label="Total Shipments" value={data.totalShipments} color="blue" />
        {Object.entries(data.byStatus || {}).map(([status, count], i) => (
          <StatBox key={status} label={status} value={count} color={['green', 'orange', 'purple'][i % 3]} />
        ))}
      </div>
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-100">
          <p className="text-sm font-semibold text-gray-700">All Shipments</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-xs text-gray-500 uppercase">
              <tr>
                {['ID', 'Name', 'Tracking #', 'Origin', 'Destination', 'Status', 'Vehicles'].map(h => (
                  <th key={h} className="px-4 py-3 text-left font-medium">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {(data.shipments || []).map(s => (
                <tr key={s.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-gray-400">#{s.id}</td>
                  <td className="px-4 py-3 font-medium">{s.name}</td>
                  <td className="px-4 py-3"><span className="font-mono text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded">{s.trackingNumber}</span></td>
                  <td className="px-4 py-3">{s.origin}</td>
                  <td className="px-4 py-3">{s.destination}</td>
                  <td className="px-4 py-3"><Badge status={s.status} /></td>
                  <td className="px-4 py-3">{s.vehicleCount}</td>
                </tr>
              ))}
              {(data.shipments || []).length === 0 && (
                <tr><td colSpan={7} className="px-4 py-8 text-center text-gray-400">No shipment data</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
