import { useState, useEffect } from 'react'
import { vehiclesAPI } from '../api/services'
import Modal from '../components/Modal'
import Badge from '../components/Badge'
import Table from '../components/Table'
import PageHeader from '../components/PageHeader'

const STATUSES = ['IMPORTED', 'IN_TRANSIT', 'ARRIVED', 'AVAILABLE', 'SOLD']
const emptyForm = { vin: '', make: '', model: '', year: '', color: '', price: '', status: 'IMPORTED' }

export default function Vehicles() {
  const [vehicles, setVehicles] = useState([])
  const [showAdd, setShowAdd] = useState(false)
  const [editVehicle, setEditVehicle] = useState(null)
  const [statusVehicle, setStatusVehicle] = useState(null)
  const [form, setForm] = useState(emptyForm)
  const [newStatus, setNewStatus] = useState('')
  const [error, setError] = useState('')

  function load() {
    vehiclesAPI.getAll().then(({ data }) => setVehicles(data))
  }

  useEffect(() => { load() }, [])

  function openEdit(v) {
    setEditVehicle(v)
    setForm({ make: v.make, model: v.model, year: v.year, color: v.color, price: v.price })
  }

  async function handleAdd(e) {
    e.preventDefault()
    setError('')
    try {
      await vehiclesAPI.create({ ...form, year: Number(form.year), price: Number(form.price) })
      setShowAdd(false)
      setForm(emptyForm)
      load()
    } catch (err) {
      setError(err.response?.data?.error || 'Error creating vehicle')
    }
  }

  async function handleEdit(e) {
    e.preventDefault()
    setError('')
    try {
      await vehiclesAPI.update(editVehicle.id, { ...form, year: Number(form.year), price: Number(form.price) })
      setEditVehicle(null)
      load()
    } catch (err) {
      setError(err.response?.data?.error || 'Error updating vehicle')
    }
  }

  async function handleStatusChange(e) {
    e.preventDefault()
    try {
      await vehiclesAPI.updateStatus(statusVehicle.id, newStatus)
      setStatusVehicle(null)
      load()
    } catch (err) {
      setError(err.response?.data?.error || 'Error updating status')
    }
  }

  const columns = ['VIN', 'Make', 'Model', 'Year', 'Color', 'Price', 'Status', 'Actions']

  return (
    <div>
      <PageHeader
        title="Vehicles"
        action={
          <button onClick={() => { setShowAdd(true); setForm(emptyForm); setError('') }}
            className="bg-blue-600 hover:bg-blue-700 text-white text-sm px-4 py-2 rounded-lg">
            + Add Vehicle
          </button>
        }
      />

      <Table
        columns={columns}
        data={vehicles}
        renderRow={(v) => (
          <tr key={v.id} className="hover:bg-gray-50">
            <td className="px-4 py-3 font-mono text-xs text-gray-600">{v.vin}</td>
            <td className="px-4 py-3">{v.make}</td>
            <td className="px-4 py-3">{v.model}</td>
            <td className="px-4 py-3">{v.year}</td>
            <td className="px-4 py-3">{v.color}</td>
            <td className="px-4 py-3">${Number(v.price).toLocaleString()}</td>
            <td className="px-4 py-3"><Badge status={v.status} /></td>
            <td className="px-4 py-3 space-x-2">
              <button onClick={() => { openEdit(v); setError('') }} className="text-blue-600 hover:underline text-xs">Edit</button>
              <button onClick={() => { setStatusVehicle(v); setNewStatus(v.status); setError('') }} className="text-purple-600 hover:underline text-xs">Status</button>
            </td>
          </tr>
        )}
      />

      {/* Add Modal */}
      {showAdd && (
        <Modal title="Add Vehicle" onClose={() => setShowAdd(false)}>
          <VehicleForm form={form} setForm={setForm} onSubmit={handleAdd} error={error} showVin showStatus />
        </Modal>
      )}

      {/* Edit Modal */}
      {editVehicle && (
        <Modal title="Edit Vehicle" onClose={() => setEditVehicle(null)}>
          <VehicleForm form={form} setForm={setForm} onSubmit={handleEdit} error={error} />
        </Modal>
      )}

      {/* Status Modal */}
      {statusVehicle && (
        <Modal title="Change Status" onClose={() => setStatusVehicle(null)}>
          <form onSubmit={handleStatusChange} className="space-y-4">
            <p className="text-sm text-gray-600">{statusVehicle.make} {statusVehicle.model} — {statusVehicle.vin}</p>
            <select value={newStatus} onChange={(e) => setNewStatus(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm">
              {STATUSES.map((s) => <option key={s}>{s}</option>)}
            </select>
            {error && <p className="text-red-500 text-sm">{error}</p>}
            <div className="flex justify-end gap-2">
              <button type="button" onClick={() => setStatusVehicle(null)} className="px-4 py-2 text-sm border rounded-lg">Cancel</button>
              <button type="submit" className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg">Update</button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  )
}

function VehicleForm({ form, setForm, onSubmit, error, showVin, showStatus }) {
  const f = (field) => ({ value: form[field] || '', onChange: (e) => setForm({ ...form, [field]: e.target.value }) })
  return (
    <form onSubmit={onSubmit} className="space-y-3">
      {showVin && <Field label="VIN" required><input {...f('vin')} className={input} /></Field>}
      <div className="grid grid-cols-2 gap-3">
        <Field label="Make" required><input {...f('make')} className={input} /></Field>
        <Field label="Model" required><input {...f('model')} className={input} /></Field>
        <Field label="Year" required><input type="number" {...f('year')} className={input} /></Field>
        <Field label="Color" required><input {...f('color')} className={input} /></Field>
      </div>
      <Field label="Price" required><input type="number" step="0.01" {...f('price')} className={input} /></Field>
      {showStatus && (
        <Field label="Status">
          <select {...f('status')} className={input}>
            {['IMPORTED', 'IN_TRANSIT', 'ARRIVED', 'AVAILABLE', 'SOLD'].map((s) => <option key={s}>{s}</option>)}
          </select>
        </Field>
      )}
      {error && <p className="text-red-500 text-sm">{error}</p>}
      <div className="flex justify-end gap-2 pt-2">
        <button type="submit" className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg">Save</button>
      </div>
    </form>
  )
}

function Field({ label, required, children }) {
  return (
    <div>
      <label className="block text-xs font-medium text-gray-600 mb-1">{label}{required && ' *'}</label>
      {children}
    </div>
  )
}

const input = 'w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500'
