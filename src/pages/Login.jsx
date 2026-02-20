import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'
import { Sprout, Eye, EyeOff } from 'lucide-react'
import { FormField, Spinner } from '../components/common/UI'

export default function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ email: '', password: '' })
  const [showPw, setShowPw] = useState(false)
  const [loading, setLoading] = useState(false)

  const set = (k) => (e) => setForm(p => ({ ...p, [k]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const user = await login(form.email, form.password)
      toast.success(`Welcome back, ${user.firstName}!`)
      if (user.role === 'farmer') navigate('/farmer')
      else if (user.role === 'buyer') navigate('/buyer')
      else if (user.role === 'admin') navigate('/admin')
      else navigate('/marketplace')
    } catch (err) {
      toast.error(err.response?.data?.message ?? 'Login failed. Check your credentials.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-earth-50 via-white to-leaf-50 flex">
      {/* Left panel */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-leaf-700 to-leaf-900 items-center justify-center p-12 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="absolute rounded-full bg-white"
              style={{ width: `${80 + i*40}px`, height: `${80 + i*40}px`,
                top: `${10 + i*15}%`, left: `${5 + i*10}%`, opacity: 0.3 - i*0.04 }} />
          ))}
        </div>
        <div className="relative text-white text-center">
          <div className="w-20 h-20 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-6 backdrop-blur-sm">
            <Sprout className="w-10 h-10 text-white" />
          </div>
          <h1 className="font-display font-800 text-4xl mb-3 leading-tight">
            From farm to<br />institution
          </h1>
          <p className="text-leaf-200 text-lg leading-relaxed max-w-sm">
            No middleman, no hunger. Connect directly with buyers and farmers across Malawi.
          </p>
          <div className="mt-10 grid grid-cols-3 gap-4 text-center">
            {[['500+', 'Farmers'], ['200+', 'Buyers'], ['1M+ kg', 'Traded']].map(([v, l]) => (
              <div key={l} className="bg-white/10 rounded-xl p-3 backdrop-blur-sm">
                <p className="font-display font-800 text-2xl text-white">{v}</p>
                <p className="text-leaf-300 text-xs">{l}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          <div className="flex items-center gap-2 mb-8 lg:hidden">
            <div className="w-8 h-8 bg-gradient-to-br from-leaf-500 to-leaf-700 rounded-lg flex items-center justify-center">
              <Sprout className="w-4 h-4 text-white" />
            </div>
            <span className="font-display font-800 text-xl">Farm<span className="text-leaf-600">Safe</span></span>
          </div>

          <h2 className="font-display font-800 text-3xl text-earth-900 mb-1">Welcome back</h2>
          <p className="text-earth-400 mb-8">Sign in to your FarmSafe account</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <FormField label="Email address" required>
              <input type="email" className="input" placeholder="you@example.com"
                value={form.email} onChange={set('email')} required />
            </FormField>

            <FormField label="Password" required>
              <div className="relative">
                <input type={showPw ? 'text' : 'password'} className="input pr-10"
                  placeholder="Your password" value={form.password} onChange={set('password')} required />
                <button type="button" onClick={() => setShowPw(!showPw)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-earth-400 hover:text-earth-600">
                  {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </FormField>

            <button type="submit" disabled={loading} className="btn-primary w-full flex items-center justify-center gap-2 py-3">
              {loading ? <><Spinner size="sm" /> Signing in...</> : 'Sign in'}
            </button>
          </form>

          <p className="text-center text-earth-400 text-sm mt-6">
            Don't have an account?{' '}
            <Link to="/register" className="text-leaf-600 font-semibold hover:underline">Create one</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
