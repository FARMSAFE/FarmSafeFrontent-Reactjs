import { useState } from 'react'
import { MapPin, Package, TrendingUp, Calendar, GitMerge, MessageSquare } from 'lucide-react'
import { Badge, Modal, FormField, Spinner } from './UI'
import { dealsApi, messagesApi } from '../../api/services'
import { useAuth } from '../../context/AuthContext'
import toast from 'react-hot-toast'

export function ListingCard({ listing, onClick }) {
  const price = listing.pricePerUnit?.toLocaleString?.() ?? listing.pricePerUnit
  return (
    <div onClick={onClick} className="card p-5 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 cursor-pointer group">
      <div className="flex items-start justify-between mb-3">
        <div>
          <h3 className="font-display font-700 text-earth-900 group-hover:text-leaf-700 transition-colors">
            {listing.crop?.name ?? 'Crop'}
          </h3>
          <p className="text-earth-400 text-xs mt-0.5">{listing.crop?.category}</p>
        </div>
        <Badge status={listing.status ?? 'available'} />
      </div>
      <div className="space-y-2 mb-4">
        <div className="flex items-center gap-1.5 text-sm text-earth-600">
          <MapPin className="w-3.5 h-3.5 text-earth-400" />
          {listing.district}
        </div>
        <div className="flex items-center gap-1.5 text-sm text-earth-600">
          <Package className="w-3.5 h-3.5 text-earth-400" />
          {listing.quantity} {listing.crop?.unitOfMeasure ?? 'kg'} available
        </div>
        {listing.harvestDate && (
          <div className="flex items-center gap-1.5 text-sm text-earth-600">
            <Calendar className="w-3.5 h-3.5 text-earth-400" />
            Harvested {new Date(listing.harvestDate).toLocaleDateString()}
          </div>
        )}
      </div>
      <div className="flex items-center justify-between pt-3 border-t border-earth-100">
        <div>
          <span className="font-display font-800 text-xl text-leaf-700">MK {price}</span>
          <span className="text-earth-400 text-xs">/{listing.crop?.unitOfMeasure ?? 'kg'}</span>
        </div>
      </div>
    </div>
  )
}

