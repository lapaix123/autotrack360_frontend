import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { vehiclesAPI, shipmentsAPI, salesAPI, paymentsAPI } from '../api/services'
import Modal from '../components/Modal'
import Badge from '../components/Badge'
import PageHeader from '../components/PageHeader'
import { Car, MapPin, Ship, CheckCircle, ChevronRight, Plus, CreditCard, LogOut } from 'lucide-react'

const input = 'w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50'

export default function CustomerPortal() {
  const navigate = useNavigate()
  const name = localStorage.getItem('name') || localStorage.getItem('email')
  const [tab, setTab] = useState('browse') // browse | orders | shipments | payments
  const [vehicles, setVehicles] = useState([])
  const [myOrders, setMyOrders] = useState([])
  const [myShipments, setMyShipments] = useState([])
  const [myPayments, setMyPayments] = useState([])
  const [showOrder, setShowOrder] = useState(false)
  const [showPayment, setShowPayment] = useState(false)
  const [paymentOrder, setPaymentOrder] = useState(null)
  const [paymentAmount, setPaymentAmount] = useState('')
  const [paymentLoading, setPaymentLoading] = useState(false)
  const [selectedVehicle, setSelectedVehicle] = useState(null)
  const [orderForm, setOrderForm] = useState({ vehicleId: '', totalAmount: '' })
  const [error, setError] = useState('')

  useEffect(() => {
    vehiclesAPI.getAll(null, true).then(({ data }) => setVehicles(data))
    salesAPI.getAll().then(({ data }) => setMyOrders(data))
    shipmentsAPI.getAll().then(({ data }) => setMyShipments(data))
  }, [])

  async function handleCreateOrder(e) {
    e.preventDefault()
    setError('')
    try {
      await salesAPI.create({ ...orderForm, vehicleId: Number(orderForm.vehicleId), totalAmount: Number(orderForm.totalAmount) })
      setShowOrder(false)
      setOrderForm({ vehicleId: '', totalAmount: '' })
      salesAPI.getAll().then(({ data }) => setMyOrders(data))
      vehiclesAPI.getAll(null, true).then(({ data }) => setVehicles(data))
    } catch (err) {
      setError(err.response?.data?.error || 'Error creating order')
    }
  }

  function openPayment(order) {
    setPaymentOrder(order)
    setPaymentAmount(String(order.totalAmount))
    setError('')
    setShowPayment(true)
  }

  async function handleCreatePayment(e) {
    e.preventDefault()
    setError('')
    setPaymentLoading(true)
    try {
      await paymentsAPI.create({
        saleId: paymentOrder.id,
        amount: Number(paymentAmount),
      })
      setShowPayment(false)
      setPaymentOrder(null)
      setPaymentAmount('')
      salesAPI.getAll().then(({ data }) => setMyOrders(data))
    } catch (err) {
      setError(err.response?.data?.error || 'Error processing payment')
    } finally {
      setPaymentLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
    <div className="max-w-7xl mx-auto">
      <PageHeader
        title="Customer Portal"
        action={
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-500 hidden sm:inline">Hi, {name}</span>
            <button
              onClick={() => { localStorage.clear(); navigate('/login') }}
              className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-red-500"
            >
              <LogOut size={14} /> Sign out
            </button>
          </div>
        }
      />
      <div className="flex gap-2 mb-6">
        <button onClick={() => setTab('browse')} className={`px-4 py-2 rounded-lg text-sm font-medium ${tab === 'browse' ? 'bg-blue-600 text-white' : 'bg-white text-gray-600 border border-gray-200'}`}>
          Browse Vehicles
        </button>
        <button onClick={() => setTab('orders')} className={`px-4 py-2 rounded-lg text-sm font-medium ${tab === 'orders' ? 'bg-blue-600 text-white' : 'bg-white text-gray-600 border border-gray-200'}`}>
          My Orders
        </button>
        <button onClick={() => setTab('shipments')} className={`px-4 py-2 rounded-lg text-sm font-medium ${tab === 'shipments' ? 'bg-blue-600 text-white' : 'bg-white text-gray-600 border border-gray-200'}`}>
          Track Shipments
        </button>
      </div>

      {tab === 'browse' && (
        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-800">Available Vehicles</h2>
            <span className="text-sm text-gray-500">{vehicles.length} vehicles available</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {vehicles.map((v) => (
              <VehicleCard key={v.id} vehicle={v} onOrder={() => { setSelectedVehicle(v); setOrderForm({ vehicleId: v.id, totalAmount: v.price }); setShowOrder(true) }} />
            ))}
            {vehicles.length === 0 && (
              <div className="col-span-full text-center py-16 text-gray-400">
                <Car size={40} className="mx-auto mb-3 opacity-30" />
                <p>No vehicles available for purchase</p>
              </div>
            )}
          </div>
        </div>
      )}

      {tab === 'orders' && (
        <div>
          <h2 className="text-xl font-bold text-gray-800 mb-6">My Orders</h2>
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-xs text-gray-500 uppercase">
                <tr>
                  <th className="px-4 py-3 text-left">Order ID</th>
                  <th className="px-4 py-3 text-left">Vehicle</th>
                  <th className="px-4 py-3 text-left">Amount</th>
                  <th className="px-4 py-3 text-left">Status</th>
                  <th className="px-4 py-3 text-left">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {myOrders.map(o => (
                  <tr key={o.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-mono text-xs">#{o.id}</td>
                    <td className="px-4 py-3">{o.vehicle.make} {o.vehicle.model} ({o.vehicle.year})</td>
                    <td className="px-4 py-3 font-semibold">${Number(o.totalAmount).toLocaleString()}</td>
                    <td className="px-4 py-3"><Badge status={o.status} /></td>
                    <td className="px-4 py-3">
                      {o.status === 'PENDING' && (
                        <button
                          type="button"
                          onClick={() => openPayment(o)}
                          className="text-blue-600 hover:underline text-xs flex items-center gap-1"
                        >
                          <CreditCard size={12} /> Make Payment
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
                {myOrders.length === 0 && (
                  <tr><td colSpan={5} className="px-4 py-8 text-center text-gray-400">No orders yet</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {tab === 'shipments' && (
        <div>
          <h2 className="text-xl font-bold text-gray-800 mb-6">Track Your Shipments</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {myShipments.map(s => (
              <div key={s.id} className="bg-white rounded-xl border border-gray-200 p-5">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="font-semibold text-gray-800">{s.name}</h3>
                    <p className="text-xs text-gray-400 font-mono">{s.trackingNumber || 'No tracking'}</p>
                  </div>
                  <Badge status={s.status} />
                </div>
                <div className="space-y-2 text-sm text-gray-600">
                  <div className="flex items-center gap-2">
                    <MapPin size={14} className="text-gray-400" />
                    <span>{s.origin} <span className="text-gray-300">→</span> {s.destination}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Ship size={14} className="text-gray-400" />
                    <span>{s.vehicles?.length || 0} vehicle(s) in shipment</span>
                  </div>
                </div>
                {s.currentLatitude && s.currentLongitude && (
                  <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                    <p className="text-xs text-blue-600 font-medium mb-1">Current GPS Location</p>
                    <p className="text-sm text-gray-700">
                      Lat: {s.currentLatitude.toFixed(4)}, Lng: {s.currentLongitude.toFixed(4)}
                      {s.currentLocation && <span className="ml-2 text-gray-500">({s.currentLocation})</span>}
                    </p>
                    {s.lastGpsUpdate && (
                      <p className="text-xs text-gray-400 mt-1">Last updated: {new Date(s.lastGpsUpdate).toLocaleString()}</p>
                    )}
                  </div>
                )}
              </div>
            ))}
            {myShipments.length === 0 && (
              <div className="col-span-full text-center py-16 text-gray-400">
                <Ship size={40} className="mx-auto mb-3 opacity-30" />
                <p>No shipments found</p>
              </div>
            )}
          </div>
        </div>
      )}

      {showPayment && paymentOrder && (
        <Modal title={`Pay for Order #${paymentOrder.id}`} onClose={() => setShowPayment(false)}>
          <form onSubmit={handleCreatePayment} className="space-y-4">
            <div className="bg-blue-50 rounded-lg p-4">
              <p className="text-sm text-blue-800">
                <strong>Vehicle:</strong> {paymentOrder.vehicle.make} {paymentOrder.vehicle.model} ({paymentOrder.vehicle.year})<br />
                <strong>Order total:</strong> ${Number(paymentOrder.totalAmount).toLocaleString()}
              </p>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Payment Amount *</label>
              <input
                type="number"
                step="0.01"
                required
                min="0.01"
                value={paymentAmount}
                onChange={(e) => setPaymentAmount(e.target.value)}
                className={input}
              />
            </div>
            {error && <p className="text-red-500 text-sm">{error}</p>}
            <div className="flex justify-end gap-2 pt-2">
              <button type="button" onClick={() => setShowPayment(false)} className="px-4 py-2 text-sm border rounded-lg">Cancel</button>
              <button type="submit" disabled={paymentLoading} className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg flex items-center gap-2 disabled:opacity-60">
                <CreditCard size={14} /> {paymentLoading ? 'Processing...' : 'Pay Now'}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {showOrder && (
        <Modal title={`Order: ${selectedVehicle?.make} ${selectedVehicle?.model}`} onClose={() => setShowOrder(false)}>
          <form onSubmit={handleCreateOrder} className="space-y-4">
            <div className="bg-blue-50 rounded-lg p-4">
              <p className="text-sm text-blue-800">
                <strong>Vehicle:</strong> {selectedVehicle?.make} {selectedVehicle?.model} ({selectedVehicle?.year})<br />
                <strong>Chassis:</strong> {selectedVehicle?.chassisNumber}<br />
                <strong>Price:</strong> ${Number(selectedVehicle?.price).toLocaleString()}
              </p>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Total Amount *</label>
              <input type="number" step="0.01" required value={orderForm.totalAmount} onChange={(e) => setOrderForm({ ...orderForm, totalAmount: e.target.value })} className={input} />
            </div>
            {error && <p className="text-red-500 text-sm">{error}</p>}
            <div className="flex justify-end gap-2 pt-2">
              <button type="button" onClick={() => setShowOrder(false)} className="px-4 py-2 text-sm border rounded-lg">Cancel</button>
              <button type="submit" className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg flex items-center gap-2">
                <CreditCard size={14} /> Confirm Order
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
    </div>
  )
}

function VehicleCard({ vehicle: v, onOrder }) {
  const images = v.images || []
  const [imgIdx, setImgIdx] = useState(0)
  const [autoImgError, setAutoImgError] = useState(false)

  const uploadedImg = images[imgIdx]?.url || null
  const autoImg = !uploadedImg && !autoImgError ? `https://source.unsplash.com/400x300/?${encodeURIComponent(v.make + ' ' + v.model + ' car')}` : null

  return (
    <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow">
      <div className="relative h-44 bg-gradient-to-br from-gray-100 to-gray-200 overflow-hidden">
        {uploadedImg ? (
          <img src={uploadedImg} alt={`${v.make} ${v.model}`} className="w-full h-full object-cover" />
        ) : autoImg ? (
          <img src={autoImg} alt={`${v.make} ${v.model}`} className="w-full h-full object-cover" onError={() => setAutoImgError(true)} />
        ) : (
          <div className="w-full h-full flex items-center justify-center"><Car size={40} className="text-gray-300" /></div>
        )}
        <div className="absolute top-2 left-2"><Badge status={v.status} /></div>
      </div>
      <div className="p-4">
        <h3 className="font-semibold text-gray-900">{v.make} {v.model}</h3>
        <p className="text-gray-500 text-xs mt-0.5">{v.year} · {v.color}</p>
        <p className="text-blue-600 font-bold text-lg mt-2">${Number(v.price).toLocaleString()}</p>
        <p className="text-gray-300 text-xs font-mono mt-1 truncate">{v.chassisNumber}</p>
        <button onClick={onOrder} className="mt-3 w-full bg-blue-600 hover:bg-blue-700 text-white text-sm py-2 rounded-lg flex items-center justify-center gap-2">
          <Plus size={14} /> Order Now
        </button>
      </div>
    </div>
  )
}
