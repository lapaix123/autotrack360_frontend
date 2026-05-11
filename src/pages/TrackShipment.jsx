import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { shipmentsAPI } from '../api/services'
import { Search, Car, MapPin, Package, ArrowLeft, CheckCircle, Clock, Truck } from 'lucide-react'
import Badge from '../components/Badge'

const statusSteps = ['CREATED', 'SHIPPED', 'ARRIVED']
const statusIcons = { CREATED: Package, SHIPPED: Truck, ARRIVED: CheckCircle }

export default function TrackShipment() {
  const { trackingNumber: paramTracking } = useParams()
  const navigate = useNavigate()
  const [tracking, setTracking] = useState(paramTracking || '')
  const [result, setResult] = useState(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSearch(e) {
    e.preventDefault()
    if (!tracking.trim()) return
    setError(''); setResult(null); setLoading(true)
    try {
      const { data } = await shipmentsAPI.track(tracking.trim())
      setResult(data)
    } catch {
      setError('No shipment found with that tracking number.')
    } finally {
      setLoading(false)
    }
  }

  const stepIndex = result ? statusSteps.indexOf(result.status) : -1

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* Header */}
      <div className="border-b border-gray-800 px-6 py-4 flex items-center gap-4">
        <button onClick={() => navigate('/')} className="text-gray-400 hover:text-white transition-colors flex items-center gap-1.5 text-sm">
          <ArrowLeft size={15} /> Home
        </button>
        <div className="h-4 w-px bg-gray-700" />
        <span className="text-sm font-medium">Shipment Tracking</span>
      </div>

      <div className="max-w-2xl mx-auto px-6 py-16">
        <div className="text-center mb-10">
          <div className="w-14 h-14 bg-blue-600/10 border border-blue-600/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Search size={24} className="text-blue-400" />
          </div>
          <h1 className="text-3xl font-bold mb-2">Track Your Shipment</h1>
          <p className="text-gray-400">Enter your tracking number to see the current status of your vehicle shipment.</p>
        </div>

        <form onSubmit={handleSearch} className="flex gap-2 mb-8">
          <input
            value={tracking}
            onChange={(e) => setTracking(e.target.value)}
            placeholder="e.g. AT-3F9A1B2C"
            className="flex-1 bg-gray-900 border border-gray-700 text-white placeholder-gray-500 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            type="submit"
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-3 rounded-xl text-sm font-medium transition-colors disabled:opacity-60 flex items-center gap-2"
          >
            <Search size={15} />
            {loading ? 'Searching...' : 'Track'}
          </button>
        </form>

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl p-4 text-sm text-center">
            {error}
          </div>
        )}

        {result && (
          <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden">
            {/* Shipment header */}
            <div className="p-6 border-b border-gray-800">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs text-gray-500 mb-1">Shipment</p>
                  <h2 className="text-xl font-bold">{result.name}</h2>
                  <span className="font-mono text-xs bg-blue-500/10 text-blue-400 px-2 py-0.5 rounded border border-blue-500/20 mt-1 inline-block">
                    {result.trackingNumber}
                  </span>
                </div>
                <Badge status={result.status} />
              </div>

              <div className="flex items-center gap-2 mt-4 text-sm text-gray-400">
                <MapPin size={14} className="text-gray-500" />
                <span>{result.origin}</span>
                <span className="text-gray-600">→</span>
                <span>{result.destination}</span>
              </div>

              {result.estimatedArrival && (
                <div className="flex items-center gap-2 mt-2 text-sm text-gray-400">
                  <Clock size={14} className="text-gray-500" />
                  <span>Est. arrival: {new Date(result.estimatedArrival).toLocaleDateString()}</span>
                </div>
              )}

              {result.notes && (
                <p className="mt-3 text-sm text-gray-400 bg-gray-800 rounded-lg p-3">{result.notes}</p>
              )}
            </div>

            {/* Progress steps */}
            <div className="p-6 border-b border-gray-800">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4">Shipment Progress</p>
              <div className="flex items-center">
                {statusSteps.map((step, i) => {
                  const Icon = statusIcons[step]
                  const done = i <= stepIndex
                  const active = i === stepIndex
                  return (
                    <div key={step} className="flex items-center flex-1 last:flex-none">
                      <div className="flex flex-col items-center">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-colors ${
                          done ? 'bg-blue-600 border-blue-600' : 'bg-gray-800 border-gray-700'
                        } ${active ? 'ring-4 ring-blue-600/20' : ''}`}>
                          <Icon size={18} className={done ? 'text-white' : 'text-gray-600'} />
                        </div>
                        <p className={`text-xs mt-2 font-medium ${done ? 'text-blue-400' : 'text-gray-600'}`}>{step}</p>
                      </div>
                      {i < statusSteps.length - 1 && (
                        <div className={`flex-1 h-0.5 mx-2 mb-5 ${i < stepIndex ? 'bg-blue-600' : 'bg-gray-700'}`} />
                      )}
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Vehicles */}
            {result.vehicles?.length > 0 && (
              <div className="p-6">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                  Vehicles in Shipment ({result.vehicles.length})
                </p>
                <div className="space-y-2">
                  {result.vehicles.map((v) => (
                    <div key={v.id} className="flex items-center justify-between bg-gray-800 rounded-xl px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-gray-700 rounded-lg flex items-center justify-center">
                          <Car size={16} className="text-gray-400" />
                        </div>
                        <div>
                          <p className="text-sm font-medium">{v.make} {v.model} ({v.year})</p>
                          <p className="text-xs text-gray-500 font-mono">{v.vin}</p>
                        </div>
                      </div>
                      <Badge status={v.status} />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
