import { useState, useEffect } from 'react'
import { shipmentsAPI, vehiclesAPI } from '../api/services'
import Modal from '../components/Modal'
import Badge from '../components/Badge'
import Table from '../components/Table'
import PageHeader from '../components/PageHeader'

const STATUSES = ['CREATED', 'SHIPPED', 'ARRIVED']
const input = 'w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500'

export default function Shipments() {
  const [shipments, setShipments] = useState([])
  const [vehicles, setVehicles] = useState([])
  const [showCreate, setShowCreate] = useState(false)
  const [selectedShipment, setSelectedShipment] = useState(null)
  const [statusShipment, setStatusShipment] = useState(null)
  const [form, setForm] = useState({ name: '', origin: '', destination: '' })
  const [vehicleId, setVehicleId] = useState('')
  const [newStatus, setNewStatus] = useState('')
  const [error, setError] = useState('')

  function load() {
    shipmentsAPI.getAll().then(({ data }) => setShipments(data))
  }

  useEffect(() => {
    load()
    vehiclesAPI.getAll().then(({ data }) => setVehicles(data))
  }, [])

  async function handleCreate(e) {
    e.preventDefault()
    setError('')
    try {
      await shipmentsAPI.create(form)
      setShowCreate(false)
      setForm({ name: '', origin: '', destination: '' })
      load()
    } catch (err) {
      setError(err.response?.data?.error || 'Error creating shipment')
    }
  }

  async function handleAddVehicle(e) {
    e.preventDefault()
    setError('')
    try {
      await shipmentsAPI.addVehicle(selectedShipment.id, vehicleId)
      setVehicleId('')
      const { data } = await shipmentsAPI.getById(selectedShipment.id)
      setSelectedShipment(data)
      load()
    } catch (err) {
      setError(err.response?.data?.error || 'Error adding vehicle')
    }
  }

  async function handleStatusChange(e) {
    e.preventDefault()
    try {
      await shipmentsAPI.updateStatus(statusShipment.id, newStatus)
      setStatusShipment(null)
      load()
    } catch (err) {
      setError(err.response?.data?.error || 'Error updating status')
    }
  }

  const columns = ['Name', 'Origin', 'Destination', 'Status', 'Vehicles', 'Actions']

  return (
    <div>
      <PageHeader
        title="Shipments"
        action={
          <button onClick={() => { setShowCreate(true); setError('') }}
            className="bg-blue-600 hover:bg-blue-700 text-white text-sm px-4 py-2 rounded-lg">
            + New Shipment
          </button>
        }
      />

      <Table
        columns={columns}
        data={shipments}
        renderRow={(s) => (
          <tr key={s.id} className="hover:bg-gray-50">
            <td className="px-4 py-3 font-medium">{s.name}</td>
            <td className="px-4 py-3">{s.origin}</td>
            <td className="px-4 py-3">{s.destination}</td>
            <td className="px-4 py-3"><Badge status={s.status} /></td>
            <td className="px-4 py-3 text-gray-500">{s.vehicles?.length || 0} vehicles</td>
            <td className="px-4 py-3 space-x-2">
              <button onClick={() => { setSelectedShipment(s); setError('') }} className="text-blue-600 hover:underline text-xs">Manage</button>
              <button onClick={() => { setStatusShipment(s); setNewStatus(s.status); setError('') }} className="text-purple-600 hover:underline text-xs">Status</button>
            </td>
          </tr>
        )}
      />

      {/* Create Modal */}
      {showCreate && (
        <Modal title="Create Shipment" onClose={() => setShowCreate(false)}>
          <form onSubmit={handleCreate} className="space-y-3">
            {[['name', 'Shipment Name'], ['origin', 'Origin'], ['destination', 'Destination']].map(([field, label]) => (
              <div key={field}>
                <label className="block text-xs font-medium text-gray-600 mb-1">{label} *</label>
                <input required value={form[field]} onChange={(e) => setForm({ ...form, [field]: e.target.value })} className={input} />
              </div>
            ))}
            {error && <p className="text-red-500 text-sm">{error}</p>}
            <div className="flex justify-end gap-2 pt-2">
              <button type="button" onClick={() => setShowCreate(false)} className="px-4 py-2 text-sm border rounded-lg">Cancel</button>
              <button type="submit" className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg">Create</button>
            </div>
          </form>
        </Modal>
      )}

      {/* Manage Vehicles Modal */}
      {selectedShipment && (
        <Modal title={`Manage: ${selectedShipment.name}`} onClose={() => setSelectedShipment(null)}>
          <div className="space-y-4">
            <div>
              <p className="text-xs font-medium text-gray-500 mb-2">VEHICLES IN SHIPMENT</p>
              {selectedShipment.vehicles?.length === 0
                ? <p className="text-sm text-gray-400">No vehicles added yet</p>
                : selectedShipment.vehicles.map((v) => (
                  <div key={v.id} className="flex items-center justify-between py-1.5 border-b text-sm">
                    <span>{v.make} {v.model} ({v.year})</span>
                    <Badge status={v.status} />
                  </div>
                ))
              }
            </div>
            <form onSubmit={handleAddVehicle} className="space-y-3">
              <p className="text-xs font-medium text-gray-500">ADD VEHICLE</p>
              <select value={vehicleId} onChange={(e) => setVehicleId(e.target.value)} required className={input}>
                <option value="">Select vehicle...</option>
                {vehicles.filter((v) => v.status === 'IMPORTED').map((v) => (
                  <option key={v.id} value={v.id}>{v.make} {v.model} — {v.vin}</option>
                ))}
              </select>
              {error && <p className="text-red-500 text-sm">{error}</p>}
              <button type="submit" className="w-full py-2 text-sm bg-blue-600 text-white rounded-lg">Add Vehicle</button>
            </form>
          </div>
        </Modal>
      )}

      {/* Status Modal */}
      {statusShipment && (
        <Modal title="Update Shipment Status" onClose={() => setStatusShipment(null)}>
          <form onSubmit={handleStatusChange} className="space-y-4">
            <p className="text-sm text-gray-600">{statusShipment.name}</p>
            <select value={newStatus} onChange={(e) => setNewStatus(e.target.value)} className={input}>
              {STATUSES.map((s) => <option key={s}>{s}</option>)}
            </select>
            {error && <p className="text-red-500 text-sm">{error}</p>}
            <div className="flex justify-end gap-2">
              <button type="button" onClick={() => setStatusShipment(null)} className="px-4 py-2 text-sm border rounded-lg">Cancel</button>
              <button type="submit" className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg">Update</button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  )
}
