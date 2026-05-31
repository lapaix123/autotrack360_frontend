import { useState, useEffect } from 'react'
import { shipmentsAPI } from '../api/services'
import Modal from '../components/Modal'
import Badge from '../components/Badge'
import PageHeader from '../components/PageHeader'
import { Ship, MapPin, Car } from 'lucide-react'

const input = 'w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50'

export default function ShippingPortal() {
  const [shipments, setShipments] = useState([])
  const [selected, setSelected] = useState(null)
  const [gpsForm, setGpsForm] = useState({ lat: '', lng: '', location: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  function load() {
    shipmentsAPI.getAll().then(({ data }) => setShipments(data))
  }

  useEffect(() => { load() }, [])

  function openGps(shipment) {
    setSelected(shipment)
    setGpsForm({
      lat: shipment.currentLatitude?.toString() || '',
      lng: shipment.currentLongitude?.toString() || '',
      location: shipment.currentLocation || '',
    })
    setError('')
  }

  async function handleGpsUpdate(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await shipmentsAPI.updateGps(
        selected.id,
        Number(gpsForm.lat),
        Number(gpsForm.lng),
        gpsForm.location || undefined
      )
      setSelected(null)
      load()
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to update GPS location')
    } finally {
      setLoading(false)
    }
  }


  const inTransit = shipments.filter(s => s.status === 'SHIPPED' || s.status === 'CREATED').length

  return (
    <div>
      <PageHeader title="Shipping Portal" />

      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-white rounded-xl border border-gray-200 p-4 flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
            <Ship size={20} className="text-blue-600" />
          </div>
          <div>
            <p className="text-xs text-gray-500">Total Shipments</p>
            <p className="text-2xl font-bold">{shipments.length}</p>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4 flex items-center gap-3">
          <div className="w-10 h-10 bg-orange-50 rounded-lg flex items-center justify-center">
            <MapPin size={20} className="text-orange-500" />
          </div>
          <div>
            <p className="text-xs text-gray-500">Active / In Transit</p>
            <p className="text-2xl font-bold">{inTransit}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {shipments.map(s => (
          <div key={s.id} className="bg-white rounded-xl border border-gray-200 p-5">
            <div className="flex items-start justify-between mb-3">
              <div>
                <h3 className="font-semibold text-gray-800">{s.name}</h3>
                <p className="text-xs text-gray-400 font-mono mt-0.5">{s.trackingNumber || 'No tracking #'}</p>
              </div>
              <Badge status={s.status} />
            </div>
            <div className="space-y-1.5 text-sm text-gray-600 mb-4">
              <p><span className="text-gray-400">Route:</span> {s.origin} → {s.destination}</p>
              <p className="flex items-center gap-1.5">
                <Car size={14} className="text-gray-400" />
                {s.vehicles?.length || 0} vehicle(s)
              </p>
              {s.currentLatitude && s.currentLongitude && (
                <p className="flex items-center gap-1.5 text-blue-600">
                  <MapPin size={14} />
                  {s.currentLocation || `${s.currentLatitude.toFixed(4)}, ${s.currentLongitude.toFixed(4)}`}
                </p>
              )}
            </div>
            <button
              onClick={() => openGps(s)}
              className="w-full py-2 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center justify-center gap-2"
            >
              <MapPin size={14} /> Update GPS Location
            </button>
          </div>
        ))}
        {shipments.length === 0 && (
          <div className="col-span-full text-center py-16 text-gray-400">
            <Ship size={40} className="mx-auto mb-3 opacity-30" />
            <p>No shipments assigned yet</p>
          </div>
        )}
      </div>

      {selected && (
        <Modal title={`Update GPS — ${selected.name}`} onClose={() => setSelected(null)}>
          <form onSubmit={handleGpsUpdate} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Latitude *</label>
              <input type="number" step="any" required value={gpsForm.lat}
                onChange={(e) => setGpsForm({ ...gpsForm, lat: e.target.value })} className={input} placeholder="-1.9441" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Longitude *</label>
              <input type="number" step="any" required value={gpsForm.lng}
                onChange={(e) => setGpsForm({ ...gpsForm, lng: e.target.value })} className={input} placeholder="30.0619" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Location label</label>
              <input type="text" value={gpsForm.location}
                onChange={(e) => setGpsForm({ ...gpsForm, location: e.target.value })} className={input} placeholder="Port of Mombasa" />
            </div>
            {error && <p className="text-red-500 text-sm">{error}</p>}
            <div className="flex justify-end gap-2 pt-2">
              <button type="button" onClick={() => setSelected(null)} className="px-4 py-2 text-sm border rounded-lg">Cancel</button>
              <button type="submit" disabled={loading} className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg disabled:opacity-60">
                {loading ? 'Saving...' : 'Save Location'}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  )
}
