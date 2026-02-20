import { useState } from 'react'
import Navbar from '../components/common/Navbar'
import { useAuth } from '../context/AuthContext'
import { usersApi } from '../api/services'
import { FormField, Spinner } from '../components/common/UI'
import toast from 'react-hot-toast'
import { User, Mail, Phone, Shield } from 'lucide-react'

export default function Profile() {
  const { user, updateUser } = useAuth()
  const [form, setForm] = useState({ firstName: user?.firstName ?? '', lastName: user?.lastName ?? '', phoneNumber: user?.phoneNumber ?? '' })
  const [saving, setSaving] = useState(false)

  const set = k => e => setForm(p => ({ ...p, [k]: e.target.value }))

  const handleSave = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      const res = await usersApi.update(user.id, form)
      updateUser(res.data)
      toast.success('Profile updated!')
    } catch { toast.error('Failed to update profile') }
    finally { setSaving(false) }
  }

  return (
    <div className="min-h-screen bg-earth-50">
      <Navbar />
      <div className="max-w-2xl mx-auto px-4 py-10">
        <h1 className="font-display font-800 text-3xl text-earth-900 mb-6">My Profile</h1>

        <div className="card p-6 mb-4">
          {/* Avatar */}
          <div className="flex items-center gap-4 mb-6 pb-6 border-b border-earth-100">
            <div className="w-16 h-16 bg-gradient-to-br from-leaf-400 to-leaf-700 rounded-2xl flex items-center justify-center text-white font-display font-800 text-2xl">
              {user?.firstName?.[0]}{user?.lastName?.[0]}
            </div>
            <div>
              <h2 className="font-display font-700 text-xl text-earth-900">{user?.firstName} {user?.lastName}</h2>
              <p className="text-earth-400 text-sm">{user?.email}</p>
              <span className={`text-xs font-semibold px-2.5 py-1 rounded-full mt-1 inline-block ${user?.role === 'farmer' ? 'badge-farmer' : user?.role === 'buyer' ? 'badge-buyer' : 'badge-admin'}`}>
                {user?.role}
              </span>
            </div>
          </div>

          {/* Info */}
          <div className="grid grid-cols-2 gap-3 mb-6">
            {[
              { icon: Mail, label: 'Email', value: user?.email },
              { icon: Shield, label: 'Email Verified', value: user?.isEmailVerified ? 'Yes ✓' : 'Not verified' },
              { icon: Phone, label: 'Phone', value: user?.phoneNumber || '—' },
              { icon: User, label: 'Status', value: user?.status },
            ].map(({ icon: Icon, label, value }) => (
              <div key={label} className="bg-earth-50 rounded-xl p-3">
                <div className="flex items-center gap-1.5 mb-1">
                  <Icon className="w-3.5 h-3.5 text-earth-400" />
                  <p className="text-earth-400 text-xs">{label}</p>
                </div>
                <p className="font-semibold text-earth-800 text-sm">{value}</p>
              </div>
            ))}
          </div>

          {/* Edit form */}
          <form onSubmit={handleSave} className="space-y-4">
            <h3 className="font-display font-700 text-earth-900">Edit Details</h3>
            <div className="grid grid-cols-2 gap-3">
              <FormField label="First Name"><input className="input" value={form.firstName} onChange={set('firstName')} /></FormField>
              <FormField label="Last Name"><input className="input" value={form.lastName} onChange={set('lastName')} /></FormField>
            </div>
            <FormField label="Phone Number"><input className="input" placeholder="+265..." value={form.phoneNumber} onChange={set('phoneNumber')} /></FormField>
            <button type="submit" disabled={saving} className="btn-primary flex items-center gap-2">
              {saving ? <><Spinner size="sm"/>Saving...</> : 'Save Changes'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
