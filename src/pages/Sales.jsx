import { useState, useEffect } from 'react'
import { salesAPI, customersAPI, vehiclesAPI } from '../api/services'
import Modal from '../components/Modal'
import Badge from '../components/Badge'
import Table from '../components/Table'
import PageHeader from '../components/PageHeader'
import { BadgeDollarSign, Users, ShoppingCart, CheckCircle, Clock } from 'lucide-react'

const input = 'w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500'

export default function Sales() {
  const [tab, setTab] = useState('orders')
  const [sales, setSales] = useState([])
  const [customers, setCustomers] = useState([])
  const [vehicles, setVehicles] = useState([])
  const [showSale, setShowSale] = useState(false)
  const [showCustomer, setShowCustomer] = useState(false)
  const [saleForm, setSaleForm] = useState({ customerId: '', vehicleId: '', totalAmount: '' })
  const [custForm, setCustForm] = useState({ name: '', phone: '', email: '' })
  const [error, setError] = useState('')

  function load() {
    salesAPI.getAll().then(({ data }) => setSales(data))
    customersAPI.getAll().then(({ data }) => setCustomers(data))
    vehiclesAPI.getAll().then(({ data }) => setVehicles(data))
  }

  useEffect(() => { load() }, [])

  async function handleCreateCustomer(e) {
    e.preventDefault()
    setError('')
    try {
      await customersAPI.create(custForm)
      setShowCustomer(false)
      setCustForm({ name: '', phone: '', email: '' })
      load()
    } catch (err) {
      setError(err.response?.data?.error || 'Error creating customer')
    }
  }

  async function handleCreateSale(e) {
    e.preventDefault()
    setError('')
    try {
      await salesAPI.create({ ...saleForm, customerId: Number(saleForm.customerId), vehicleId: Number(saleForm.vehicleId), totalAmount: Number(saleForm.totalAmount) })
      setShowSale(false)
      setSaleForm({ customerId: '', vehicleId: '', totalAmount: '' })
      load()
    } catch (err) {
      setError(err.response?.data?.error || 'Error creating sale')
    }
  }

  async function handleComplete(id) {
    if (!confirm('Mark this sale as completed?')) return
    try {
      await salesAPI.complete(id)
      load()
    } catch (err) {
      alert(err.response?.data?.error || 'Error completing sale')
    }
  }

  const pending = sales.filter(s => s.status === 'PENDING').length
  const completed = sales.filter(s => s.status === 'COMPLETED').length

  return (
    <div>
      <PageHeader
        title="Sales Department"
        action={
          <div className="flex gap-2">
            <button onClick={() => { setShowCustomer(true); setError('') }}
              className="flex items-center gap-1.5 border border-blue-600 text-blue-600 hover:bg-blue-50 text-sm px-4 py-2 rounded-lg">
              <Users size={14} /> Add Customer
            </button>
            <button onClick={() => { setShowSale(true); setError('') }}
              className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white text-sm px-4 py-2 rounded-lg">
              <ShoppingCart size={14} /> New Order
            </button>
          </div>
        }
      />

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-xl border border-gray-200 p-4 flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center"><BadgeDollarSign size={20} className="text-blue-600" /></div>
          <div><p className="text-xs text-gray-500">Total Orders</p><p className="text-2xl font-bold text-gray-800">{sales.length}</p></div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4 flex items-center gap-3">
          <div className="w-10 h-10 bg-orange-50 rounded-lg flex items-center justify-center"><Clock size={20} className="text-orange-500" /></div>
          <div><p className="text-xs text-gray-500">Pending</p><p className="text-2xl font-bold text-gray-800">{pending}</p></div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4 flex items-center gap-3">
          <div className="w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center"><CheckCircle size={20} className="text-green-500" /></div>
          <div><p className="text-xs text-gray-500">Completed</p><p className="text-2xl font-bold text-gray-800">{completed}</p></div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 p-1 rounded-xl mb-4 w-fit">
        <button onClick={() => setTab('orders')} className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${tab === 'orders' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500'}`}>Orders</button>
        <button onClick={() => setTab('customers')} className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${tab === 'customers' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500'}`}>Customers ({customers.length})</button>
      </div>

      {tab === 'orders' && (
        <Table
          columns={['Customer', 'Vehicle', 'Amount', 'Status', 'Actions']}
          data={sales}
          renderRow={(s) => (
            <tr key={s.id} className="hover:bg-gray-50">
              <td className="px-4 py-3">
                <p className="font-medium">{s.customer.name}</p>
                <p className="text-xs text-gray-400">{s.customer.phone} · {s.customer.email}</p>
              </td>
              <td className="px-4 py-3">
                <p>{s.vehicle.make} {s.vehicle.model} ({s.vehicle.year})</p>
                <p className="text-xs text-gray-400 font-mono">{s.vehicle.vin}</p>
              </td>
              <td className="px-4 py-3 font-semibold">${Number(s.totalAmount).toLocaleString()}</td>
              <td className="px-4 py-3"><Badge status={s.status} /></td>
              <td className="px-4 py-3">
                {s.status === 'PENDING' && (
                  <button onClick={() => handleComplete(s.id)} className="flex items-center gap-1 text-green-600 hover:text-green-700 text-xs font-medium">
                    <CheckCircle size={13} /> Complete
                  </button>
                )}
              </td>
            </tr>
          )}
        />
      )}

      {tab === 'customers' && (
        <Table
          columns={['Name', 'Phone', 'Email']}
          data={customers}
          renderRow={(c) => (
            <tr key={c.id} className="hover:bg-gray-50">
              <td className="px-4 py-3">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 text-xs font-bold">{c.name[0]}</div>
                  <span className="font-medium">{c.name}</span>
                </div>
              </td>
              <td className="px-4 py-3 text-gray-600">{c.phone}</td>
              <td className="px-4 py-3 text-gray-600">{c.email}</td>
            </tr>
          )}
        />
      )}

      {/* Create Customer Modal */}
      {showCustomer && (
        <Modal title="New Customer" onClose={() => setShowCustomer(false)}>
          <form onSubmit={handleCreateCustomer} className="space-y-3">
            {[['name', 'Full Name'], ['phone', 'Phone'], ['email', 'Email']].map(([field, label]) => (
              <div key={field}>
                <label className="block text-xs font-medium text-gray-600 mb-1">{label} *</label>
                <input required value={custForm[field]} onChange={(e) => setCustForm({ ...custForm, [field]: e.target.value })} className={input} />
              </div>
            ))}
            {error && <p className="text-red-500 text-sm">{error}</p>}
            <div className="flex justify-end gap-2 pt-2">
              <button type="button" onClick={() => setShowCustomer(false)} className="px-4 py-2 text-sm border rounded-lg">Cancel</button>
              <button type="submit" className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg">Save</button>
            </div>
          </form>
        </Modal>
      )}

      {/* Create Sale Modal */}
      {showSale && (
        <Modal title="New Sale" onClose={() => setShowSale(false)}>
          <form onSubmit={handleCreateSale} className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Customer *</label>
              <select required value={saleForm.customerId} onChange={(e) => setSaleForm({ ...saleForm, customerId: e.target.value })} className={input}>
                <option value="">Select customer...</option>
                {customers.map((c) => <option key={c.id} value={c.id}>{c.name} — {c.phone}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Vehicle *</label>
              <select required value={saleForm.vehicleId} onChange={(e) => setSaleForm({ ...saleForm, vehicleId: e.target.value })} className={input}>
                <option value="">Select vehicle...</option>
                {vehicles.filter((v) => v.status === 'AVAILABLE').map((v) => (
                  <option key={v.id} value={v.id}>{v.make} {v.model} ({v.year}) — ${Number(v.price).toLocaleString()}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Total Amount *</label>
              <input type="number" step="0.01" required value={saleForm.totalAmount} onChange={(e) => setSaleForm({ ...saleForm, totalAmount: e.target.value })} className={input} />
            </div>
            {error && <p className="text-red-500 text-sm">{error}</p>}
            <div className="flex justify-end gap-2 pt-2">
              <button type="button" onClick={() => setShowSale(false)} className="px-4 py-2 text-sm border rounded-lg">Cancel</button>
              <button type="submit" className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg">Create Sale</button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  )
}
