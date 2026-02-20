import { useState, useEffect } from 'react'
import Navbar from '../components/common/Navbar'
import { procurementApi, dealsApi, cropsApi } from '../api/services'
import { useAuth } from '../context/AuthContext'
import { StatCard, SectionHeader, EmptyState, Modal, FormField, Spinner, Badge } from '../components/common/UI'
import { DealCard, ProcurementCard } from '../components/common/Cards'
import toast from 'react-hot-toast'
import { ShoppingCart, GitMerge, TrendingUp, Plus, Pencil, Trash2, Package } from 'lucide-react'

const DISTRICTS = ['Lilongwe','Blantyre','Mzuzu','Zomba','Kasungu','Mangochi','Salima','Dedza','Ntcheu','Balaka']
const emptyProc = { cropId:'', quantityNeeded:'', unit:'', maxPricePerUnit:'', deliveryDeadline:'', preferredDistricts:[], description:'' }

export default function BuyerDashboard() {
  const { user } = useAuth()
  const [requests, setRequests] = useState([])
  const [deals, setDeals] = useState([])
  const [crops, setCrops] = useState([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(emptyProc)
  const [submitting, setSubmitting] = useState(false)

  const load = () => {
    Promise.all([
      procurementApi.getMine(),
      dealsApi.getMine(),
      cropsApi.getAll(),
    ]).then(([r, d, c]) => {
      setRequests(r.data)
      setDeals(d.data)
      setCrops(c.data)
    }).catch(console.error)
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  const set = k => e => setForm(p => ({ ...p, [k]: e.target.value }))

  const handleCropChange = (e) => {
    const cropId = e.target.value
    const selectedCrop = crops.find(c => c.id === cropId)
    setForm(p => ({ ...p, cropId, unit: selectedCrop?.unitOfMeasure ?? '' }))
  }

  const toggleDistrict = (d) => {
    setForm(p => ({
      ...p,
      preferredDistricts: p.preferredDistricts.includes(d)
        ? p.preferredDistricts.filter(x => x !== d)
        : [...p.preferredDistricts, d]
    }))
  }

  const openCreate = () => { setEditing(null); setForm(emptyProc); setModal(true) }
  const openEdit = (r) => {
    setEditing(r)
    setForm({
      cropId: r.cropId,
      unit: r.unit ?? '',
      quantityNeeded: r.quantityNeeded,
      maxPricePerUnit: r.maxPricePerUnit,
      deliveryDeadline: r.deliveryDeadline?.slice(0,10) ?? '',
      preferredDistricts: r.preferredDistricts ?? [],
      description: r.description ?? ''
    })
    setModal(true)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      const payload = {
        cropId: form.cropId,
        unit: form.unit,
        quantityNeeded: Number(form.quantityNeeded),
        maxPricePerUnit: Number(form.maxPricePerUnit),
        ...(form.deliveryDeadline ? { deliveryDeadline: form.deliveryDeadline } : {}),
        ...(form.preferredDistricts.length ? { preferredDistricts: form.preferredDistricts } : {}),
        ...(form.description ? { description: form.description } : {}),
      }
      if (editing) {
        await procurementApi.update(editing.id, payload)
        toast.success('Request updated!')
      } else {
        await procurementApi.create(payload)
        toast.success('Procurement request created!')
      }
      setModal(false); load()
    } catch (err) {
      const msg = err.response?.data?.message
      toast.error(Array.isArray(msg) ? msg.join(', ') : msg ?? 'Something went wrong')
    } finally { setSubmitting(false) }
  }

  const handleDelete = async (id) => {
    if (!confirm('Remove this request?')) return
    try { await procurementApi.remove(id); toast.success('Request removed'); load() }
    catch { toast.error('Failed to remove') }
  }

  const updateDealStatus = async (dealId, status) => {
    try {
      await dealsApi.updateStatus(dealId, status)
      toast.success(`Deal ${status}!`)
      load()
    } catch (err) {
      const msg = err.response?.data?.message
      toast.error(Array.isArray(msg) ? msg.join(', ') : msg ?? 'Failed to update deal')
    }
  }

  return (
    <div className="min-h-screen bg-earth-50">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="font-display font-800 text-3xl text-earth-900">Welcome, {user?.firstName}! 🛒</h1>
          <p className="text-earth-400 mt-1">Manage procurement requests and track your deals</p>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard label="My Requests" value={requests.length} icon={ShoppingCart} color="sky" />
          <StatCard label="Open Requests" value={requests.filter(r=>r.status==='open').length} icon={Package} color="sky" />
          <StatCard label="Total Deals" value={deals.length} icon={GitMerge} color="leaf" />
          <StatCard label="Completed" value={deals.filter(d=>d.status==='completed').length} icon={TrendingUp} color="earth" />
        </div>

        {/* Procurement Requests */}
        <div className="card p-6 mb-6">
          <SectionHeader title="My Procurement Requests" description="Crops you're looking to buy"
            action={<button onClick={openCreate} className="btn-primary flex items-center gap-2 text-sm py-2"><Plus className="w-4 h-4"/>New Request</button>} />

          {requests.length === 0 ? (
            <EmptyState icon={ShoppingCart} title="No requests yet"
              description="Post a procurement request to let farmers know what you need"
              action={<button onClick={openCreate} className="btn-primary">Post Request</button>} />
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {requests.map(r => (
                <div key={r.id}>
                  <ProcurementCard request={r} />
                  <div className="flex gap-2 mt-2">
                    <button onClick={() => openEdit(r)} className="btn-secondary flex-1 text-sm py-1.5 flex items-center justify-center gap-1"><Pencil className="w-3 h-3"/>Edit</button>
                    <button onClick={() => handleDelete(r.id)} className="btn-danger flex-1 text-sm py-1.5 flex items-center justify-center gap-1"><Trash2 className="w-3 h-3"/>Remove</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Deals */}
        <div className="card p-6">
          <SectionHeader title="My Deals" description="Deals from your listings and farmer responses to your requests" />
          {deals.filter(d => d.status !== 'cancelled').length === 0 ? (
            <EmptyState icon={GitMerge} title="No deals yet" description="Browse the marketplace or post a procurement request to get deals" />
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {deals.filter(d => d.status !== 'cancelled').map(d => (
                <div key={d.id}>
                  <DealCard deal={d} />
                  {d.status === 'pending' && d.buyerId === user?.id && (
                    <div className="flex gap-2 mt-2">
                      <button onClick={() => updateDealStatus(d.id, 'accepted')}
                        className="btn-primary flex-1 text-sm py-1.5">Accept</button>
                      <button onClick={() => updateDealStatus(d.id, 'cancelled')}
                        className="btn-danger flex-1 text-sm py-1.5">Decline</button>
                    </div>
                  )}
                  {d.status === 'accepted' && d.buyerId === user?.id && (
                    <div className="space-y-2 mt-2">
                      <div className="text-center text-xs text-leaf-600 font-semibold py-1.5 bg-leaf-50 rounded-lg">
                        ✓ Deal accepted — awaiting delivery
                      </div>
                      <button onClick={() => { if(confirm('Cancel this deal?')) updateDealStatus(d.id, 'cancelled') }}
                        className="w-full text-xs text-earth-400 hover:text-red-500 transition-colors py-1">
                        Cancel deal
                      </button>
                    </div>
                  )}
                  {d.status === 'completed' && (
                    <div className="mt-2 text-center text-xs text-leaf-700 font-semibold py-1.5 bg-leaf-50 rounded-lg">
                      ✅ Completed
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <Modal open={modal} onClose={() => setModal(false)} title={editing ? 'Edit Request' : 'New Procurement Request'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <FormField label="Crop" required>
            <select className="input" value={form.cropId} onChange={handleCropChange} required>
              <option value="">Select a crop...</option>
              {crops.map(c => <option key={c.id} value={c.id}>{c.name} ({c.unitOfMeasure})</option>)}
            </select>
            {form.unit && <p className="text-xs text-earth-400 mt-1">Unit: <span className="font-semibold text-sky-600">{form.unit}</span></p>}
          </FormField>
          <div className="grid grid-cols-2 gap-3">
            <FormField label="Quantity needed" required>
              <input type="number" className="input" placeholder="500" value={form.quantityNeeded} onChange={set('quantityNeeded')} required />
            </FormField>
            <FormField label="Max price/unit (MK)" required>
              <input type="number" className="input" placeholder="600" value={form.maxPricePerUnit} onChange={set('maxPricePerUnit')} required />
            </FormField>
          </div>
          <FormField label="Delivery Deadline">
            <input type="date" className="input" value={form.deliveryDeadline} onChange={set('deliveryDeadline')} />
          </FormField>
          <FormField label="Preferred Districts">
            <div className="flex flex-wrap gap-2">
              {DISTRICTS.map(d => (
                <button key={d} type="button" onClick={() => toggleDistrict(d)}
                  className={`text-xs px-3 py-1.5 rounded-full border transition-all ${
                    form.preferredDistricts.includes(d)
                      ? 'bg-sky-100 border-sky-300 text-sky-700'
                      : 'border-earth-200 text-earth-500 hover:border-earth-300'}`}>
                  {d}
                </button>
              ))}
            </div>
          </FormField>
          <FormField label="Description">
            <textarea className="input resize-none" rows={2} placeholder="Any quality requirements..." value={form.description} onChange={set('description')} />
          </FormField>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={() => setModal(false)} className="btn-secondary flex-1">Cancel</button>
            <button type="submit" disabled={submitting} className="btn-primary flex-1 flex items-center justify-center gap-2">
              {submitting ? <><Spinner size="sm"/>{editing ? 'Saving...' : 'Posting...'}</> : editing ? 'Save Changes' : 'Post Request'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
