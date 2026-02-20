import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { authApi } from '../api/services'
import toast from 'react-hot-toast'
import { Sprout, Eye, EyeOff } from 'lucide-react'
import { FormField, Spinner } from '../components/common/UI'

export default function Register() {
  const navigate = useNavigate()
  const [form, setForm] = useState({
    firstName: '', lastName: '', email: '', password: '',
    phoneNumber: '', role: 'farmer'
  })
  const [showPw, setShowPw] = useState(false)
  const [loading, setLoading] = useState(false)

  const set = (k) => (e) => setForm(p => ({ ...p, [k]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      await authApi.register(form)
      toast.success('Account created! Please verify your email before logging in.')
      navigate('/login')
    } catch (err) {
      toast.error(err.response?.data?.message ?? 'Registration failed.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-earth-50 via-white to-leaf-50 flex items-center justify-center p-6">
      <div className="w-full max-w-lg">
        <div className="flex items-center gap-2 mb-8">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-leaf-500 to-leaf-700 rounded-lg flex items-center justify-center">
              <Sprout className="w-4 h-4 text-white" />
            </div>
            <span className="font-display font-800 text-xl">Farm<span className="text-leaf-600">Safe</span></span>
          </Link>
        </div>

        <div className="card p-8 shadow-lg">
          <h2 className="font-display font-800 text-2xl text-earth-900 mb-1">Create your account</h2>
          <p className="text-earth-400 text-sm mb-6">Join FarmSafe and start trading today</p>

          {/* Role selector */}
          <div className="grid grid-cols-2 gap-3 mb-6">
            {['farmer', 'buyer'].map(role => (
              <button key={role} type="button" onClick={() => setForm(p => ({ ...p, role }))}
                className={`p-4 rounded-xl border-2 text-left transition-all ${
                  form.role === role
                    ? 'border-leaf-500 bg-leaf-50'
                    : 'border-earth-200 hover:border-earth-300'
                }`}>
                <p className="font-display font-700 capitalize text-earth-900">{role}</p>
                <p className="text-xs text-earth-400 mt-0.5">
                  {role === 'farmer' ? 'List and sell your crops' : 'Buy crops from farmers'}
                </p>
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <FormField label="First name" required>
                <input className="input" placeholder="John" value={form.firstName} onChange={set('firstName')} required />
              </FormField>
              <FormField label="Last name" required>
                <input className="input" placeholder="Doe" value={form.lastName} onChange={set('lastName')} required />
              </FormField>
            </div>

            <FormField label="Email address" required>
              <input type="email" className="input" placeholder="you@example.com"
                value={form.email} onChange={set('email')} required />
            </FormField>

            <FormField label="Phone number">
              <input className="input" placeholder="+265 999 000 111"
                value={form.phoneNumber} onChange={set('phoneNumber')} />
            </FormField>

            <FormField label="Password" required>
              <div className="relative">
                <input type={showPw ? 'text' : 'password'} className="input pr-10"
                  placeholder="Min. 8 characters" value={form.password} onChange={set('password')} required minLength={8} />
                <button type="button" onClick={() => setShowPw(!showPw)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-earth-400 hover:text-earth-600">
                  {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </FormField>

            <button type="submit" disabled={loading} className="btn-primary w-full flex items-center justify-center gap-2 py-3 mt-2">
              {loading ? <><Spinner size="sm" /> Creating account...</> : 'Create account'}
            </button>
          </form>

          <p className="text-center text-earth-400 text-sm mt-5">
            Already have an account?{' '}
            <Link to="/login" className="text-leaf-600 font-semibold hover:underline">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