export function ProcurementCard({ request, farmerView = false }) {
  const { user } = useAuth()
  const [modal, setModal] = useState(false)
  const [msgModal, setMsgModal] = useState(false)
  const [msgText, setMsgText] = useState('')
  const [msgSending, setMsgSending] = useState(false)
  const [form, setForm] = useState({ quantity: '', agreedPrice: request.maxPricePerUnit ?? '', deliveryLocation: '' })
  const [submitting, setSubmitting] = useState(false)

  const price = request.maxPricePerUnit?.toLocaleString?.() ?? request.maxPricePerUnit

  const handleDeal = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      await dealsApi.create({
        procurementRequestId: request.id,
        buyerId: request.buyerId,
        farmerId: user.id,
        unit: request.unit ?? request.crop?.unitOfMeasure ?? 'kg',
        quantity: Number(form.quantity),
        agreedPrice: Number(form.agreedPrice),
        ...(form.deliveryLocation ? { deliveryLocation: form.deliveryLocation } : {}),
      })
      toast.success('Deal offer sent to buyer!')
      setModal(false)
    } catch (err) {
      const msg = err.response?.data?.message
      toast.error(Array.isArray(msg) ? msg.join(', ') : msg ?? 'Failed to create deal')
    } finally {
      setSubmitting(false)
    }
  }

  const handleMessage = async (e) => {
    e.preventDefault()
    if (!msgText.trim()) return
    setMsgSending(true)
    try {
      await messagesApi.send({ receiverId: request.buyerId, content: msgText.trim() })
      toast.success('Message sent to buyer!')
      setMsgModal(false)
      setMsgText('')
    } catch (err) {
      toast.error(err.response?.data?.message ?? 'Failed to send message')
    } finally {
      setMsgSending(false)
    }
  }

  return (
    <>
      <div className="card p-5 hover:shadow-md transition-all duration-200">
        <div className="flex items-start justify-between mb-3">
          <div>
            <h3 className="font-display font-700 text-earth-900">{request.crop?.name ?? 'Crop'}</h3>
            <p className="text-earth-400 text-xs mt-0.5">{request.crop?.category}</p>
          </div>
          <Badge status={request.status ?? 'open'} />
        </div>
        <div className="space-y-2 mb-4">
          <div className="flex items-center gap-1.5 text-sm text-earth-600">
            <Package className="w-3.5 h-3.5 text-earth-400" />
            {request.quantityNeeded} {request.unit ?? request.crop?.unitOfMeasure ?? 'kg'} needed
          </div>
          <div className="flex items-center gap-1.5 text-sm text-earth-600">
            <TrendingUp className="w-3.5 h-3.5 text-earth-400" />
            Max price: MK {price}/{request.unit ?? request.crop?.unitOfMeasure ?? 'kg'}
          </div>
          {(request.deliveryDeadline || request.deliveryDate) && (
            <div className="flex items-center gap-1.5 text-sm text-earth-600">
              <Calendar className="w-3.5 h-3.5 text-earth-400" />
              Needed by {new Date(request.deliveryDeadline ?? request.deliveryDate).toLocaleDateString()}
            </div>
          )}
          {request.description && (
            <p className="text-xs text-earth-500 italic">"{request.description}"</p>
          )}
        </div>
        {request.preferredDistricts?.length > 0 && (
          <div className="flex gap-1.5 flex-wrap mb-3">
            {request.preferredDistricts.map(d => (
              <span key={d} className="text-xs bg-earth-100 text-earth-600 px-2 py-0.5 rounded-full">{d}</span>
            ))}
          </div>
        )}
        {/* Show respond buttons for farmers */}
        {(farmerView || user?.role === 'farmer') && request.status === 'open' && (
          <div className="flex gap-2 mt-2">
            <button onClick={() => setModal(true)}
              className="flex-1 btn-primary flex items-center justify-center gap-2 text-sm py-2">
              <GitMerge className="w-4 h-4" /> Make Deal
            </button>
            <button onClick={() => setMsgModal(true)}
              className="flex-1 btn-outline flex items-center justify-center gap-2 text-sm py-2">
              <MessageSquare className="w-4 h-4" /> Message
            </button>
          </div>
        )}
      </div>

      {/* Message modal */}
      <Modal open={msgModal} onClose={() => setMsgModal(false)} title="Message Buyer">
        <div className="mb-4 p-3 bg-sky-50 rounded-lg text-sm text-sky-700">
          Asking about: <strong>{request.quantityNeeded} {request.unit ?? 'kg'} of {request.crop?.name}</strong>
        </div>
        <form onSubmit={handleMessage} className="space-y-4">
          <FormField label="Your Message" required>
            <textarea className="input min-h-[100px]" placeholder="Hi, I can supply what you need..."
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
      <Modal open={modal} onClose={() => setModal(false)} title="Respond to Procurement Request">
        <div className="mb-4 p-3 bg-sky-50 rounded-lg text-sm text-sky-700">
          <p>Buyer needs <strong>{request.quantityNeeded} {request.unit ?? 'kg'}</strong> of <strong>{request.crop?.name}</strong></p>
          <p>Max price: <strong>MK {price}/{request.unit ?? 'kg'}</strong></p>
        </div>
        <form onSubmit={handleDeal} className="space-y-4">
          <FormField label="Quantity you can supply" required>
            <input type="number" className="input" placeholder={`Max ${request.quantityNeeded}`}
              max={request.quantityNeeded} value={form.quantity}
              onChange={e => setForm(p => ({ ...p, quantity: e.target.value }))} required />
          </FormField>
          <FormField label="Your price per unit (MK)" required>
            <input type="number" className="input" placeholder={`Max ${request.maxPricePerUnit}`}
              value={form.agreedPrice}
              onChange={e => setForm(p => ({ ...p, agreedPrice: e.target.value }))} required />
            <p className="text-xs text-earth-400 mt-1">Buyer's max is MK {price}</p>
          </FormField>
          <FormField label="Delivery Location">
            <input className="input" placeholder="Where can you deliver to?"
              value={form.deliveryLocation}
              onChange={e => setForm(p => ({ ...p, deliveryLocation: e.target.value }))} />
          </FormField>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={() => setModal(false)} className="btn-secondary flex-1">Cancel</button>
            <button type="submit" disabled={submitting} className="btn-primary flex-1 flex items-center justify-center gap-2">
              {submitting ? <><Spinner size="sm" /> Sending...</> : 'Send Deal Offer'}
            </button>
          </div>
        </form>
      </Modal>
    </>
  )
}

export function DealCard({ deal }) {
  return (
    <div className="card p-5 hover:shadow-md transition-all">
      <div className="flex items-start justify-between mb-3">
        <div>
          <p className="text-xs text-earth-400 font-mono">#{deal.id?.slice(0,8)}</p>
          <h3 className="font-display font-700 text-earth-900">
            {deal.listing?.crop?.name ?? deal.procurementRequest?.crop?.name ?? 'Deal'}
          </h3>
        </div>
        <Badge status={deal.status} />
      </div>
      <div className="grid grid-cols-2 gap-2 text-sm">
        <div>
          <p className="text-earth-400 text-xs">Quantity</p>
          <p className="font-semibold text-earth-800">{deal.quantity} {deal.unit ?? 'kg'}</p>
        </div>
        <div>
          <p className="text-earth-400 text-xs">Price/unit</p>
          <p className="font-semibold text-earth-800">MK {deal.agreedPrice}</p>
        </div>
        <div>
          <p className="text-earth-400 text-xs">Total</p>
          <p className="font-semibold text-leaf-700">MK {Number(deal.totalAmount)?.toLocaleString()}</p>
        </div>
        <div>
          <p className="text-earth-400 text-xs">Delivery</p>
          <p className="font-semibold text-earth-800">{deal.deliveryLocation ?? '—'}</p>
        </div>
      </div>
    </div>
  )
}
