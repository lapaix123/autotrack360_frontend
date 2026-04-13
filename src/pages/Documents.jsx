import { useState, useEffect } from 'react'
import { documentsAPI, vehiclesAPI, salesAPI } from '../api/services'
import Modal from '../components/Modal'
import Table from '../components/Table'
import PageHeader from '../components/PageHeader'

const input = 'w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500'

export default function Documents() {
  const [documents, setDocuments] = useState([])
  const [vehicles, setVehicles] = useState([])
  const [sales, setSales] = useState([])
  const [showUpload, setShowUpload] = useState(false)
  const [filter, setFilter] = useState({ relatedType: 'VEHICLE', relatedId: '' })
  const [form, setForm] = useState({ relatedType: 'VEHICLE', relatedId: '', file: null })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    vehiclesAPI.getAll().then(({ data }) => setVehicles(data))
    salesAPI.getAll().then(({ data }) => setSales(data))
  }, [])

  async function loadDocs() {
    if (!filter.relatedId) return
    try {
      const { data } = await documentsAPI.getAll(filter.relatedType, filter.relatedId)
      setDocuments(data)
    } catch {
      setDocuments([])
    }
  }

  async function handleUpload(e) {
    e.preventDefault()
    setError('')
    if (!form.file) return setError('Please select a file')
    setLoading(true)
    try {
      const fd = new FormData()
      fd.append('file', form.file)
      fd.append('relatedType', form.relatedType)
      fd.append('relatedId', form.relatedId)
      await documentsAPI.upload(fd)
      setShowUpload(false)
      setForm({ relatedType: 'VEHICLE', relatedId: '', file: null })
      loadDocs()
    } catch (err) {
      setError(err.response?.data?.error || 'Upload failed')
    } finally {
      setLoading(false)
    }
  }

  async function handleDownload(doc) {
    try {
      const { data } = await documentsAPI.download(doc.id)
      const url = URL.createObjectURL(new Blob([data]))
      const a = document.createElement('a')
      a.href = url
      a.download = doc.name
      a.click()
      URL.revokeObjectURL(url)
    } catch {
      alert('Download failed')
    }
  }

  const columns = ['Name', 'Type', 'Related ID', 'Actions']

  return (
    <div>
      <PageHeader
        title="Documents"
        action={
          <button onClick={() => { setShowUpload(true); setError('') }}
            className="bg-blue-600 hover:bg-blue-700 text-white text-sm px-4 py-2 rounded-lg">
            + Upload Document
          </button>
        }
      />

      {/* Filter */}
      <div className="bg-white border border-gray-200 rounded-xl p-4 mb-4 flex gap-3 items-end">
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Type</label>
          <select value={filter.relatedType} onChange={(e) => setFilter({ ...filter, relatedType: e.target.value, relatedId: '' })}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm">
            <option>VEHICLE</option>
            <option>SALE</option>
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">
            {filter.relatedType === 'VEHICLE' ? 'Vehicle' : 'Sale'}
          </label>
          <select value={filter.relatedId} onChange={(e) => setFilter({ ...filter, relatedId: e.target.value })}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm min-w-[200px]">
            <option value="">Select...</option>
            {filter.relatedType === 'VEHICLE'
              ? vehicles.map((v) => <option key={v.id} value={v.id}>{v.make} {v.model} — {v.vin}</option>)
              : sales.map((s) => <option key={s.id} value={s.id}>Sale #{s.id} — {s.customer?.name}</option>)
            }
          </select>
        </div>
        <button onClick={loadDocs} className="px-4 py-2 text-sm bg-gray-800 text-white rounded-lg">Search</button>
      </div>

      <Table
        columns={columns}
        data={documents}
        renderRow={(doc) => (
          <tr key={doc.id} className="hover:bg-gray-50">
            <td className="px-4 py-3 font-medium">{doc.name}</td>
            <td className="px-4 py-3 text-gray-500">{doc.relatedType}</td>
            <td className="px-4 py-3 text-gray-500">#{doc.relatedId}</td>
            <td className="px-4 py-3">
              <button onClick={() => handleDownload(doc)} className="text-blue-600 hover:underline text-xs">Download</button>
            </td>
          </tr>
        )}
      />

      {showUpload && (
        <Modal title="Upload Document" onClose={() => setShowUpload(false)}>
          <form onSubmit={handleUpload} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Related Type *</label>
              <select value={form.relatedType} onChange={(e) => setForm({ ...form, relatedType: e.target.value, relatedId: '' })} className={input}>
                <option>VEHICLE</option>
                <option>SALE</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                {form.relatedType === 'VEHICLE' ? 'Vehicle' : 'Sale'} *
              </label>
              <select required value={form.relatedId} onChange={(e) => setForm({ ...form, relatedId: e.target.value })} className={input}>
                <option value="">Select...</option>
                {form.relatedType === 'VEHICLE'
                  ? vehicles.map((v) => <option key={v.id} value={v.id}>{v.make} {v.model} — {v.vin}</option>)
                  : sales.map((s) => <option key={s.id} value={s.id}>Sale #{s.id} — {s.customer?.name}</option>)
                }
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">File *</label>
              <input type="file" required onChange={(e) => setForm({ ...form, file: e.target.files[0] })}
                className="w-full text-sm text-gray-600 file:mr-3 file:py-1.5 file:px-3 file:rounded file:border-0 file:text-sm file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100" />
            </div>
            {error && <p className="text-red-500 text-sm">{error}</p>}
            <div className="flex justify-end gap-2">
              <button type="button" onClick={() => setShowUpload(false)} className="px-4 py-2 text-sm border rounded-lg">Cancel</button>
              <button type="submit" disabled={loading} className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg disabled:opacity-60">
                {loading ? 'Uploading...' : 'Upload'}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  )
}
