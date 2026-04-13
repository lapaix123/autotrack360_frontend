import { useState, useEffect } from 'react'
import { paymentsAPI, salesAPI } from '../api/services'
import Modal from '../components/Modal'
import Table from '../components/Table'
import PageHeader from '../components/PageHeader'

const input = 'w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500'

export default function Payments() {
  const [payments, setPayments] = useState([])
  const [sales, setSales] = useState([])
  const [showAdd, setShowAdd] = useState(false)
  const [form, setForm] = useState({ saleId: '', amount: '' })
  const [error, setError] = useState('')

  function load() {
    paymentsAPI.getAll().then(({ data }) => setPayments(data))
    salesAPI.getAll().then(({ data }) => setSales(data))
  }

  useEffect(() => { load() }, [])

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    try {
      await paymentsAPI.create({ saleId: Number(form.saleId), amount: Number(form.amount) })
      setShowAdd(false)
      setForm({ saleId: '', amount: '' })
      load()
    } catch (err) {
      setError(err.response?.data?.error || 'Error recording payment')
    }
  }

  const getSaleLabel = (saleId) => {
    const s = sales.find((s) => s.id === saleId)
    return s ? `Sale #${s.id} — ${s.customer?.name}` : `Sale #${saleId}`
  }

  const columns = ['Sale', 'Amount', 'Date']

  return (
    <div>
      <PageHeader
        title="Payments"
        action={
          <button onClick={() => { setShowAdd(true); setError('') }}
            className="bg-blue-600 hover:bg-blue-700 text-white text-sm px-4 py-2 rounded-lg">
            + Record Payment
          </button>
        }
      />

      <Table
        columns={columns}
        data={payments}
        renderRow={(p) => (
          <tr key={p.id} className="hover:bg-gray-50">
            <td className="px-4 py-3">{getSaleLabel(p.saleId)}</td>
            <td className="px-4 py-3 font-medium">${Number(p.amount).toLocaleString()}</td>
            <td className="px-4 py-3 text-gray-500">{p.date}</td>
          </tr>
        )}
      />

      {showAdd && (
        <Modal title="Record Payment" onClose={() => setShowAdd(false)}>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Sale *</label>
              <select required value={form.saleId} onChange={(e) => setForm({ ...form, saleId: e.target.value })} className={input}>
                <option value="">Select sale...</option>
                {sales.filter((s) => s.status === 'PENDING').map((s) => (
                  <option key={s.id} value={s.id}>
                    Sale #{s.id} — {s.customer?.name} (${Number(s.totalAmount).toLocaleString()})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Amount *</label>
              <input type="number" step="0.01" required value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} className={input} />
            </div>
            {error && <p className="text-red-500 text-sm">{error}</p>}
            <div className="flex justify-end gap-2">
              <button type="button" onClick={() => setShowAdd(false)} className="px-4 py-2 text-sm border rounded-lg">Cancel</button>
              <button type="submit" className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg">Record</button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  )
}
