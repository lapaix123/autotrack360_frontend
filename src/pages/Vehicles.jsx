import { useState, useEffect, useRef } from 'react'
import { vehiclesAPI } from '../api/services'
import Modal from '../components/Modal'
import Badge from '../components/Badge'
import PageHeader from '../components/PageHeader'
import { Car, Upload, Trash2, Images, ChevronLeft, ChevronRight, Plus, AlertCircle } from 'lucide-react'

const STATUSES = ['IMPORTED', 'IN_TRANSIT', 'ARRIVED', 'AVAILABLE', 'SOLD']
const emptyForm = { chassisNumber: '', make: '', model: '', year: '', color: '', price: '', status: 'IMPORTED', description: '', engineType: '', transmission: '', mileage: '' }
const input = 'w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50'

// Generate a placeholder image URL from make/model/year using a car image search
function carPlaceholderUrl(make, model, year) {
  if (!make || !model) return null
  // Use a reliable car image service
  const query = encodeURIComponent(`${year || ''} ${make} ${model}`.trim())
  return `https://www.motortrend.com/uploads/sites/5/2023/01/placeholder-car.jpg`
}

// Use Unsplash source for car images based on make/model
function carImageUrl(make, model) {
  if (!make) return null
  const q = encodeURIComponent(`${make} ${model} car`)
  return `https://source.unsplash.com/400x300/?${q}`
}

