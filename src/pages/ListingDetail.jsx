import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import Navbar from '../components/common/Navbar'
import { listingsApi, dealsApi, messagesApi } from '../api/services'
import { useAuth } from '../context/AuthContext'
import { PageLoader, Badge, Modal, FormField, Spinner } from '../components/common/UI'
import toast from 'react-hot-toast'
import { MapPin, Package, Calendar, ArrowLeft, GitMerge, MessageSquare } from 'lucide-react'

export default function ListingDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [listing, setListing] = useState(null)
  const [loading, setLoading] = useState(true)
  const [dealModal, setDealModal] = useState(false)
  const [msgModal, setMsgModal] = useState(false)
  const [msgText, setMsgText] = useState('')
  const [msgSending, setMsgSending] = useState(false)
  const [dealForm, setDealForm] = useState({ quantity: '', agreedPrice: '', deliveryDate: '', deliveryLocation: '' })
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    listingsApi.getOne(id)
      .then(r => { setListing(r.data); setDealForm(p => ({ ...p, agreedPrice: r.data.pricePerUnit })) })
      .catch(() => toast.error('Listing not found'))
      .finally(() => setLoading(false))
  }, [id])

  const handleMessage = async (e) => {
    e.preventDefault()
    if (!msgText.trim()) return
    setMsgSending(true)
    try {
      await messagesApi.send({ receiverId: listing.farmerId, content: msgText.trim() })
      toast.success('Message sent! Check your Messages page.')
      setMsgModal(false)
      setMsgText('')
    } catch (err) {
      toast.error(err.response?.data?.message ?? 'Failed to send message')
    } finally {
      setMsgSending(false)
    }
  }

  const handleDeal = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      const payload = {
        listingId: id,
        farmerId: listing.farmerId,
        buyerId: user.id,
        unit: listing.unit || listing.crop?.unitOfMeasure || 'kg',
        quantity: Number(dealForm.quantity),
        agreedPrice: Number(dealForm.agreedPrice),
        ...(dealForm.deliveryDate ? { deliveryDate: dealForm.deliveryDate } : {}),
        ...(dealForm.deliveryLocation ? { deliveryLocation: dealForm.deliveryLocation } : {}),
      }
      await dealsApi.create(payload)
      toast.success('Deal created! Check your deals dashboard.')
      setDealModal(false)
    } catch (err) {
      const msg = err.response?.data?.message
      toast.error(Array.isArray(msg) ? msg.join(', ') : msg ?? 'Failed to create deal')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) return <PageLoader />
  if (!listing) return null

  return (
    <div className="min-h-screen bg-earth-50">
      <Navbar />
      <div className="max-w-4xl mx-auto px-4 py-8">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-earth-400 hover:text-earth-700 mb-6 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to Marketplace
        </button>

        <div className="grid md:grid-cols-3 gap-6">
          {/* Main info */}
          <div className="md:col-span-2 space-y-4">
            <div className="card p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h1 className="font-display font-800 text-2xl text-earth-900">{listing.crop?.name}</h1>
                  <p className="text-earth-400 text-sm">{listing.crop?.category} · {listing.crop?.localName}</p>
                </div>
                <Badge status={listing.status ?? 'available'} />
              </div>

              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="bg-earth-50 rounded-xl p-3">
                  <p className="text-earth-400 text-xs mb-1">Location</p>
                  <div className="flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-earth-400" />
                    <p className="font-semibold text-earth-800 text-sm">{listing.district}</p>
                  </div>
                </div>
                <div className="bg-earth-50 rounded-xl p-3">
                  <p className="text-earth-400 text-xs mb-1">Quantity</p>
                  <div className="flex items-center gap-1.5">
                    <Package className="w-3.5 h-3.5 text-earth-400" />
                    <p className="font-semibold text-earth-800 text-sm">{listing.quantity} {listing.crop?.unitOfMeasure}</p>
                  </div>
                </div>
                {listing.harvestDate && (
                  <div className="bg-earth-50 rounded-xl p-3">
                    <p className="text-earth-400 text-xs mb-1">Harvest Date</p>
                    <p className="font-semibold text-earth-800 text-sm">{new Date(listing.harvestDate).toLocaleDateString()}</p>
                  </div>
                )}
              </div>

              {listing.description && (
                <p className="text-earth-600 text-sm leading-relaxed">{listing.description}</p>
              )}
            </div>
          </div>

          {/* Pricing & action */}
          <div className="space-y-4">
            <div className="card p-5">
              <p className="text-earth-400 text-sm mb-1">Price per {listing.crop?.unitOfMeasure}</p>
              <p className="font-display font-800 text-3xl text-leaf-700 mb-4">
                MK {listing.pricePerUnit?.toLocaleString()}
              </p>
              <p className="text-earth-400 text-xs mb-4">
                Total value: MK {(listing.pricePerUnit * listing.quantity)?.toLocaleString()}
              </p>

              {user?.role === 'buyer' ? (
                <div className="space-y-2">
                  <button onClick={() => setDealModal(true)} className="btn-primary w-full flex items-center justify-center gap-2">
                    <GitMerge className="w-4 h-4" /> Make a Deal
                  </button>
                  <button onClick={() => setMsgModal(true)} className="btn-outline w-full flex items-center justify-center gap-2">
                    <MessageSquare className="w-4 h-4" /> Message Farmer
                  </button>
                </div>
              ) : !user ? (
                <button onClick={() => navigate('/login')} className="btn-outline w-full">
                  Login to Buy
                </button>
              ) : null}
            </div>
          </div>
        </div>
      </div>

      {/* Message modal */}
      <Modal open={msgModal} onClose={() => setMsgModal(false)} title="Message Farmer">
        <form onSubmit={handleMessage} className="space-y-4">
          <p className="text-sm text-earth-500">Send a message to the farmer about this listing.</p>
          <FormField label="Your Message" required>
            <textarea className="input min-h-[100px]" placeholder="Hi, I'm interested in your listing..."
              value={msgText} onChange={e => setMsgText(e.target.value)} required />
          </FormField>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={() => setMsgModal(false)} className="btn-secondary flex-1">Cancel</button>
            <button type="submit" disabled={msgSending} className="btn-primary flex-1 flex items-center justify-center gap-2">
              {msgSending ? <><Spinner size="sm" /> Sending...</> : <><MessageSquare className="w-4 h-4" /> Send</>}
            </button>
          </div>
        </form>
      </Modal>

      {/* Deal modal */}
      <Modal open={dealModal} onClose={() => setDealModal(false)} title="Create a Deal">
        <form onSubmit={handleDeal} className="space-y-4">
          <FormField label="Quantity (kg)" required>
            <input type="number" className="input" placeholder="How many kg?" min="1" max={listing.quantity}
              value={dealForm.quantity} onChange={e => setDealForm(p => ({ ...p, quantity: e.target.value }))} required />
          </FormField>
          <FormField label="Agreed Price per kg (MK)" required>
            <input type="number" className="input" value={dealForm.agreedPrice}
              onChange={e => setDealForm(p => ({ ...p, agreedPrice: e.target.value }))} required />
          </FormField>
          <FormField label="Delivery Date" required>
            <input type="date" className="input" value={dealForm.deliveryDate}
              onChange={e => setDealForm(p => ({ ...p, deliveryDate: e.target.value }))} required />
          </FormField>
          <FormField label="Delivery Location" required>
            <input className="input" placeholder="e.g. Lilongwe Central Market" value={dealForm.deliveryLocation}
              onChange={e => setDealForm(p => ({ ...p, deliveryLocation: e.target.value }))} required />
          </FormField>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={() => setDealModal(false)} className="btn-secondary flex-1">Cancel</button>
            <button type="submit" disabled={submitting} className="btn-primary flex-1 flex items-center justify-center gap-2">
              {submitting ? <><Spinner size="sm" /> Creating...</> : 'Confirm Deal'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
