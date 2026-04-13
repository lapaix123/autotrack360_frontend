import { useState, useEffect } from 'react'
import { salesAPI, customersAPI, vehiclesAPI } from '../api/services'
import Modal from '../components/Modal'
import Badge from '../components/Badge'
import Table from '../components/Table'
import PageHeader from '../components/PageHeader'

const input = 'w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500'

export default function Sales() {
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

  const columns = ['Customer', 'Vehicle', 'Amount', 'Status', 'Actions']

  return (
    <div>
      <PageHeader
        title="Sales"
        action={
          <div className="flex gap-2">
            <button onClick={() => { setShowCustomer(true); setError('') }}
              className="border border-blue-600 text-blue-600 hover:bg-blue-50 text-sm px-4 py-2 rounded-lg">
              + Customer
            </button>
            <button onClick={() => { setShowSale(true); setError('') }}
              className="bg-blue-600 hover:bg-blue-700 text-white text-sm px-4 py-2 rounded-lg">
              + New Sale
            </button>
          </div>
        }
      />

      <Table
        columns={columns}
        data={sales}
        renderRow={(s) => (
          <tr key={s.id} className="hover:bg-gray-50">
            <td className="px-4 py-3">
              <p className="font-medium">{s.customer.name}</p>
              <p className="text-xs text-gray-400">{s.customer.phone}</p>
            </td>
            <td className="px-4 py-3">
              <p>{s.vehicle.make} {s.vehicle.model}</p>
              <p className="text-xs text-gray-400">{s.vehicle.vin}</p>
            </td>
            <td className="px-4 py-3 font-medium">${Number(s.totalAmount).toLocaleString()}</td>
            <td className="px-4 py-3"><Badge status={s.status} /></td>
            <td className="px-4 py-3">
              {s.status === 'PENDING' && (
                <button onClick={() => handleComplete(s.id)} className="text-green-600 hover:underline text-xs">Complete</button>
              )}
            </td>
          </tr>
        )}
      />

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