export default function Vehicles() {
  const [vehicles, setVehicles] = useState([])
  const [showAdd, setShowAdd] = useState(false)
  const [editVehicle, setEditVehicle] = useState(null)
  const [statusVehicle, setStatusVehicle] = useState(null)
  const [detailVehicle, setDetailVehicle] = useState(null)
  const [form, setForm] = useState(emptyForm)
  const [newStatus, setNewStatus] = useState('')
  const [error, setError] = useState('')
  const [filterStatus, setFilterStatus] = useState('')

  function load() {
    vehiclesAPI.getAll(filterStatus || undefined).then(({ data }) => setVehicles(data))
  }

  useEffect(() => { load() }, [filterStatus])

  function openEdit(v) {
    setEditVehicle(v)
    setForm({ make: v.make, model: v.model, year: v.year, color: v.color, price: v.price, description: v.description || '', engineType: v.engineType || '', transmission: v.transmission || '', mileage: v.mileage || '' })
  }

  async function handleAdd(e) {
    e.preventDefault(); setError('')
    if (form.chassisNumber.trim().length !== 17) { setError('Chassis number must be exactly 17 characters'); return }
    try {
      await vehiclesAPI.create({ ...form, year: Number(form.year), price: Number(form.price), mileage: Number(form.mileage) || 0 })
      setShowAdd(false); setForm(emptyForm); load()
    } catch (err) { setError(err.response?.data?.error || 'Error creating vehicle') }
  }

  async function handleEdit(e) {
    e.preventDefault(); setError('')
    try {
      await vehiclesAPI.update(editVehicle.id, { ...form, year: Number(form.year), price: Number(form.price), mileage: Number(form.mileage) || 0 })
      setEditVehicle(null); load()
    } catch (err) { setError(err.response?.data?.error || 'Error updating vehicle') }
  }

  async function handleStatusChange(e) {
    e.preventDefault()
    try {
      await vehiclesAPI.updateStatus(statusVehicle.id, newStatus)
      setStatusVehicle(null); load()
    } catch (err) { setError(err.response?.data?.error || 'Error updating status') }
  }

  return (
    <div>
      <PageHeader
        title="Vehicles"
        action={
          <div className="flex items-center gap-2">
            <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}
              className="border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white text-gray-600">
              <option value="">All Statuses</option>
              {STATUSES.map((s) => <option key={s}>{s}</option>)}
            </select>
            <button onClick={() => { setShowAdd(true); setForm(emptyForm); setError('') }}
              className="bg-blue-600 hover:bg-blue-700 text-white text-sm px-4 py-2 rounded-lg flex items-center gap-1.5">
              <Plus size={15} /> Add Vehicle
            </button>
          </div>
        }
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {vehicles.map((v) => (
          <VehicleCard key={v.id} vehicle={v}
            onDetail={() => setDetailVehicle(v)}
            onEdit={() => { openEdit(v); setError('') }}
            onStatus={() => { setStatusVehicle(v); setNewStatus(v.status); setError('') }}
          />
        ))}
        {vehicles.length === 0 && (
          <div className="col-span-full text-center py-16 text-gray-400">
            <Car size={40} className="mx-auto mb-3 opacity-30" />
            <p>No vehicles found</p>
          </div>
        )}
      </div>

      {showAdd && (
        <Modal title="Add Vehicle" onClose={() => setShowAdd(false)}>
          <VehicleForm form={form} setForm={setForm} onSubmit={handleAdd} error={error} showChassis showStatus />
        </Modal>
      )}
      {editVehicle && (
        <Modal title="Edit Vehicle" onClose={() => setEditVehicle(null)}>
          <VehicleForm form={form} setForm={setForm} onSubmit={handleEdit} error={error} />
        </Modal>
      )}
      {statusVehicle && (
        <Modal title="Change Status" onClose={() => setStatusVehicle(null)}>
          <form onSubmit={handleStatusChange} className="space-y-4">
            <p className="text-sm text-gray-600">{statusVehicle.make} {statusVehicle.model} — {statusVehicle.chassisNumber}</p>
            <select value={newStatus} onChange={(e) => setNewStatus(e.target.value)} className={input}>
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
      {detailVehicle && (
        <VehicleDetailModal vehicle={detailVehicle} onClose={() => setDetailVehicle(null)} onRefresh={load} />
      )}
    </div>
  )
}

function VehicleCard({ vehicle: v, onDetail, onEdit, onStatus }) {
  const images = v.images || []
  const [imgIdx, setImgIdx] = useState(0)
  const [autoImgError, setAutoImgError] = useState(false)

  const uploadedImg = images[imgIdx]?.url || null
  // Auto-generate image from make/model when no uploaded image
  const autoImg = !uploadedImg && !autoImgError ? carImageUrl(v.make, v.model) : null

  return (
    <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow group">
      <div className="relative h-44 bg-gradient-to-br from-gray-100 to-gray-200 overflow-hidden">
        {uploadedImg ? (
          <img src={uploadedImg} alt={`${v.make} ${v.model}`} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
        ) : autoImg ? (
          <img src={autoImg} alt={`${v.make} ${v.model}`}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            onError={() => setAutoImgError(true)} />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center gap-2">
            <Car size={40} className="text-gray-300" />
            <p className="text-xs text-gray-400 font-medium">{v.make} {v.model}</p>
          </div>
        )}
        {images.length > 1 && (
          <>
            <button onClick={(e) => { e.stopPropagation(); setImgIdx((i) => (i - 1 + images.length) % images.length) }}
              className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/60 text-white rounded-full p-1">
              <ChevronLeft size={14} />
            </button>
            <button onClick={(e) => { e.stopPropagation(); setImgIdx((i) => (i + 1) % images.length) }}
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/60 text-white rounded-full p-1">
              <ChevronRight size={14} />
            </button>
            <span className="absolute bottom-2 right-2 bg-black/50 text-white text-xs px-1.5 py-0.5 rounded-full">
              {imgIdx + 1}/{images.length}
            </span>
          </>
        )}
        <div className="absolute top-2 left-2"><Badge status={v.status} /></div>
      </div>

      <div className="p-4">
        <h3 className="font-semibold text-gray-900">{v.make} {v.model}</h3>
        <p className="text-gray-500 text-xs mt-0.5">{v.year} · {v.color}</p>
        <p className="text-blue-600 font-bold text-lg mt-2">${Number(v.price).toLocaleString()}</p>
        {v.mileage > 0 && <p className="text-gray-400 text-xs">{Number(v.mileage).toLocaleString()} km</p>}
        <p className="text-gray-300 text-xs font-mono mt-1 truncate">{v.chassisNumber}</p>
        <div className="flex gap-1.5 mt-3">
          <button onClick={onDetail} className="flex-1 text-xs bg-blue-50 hover:bg-blue-100 text-blue-600 py-1.5 rounded-lg flex items-center justify-center gap-1">
            <Images size={12} /> Details
          </button>
          <button onClick={onEdit} className="flex-1 text-xs bg-gray-50 hover:bg-gray-100 text-gray-600 py-1.5 rounded-lg">Edit</button>
          <button onClick={onStatus} className="flex-1 text-xs bg-purple-50 hover:bg-purple-100 text-purple-600 py-1.5 rounded-lg">Status</button>
        </div>
      </div>
    </div>
  )
}

function VehicleDetailModal({ vehicle: v, onClose, onRefresh }) {
  const [images, setImages] = useState([])
  const [activeImg, setActiveImg] = useState(0)
  const [uploading, setUploading] = useState(false)
  const [autoImgError, setAutoImgError] = useState(false)
  const fileRef = useRef()

  function loadImages() {
    vehiclesAPI.getImages(v.id).then(({ data }) => setImages(data)).catch(() => {})
  }
  useEffect(() => { loadImages() }, [v.id])

  async function handleUpload(e) {
    const files = Array.from(e.target.files)
    if (!files.length) return
    setUploading(true)
    try {
      for (const file of files) {
        const fd = new FormData(); fd.append('file', file)
        await vehiclesAPI.uploadImage(v.id, fd)
      }
      loadImages(); onRefresh()
    } finally { setUploading(false); fileRef.current.value = '' }
  }

  async function handleDelete(imageId) {
    await vehiclesAPI.deleteImage(imageId)
    loadImages(); onRefresh(); setActiveImg(0)
  }

  const activeUrl = images[activeImg]?.url || null
  const autoImg = !activeUrl && !autoImgError ? carImageUrl(v.make, v.model) : null

  return (
    <Modal title={`${v.make} ${v.model} (${v.year})`} onClose={onClose} wide>
      <div className="flex flex-col lg:flex-row gap-6">
        <div className="lg:w-1/2">
          <div className="relative h-64 bg-gray-100 rounded-xl overflow-hidden mb-3">
            {activeUrl ? (
              <img src={activeUrl} alt="" className="w-full h-full object-cover" />
            ) : autoImg ? (
              <img src={autoImg} alt={`${v.make} ${v.model}`} className="w-full h-full object-cover"
                onError={() => setAutoImgError(true)} />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center text-gray-300">
                <Car size={48} /><p className="text-sm mt-2">No images yet</p>
              </div>
            )}
            {images[activeImg] && (
              <button onClick={() => handleDelete(images[activeImg].id)}
                className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white p-1.5 rounded-lg">
                <Trash2 size={14} />
              </button>
            )}
          </div>
          {images.length > 0 && (
            <div className="flex gap-2 overflow-x-auto pb-1">
              {images.map((img, i) => (
                <button key={img.id} onClick={() => setActiveImg(i)}
                  className={`flex-shrink-0 w-14 h-14 rounded-lg overflow-hidden border-2 ${i === activeImg ? 'border-blue-500' : 'border-transparent'}`}>
                  <img src={img.url} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
          <div className="mt-3">
            <input ref={fileRef} type="file" accept="image/*" multiple className="hidden" onChange={handleUpload} />
            <button onClick={() => fileRef.current.click()} disabled={uploading}
              className="w-full border-2 border-dashed border-gray-200 hover:border-blue-400 text-gray-500 hover:text-blue-500 rounded-xl py-3 text-sm flex items-center justify-center gap-2 disabled:opacity-60">
              <Upload size={16} />{uploading ? 'Uploading...' : 'Upload Images'}
            </button>
          </div>
        </div>

        <div className="lg:w-1/2 space-y-3">
          <div className="flex items-center gap-2">
            <Badge status={v.status} />
          </div>
          <div className="bg-blue-50 rounded-lg p-3">
            <p className="text-xs text-blue-400 mb-0.5">Chassis Number</p>
            <p className="text-sm font-mono font-bold text-blue-800 tracking-widest">{v.chassisNumber}</p>
          </div>
          <p className="text-2xl font-bold text-blue-600">${Number(v.price).toLocaleString()}</p>
          <div className="grid grid-cols-2 gap-3">
            {[['Make', v.make], ['Model', v.model], ['Year', v.year], ['Color', v.color],
              ['Engine', v.engineType || '—'], ['Transmission', v.transmission || '—'],
              ['Mileage', v.mileage ? `${Number(v.mileage).toLocaleString()} km` : '—'],
            ].map(([label, val]) => (
              <div key={label} className="bg-gray-50 rounded-lg p-3">
                <p className="text-xs text-gray-400 mb-0.5">{label}</p>
                <p className="text-sm font-medium text-gray-800">{val}</p>
              </div>
            ))}
          </div>
          {v.description && (
            <div className="bg-gray-50 rounded-lg p-3">
              <p className="text-xs text-gray-400 mb-1">Description</p>
              <p className="text-sm text-gray-700 leading-relaxed">{v.description}</p>
            </div>
          )}
        </div>
      </div>
    </Modal>
  )
}

function VehicleForm({ form, setForm, onSubmit, error, showChassis, showStatus }) {
  const f = (field) => ({ value: form[field] || '', onChange: (e) => setForm({ ...form, [field]: e.target.value }) })
  const chassisLen = (form.chassisNumber || '').trim().length
  return (
    <form onSubmit={onSubmit} className="space-y-3">
      {showChassis && (
        <Field label="Chassis Number (17 characters) *">
          <input {...f('chassisNumber')} required maxLength={17}
            className={`${input} font-mono tracking-widest uppercase ${chassisLen > 0 && chassisLen !== 17 ? 'border-red-400 focus:ring-red-400' : ''}`}
            placeholder="e.g. 1HGCM82633A123456" />
          <div className="flex items-center justify-between mt-1">
            {chassisLen > 0 && chassisLen !== 17 && (
              <span className="flex items-center gap-1 text-xs text-red-500"><AlertCircle size={11} /> Must be exactly 17 characters</span>
            )}
            {chassisLen === 17 && <span className="text-xs text-emerald-600">✓ Valid chassis number</span>}
            <span className={`text-xs ml-auto ${chassisLen === 17 ? 'text-emerald-600' : 'text-gray-400'}`}>{chassisLen}/17</span>
          </div>
        </Field>
      )}
      <div className="grid grid-cols-2 gap-3">
        <Field label="Make *"><input {...f('make')} required className={input} /></Field>
        <Field label="Model *"><input {...f('model')} required className={input} /></Field>
        <Field label="Year *"><input type="number" {...f('year')} required className={input} /></Field>
        <Field label="Color *"><input {...f('color')} required className={input} /></Field>
        <Field label="Price *"><input type="number" step="0.01" {...f('price')} required className={input} /></Field>
        <Field label="Mileage (km)"><input type="number" {...f('mileage')} className={input} /></Field>
        <Field label="Engine Type"><input {...f('engineType')} className={input} placeholder="e.g. V6 3.5L" /></Field>
        <Field label="Transmission"><input {...f('transmission')} className={input} placeholder="e.g. Automatic" /></Field>
      </div>
      <Field label="Description"><textarea {...f('description')} rows={2} className={input} /></Field>
      {showStatus && (
        <Field label="Status">
          <select {...f('status')} className={input}>
            {STATUSES.map((s) => <option key={s}>{s}</option>)}
          </select>
        </Field>
      )}
      {error && <p className="text-red-500 text-sm">{error}</p>}
      <div className="flex justify-end pt-2">
        <button type="submit" className="px-5 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700">Save</button>
      </div>
    </form>
  )
}

function Field({ label, children }) {
  return (
    <div>
      <label className="block text-xs font-medium text-gray-500 mb-1">{label}</label>
      {children}
    </div>
  )
}
