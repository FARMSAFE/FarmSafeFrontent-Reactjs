import { useState, useEffect } from 'react'
import Navbar from '../components/common/Navbar'
import { listingsApi, dealsApi, analyticsApi, cropsApi } from '../api/services'
import { useAuth } from '../context/AuthContext'
import { StatCard, SectionHeader, EmptyState, Modal, FormField, Spinner, Badge } from '../components/common/UI'
import { DealCard } from '../components/common/Cards'
import toast from 'react-hot-toast'
import { Package, TrendingUp, GitMerge, Plus, Pencil, Trash2, ShoppingBag } from 'lucide-react'

const DISTRICTS = ['Lilongwe','Blantyre','Mzuzu','Zomba','Kasungu','Mangochi','Salima','Dedza','Ntcheu','Balaka']

const emptyListing = { cropId:'', pricePerUnit:'', quantity:'', district:'', description:'', harvestDate:'', unit:'' }

export default function FarmerDashboard() {
  const { user } = useAuth()
  const [listings, setListings] = useState([])
  const [deals, setDeals] = useState([])
  const [crops, setCrops] = useState([])
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(emptyListing)
  const [submitting, setSubmitting] = useState(false)

  const load = () => {
    Promise.all([
      listingsApi.getMine(),
      dealsApi.getMine(),
      cropsApi.getAll(),
      analyticsApi.getMyActivity(),
    ]).then(([l, d, c, a]) => {
      setListings(l.data)
      setDeals(d.data)
      setCrops(c.data)
      setStats(a.data)
    }).catch(console.error)
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  const set = k => e => setForm(p => ({ ...p, [k]: e.target.value }))

  const openCreate = () => { setEditing(null); setForm(emptyListing); setModal(true) }
  const openEdit = (l) => {
    setEditing(l)
    setForm({
      cropId: l.cropId,
      pricePerUnit: l.pricePerUnit,
      quantity: l.quantity,
      district: l.district,
      description: l.description ?? '',
      harvestDate: l.harvestDate?.slice(0,10) ?? '',
      unit: l.crop?.unitOfMeasure ?? '',
    })
    setModal(true)
  }

  // When crop changes, auto-set the unit from that crop
  const handleCropChange = (e) => {
    const cropId = e.target.value
    const selectedCrop = crops.find(c => c.id === cropId)
    setForm(p => ({ ...p, cropId, unit: selectedCrop?.unitOfMeasure ?? '' }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      // Only send fields the backend DTO expects — no extra fields
      const payload = {
        cropId: form.cropId,
        unit: form.unit,
        pricePerUnit: Number(form.pricePerUnit),
        quantity: Number(form.quantity),
        district: form.district,
        ...(form.description ? { description: form.description } : {}),
        ...(form.harvestDate ? { harvestDate: form.harvestDate } : {}),
      }
      if (editing) {
        await listingsApi.update(editing.id, payload)
        toast.success('Listing updated!')
      } else {
        await listingsApi.create(payload)
        toast.success('Listing created!')
      }
      setModal(false); load()
    } catch (err) {
      const msg = err.response?.data?.message
      toast.error(Array.isArray(msg) ? msg.join(', ') : msg ?? 'Something went wrong')
    } finally { setSubmitting(false) }
  }

  const handleDelete = async (id) => {
    if (!confirm('Remove this listing?')) return
    try {
      await listingsApi.remove(id)
      toast.success('Listing removed')
      load()
    } catch { toast.error('Failed to remove') }
  }

  const updateDealStatus = async (dealId, status) => {
    try {
      await dealsApi.updateStatus(dealId, status)
      toast.success(`Deal ${status}`)
      load()
    } catch (err) {
      const msg = err.response?.data?.message
      toast.error(Array.isArray(msg) ? msg.join(', ') : msg ?? 'Failed to update deal')
      console.error('Deal status error:', err.response?.data)
    }
  }

  return (
    <div className="min-h-screen bg-earth-50">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="font-display font-800 text-3xl text-earth-900">
            Good day, {user?.firstName}! 🌱
          </h1>
          <p className="text-earth-400 mt-1">Manage your listings and track your deals</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard label="My Listings" value={listings.length} icon={Package} color="leaf" />
          <StatCard label="Active Listings" value={listings.filter(l=>l.isActive).length} icon={ShoppingBag} color="leaf" />
          <StatCard label="Total Deals" value={deals.length} icon={GitMerge} color="sky" />
          <StatCard label="Completed" value={deals.filter(d=>d.status==='completed').length} icon={TrendingUp} color="earth" />
        </div>

        {/* Listings */}
        <div className="card p-6 mb-6">
          <SectionHeader title="My Listings" description="Crops you're selling"
            action={<button onClick={openCreate} className="btn-primary flex items-center gap-2 text-sm py-2"><Plus className="w-4 h-4"/>Add Listing</button>} />

          {listings.length === 0 ? (
            <EmptyState icon={Package} title="No listings yet"
              description="Create your first listing to start selling"
              action={<button onClick={openCreate} className="btn-primary">Create Listing</button>} />
          ) : (
            <div className="space-y-3">
              {listings.map(l => (
                <div key={l.id} className="flex items-center justify-between p-4 bg-earth-50 rounded-xl hover:bg-earth-100 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-leaf-100 rounded-xl flex items-center justify-center">
                      <Package className="w-5 h-5 text-leaf-600" />
                    </div>
                    <div>
                      <p className="font-semibold text-earth-900">{l.crop?.name}</p>
                      <p className="text-earth-400 text-xs">{l.district} · {l.quantity} {l.crop?.unitOfMeasure} · MK {l.pricePerUnit?.toLocaleString()}/kg</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge status={l.isActive ? 'active' : 'inactive'} />
                    <button onClick={() => openEdit(l)} className="p-1.5 text-earth-400 hover:text-leaf-600 transition-colors"><Pencil className="w-4 h-4"/></button>
                    <button onClick={() => handleDelete(l.id)} className="p-1.5 text-earth-400 hover:text-red-500 transition-colors"><Trash2 className="w-4 h-4"/></button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Deals */}
        <div className="card p-6">
          <SectionHeader title="My Deals" description="Transactions involving your listings" />
          {deals.length === 0 ? (
            <EmptyState icon={GitMerge} title="No deals yet" description="Deals will appear here when buyers engage with your listings" />
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {deals.map(d => (
                <div key={d.id}>
                  <DealCard deal={d} />
                  {d.status === 'pending' && d.farmerId === user?.id && (
                    <div className="flex gap-2 mt-2">
                      <button onClick={() => updateDealStatus(d.id, 'accepted')} className="btn-primary flex-1 text-sm py-1.5">Confirm</button>
                      <button onClick={() => updateDealStatus(d.id, 'cancelled')} className="btn-danger flex-1 text-sm py-1.5">Decline</button>
                    </div>
                  )}
                  {d.status === 'accepted' && (
                    <button onClick={() => updateDealStatus(d.id, 'in_progress')} className="btn-primary w-full text-sm py-1.5 mt-2">Mark In Progress</button>
                  )}
                  {d.status === 'in_progress' && d.farmerId === user?.id && (
                    <button onClick={() => updateDealStatus(d.id, 'completed')} className="btn-primary w-full text-sm py-1.5 mt-2">Mark Completed</button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Create/Edit modal */}
      <Modal open={modal} onClose={() => setModal(false)} title={editing ? 'Edit Listing' : 'New Listing'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <FormField label="Crop" required>
            <select className="input" value={form.cropId} onChange={handleCropChange} required>
              <option value="">Select a crop...</option>
              {crops.map(c => <option key={c.id} value={c.id}>{c.name} ({c.unitOfMeasure})</option>)}
            </select>
            {form.unit && <p className="text-xs text-earth-400 mt-1">Unit: <span className="font-semibold text-leaf-600">{form.unit}</span></p>}
          </FormField>
          <div className="grid grid-cols-2 gap-3">
            <FormField label="Price per kg (MK)" required>
              <input type="number" className="input" placeholder="500" value={form.pricePerUnit} onChange={set('pricePerUnit')} required />
            </FormField>
            <FormField label="Quantity (kg)" required>
              <input type="number" className="input" placeholder="200" value={form.quantity} onChange={set('quantity')} required />
            </FormField>
          </div>
          <FormField label="District" required>
            <select className="input" value={form.district} onChange={set('district')} required>
              <option value="">Select district...</option>
              {DISTRICTS.map(d => <option key={d} value={d}>{d}</option>)}
            </select>
          </FormField>
          <FormField label="Harvest Date">
            <input type="date" className="input" value={form.harvestDate} onChange={set('harvestDate')} />
          </FormField>
          <FormField label="Description">
            <textarea className="input resize-none" rows={3} placeholder="Describe your crop quality..." value={form.description} onChange={set('description')} />
          </FormField>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={() => setModal(false)} className="btn-secondary flex-1">Cancel</button>
            <button type="submit" disabled={submitting} className="btn-primary flex-1 flex items-center justify-center gap-2">
              {submitting ? <><Spinner size="sm"/>{editing ? 'Saving...' : 'Creating...'}</> : editing ? 'Save Changes' : 'Create Listing'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
