import { useState, useEffect } from 'react'
import { inventoryAPI, vehiclesAPI } from '../api/services'
import Modal from '../components/Modal'
import Badge from '../components/Badge'
import Table from '../components/Table'
import PageHeader from '../components/PageHeader'

const input = 'w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500'

export default function Inventory() {
  const [inventory, setInventory] = useState([])
  const [vehicles, setVehicles] = useState([])
  const [showAdd, setShowAdd] = useState(false)
  const [vehicleId, setVehicleId] = useState('')
  const [location, setLocation] = useState('')
  const [error, setError] = useState('')

  function load() {
    inventoryAPI.getAll().then(({ data }) => setInventory(data))
  }

  useEffect(() => {
    load()
    vehiclesAPI.getAll().then(({ data }) => setVehicles(data))
  }, [])

  async function handleAdd(e) {
    e.preventDefault()
    setError('')
    try {
      await inventoryAPI.addVehicle(vehicleId, location)
      setShowAdd(false)
      setVehicleId('')
      setLocation('')
      load()
    } catch (err) {
      setError(err.response?.data?.error || 'Error adding to inventory')
    }
  }

  const columns = ['Vehicle', 'VIN', 'Year', 'Color', 'Price', 'Location', 'Status']

  return (
    <div>
      <PageHeader
        title="Inventory"
        action={
          <button onClick={() => { setShowAdd(true); setError('') }}
            className="bg-blue-600 hover:bg-blue-700 text-white text-sm px-4 py-2 rounded-lg">
            + Add to Inventory
          </button>
        }
      />

      <Table
        columns={columns}
        data={inventory}
        renderRow={(item) => (
          <tr key={item.id} className="hover:bg-gray-50">
            <td className="px-4 py-3 font-medium">{item.vehicle.make} {item.vehicle.model}</td>
            <td className="px-4 py-3 font-mono text-xs text-gray-500">{item.vehicle.vin}</td>
            <td className="px-4 py-3">{item.vehicle.year}</td>
            <td className="px-4 py-3">{item.vehicle.color}</td>
            <td className="px-4 py-3">${Number(item.vehicle.price).toLocaleString()}</td>
            <td className="px-4 py-3">{item.location}</td>
            <td className="px-4 py-3"><Badge status={item.status} /></td>
          </tr>
        )}
      />

      {showAdd && (
        <Modal title="Add Vehicle to Inventory" onClose={() => setShowAdd(false)}>
          <form onSubmit={handleAdd} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Vehicle *</label>
              <select value={vehicleId} onChange={(e) => setVehicleId(e.target.value)} required className={input}>
                <option value="">Select vehicle...</option>
                {vehicles.filter((v) => v.status === 'ARRIVED').map((v) => (
                  <option key={v.id} value={v.id}>{v.make} {v.model} ({v.year}) — {v.vin}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Location *</label>
              <input value={location} onChange={(e) => setLocation(e.target.value)} required placeholder="e.g. Lot-A" className={input} />
            </div>
            {error && <p className="text-red-500 text-sm">{error}</p>}
            <div className="flex justify-end gap-2">
              <button type="button" onClick={() => setShowAdd(false)} className="px-4 py-2 text-sm border rounded-lg">Cancel</button>
              <button type="submit" className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg">Add</button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  )
}
