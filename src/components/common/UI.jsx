import { Loader2 } from 'lucide-react'

export function Spinner({ size = 'md', className = '' }) {
  const sizes = { sm: 'w-4 h-4', md: 'w-6 h-6', lg: 'w-10 h-10' }
  return <Loader2 className={`animate-spin text-leaf-600 ${sizes[size]} ${className}`} />
}

export function PageLoader() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-earth-50">
      <div className="flex flex-col items-center gap-3">
        <Spinner size="lg" />
        <p className="text-earth-400 text-sm">Loading...</p>
      </div>
    </div>
  )
}

export function EmptyState({ icon: Icon, title, description, action }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="w-16 h-16 bg-earth-100 rounded-2xl flex items-center justify-center mb-4">
        {Icon && <Icon className="w-8 h-8 text-earth-400" />}
      </div>
      <h3 className="font-display font-700 text-lg text-earth-800 mb-1">{title}</h3>
      <p className="text-earth-400 text-sm max-w-xs mb-4">{description}</p>
      {action}
    </div>
  )
}

export function StatCard({ label, value, icon: Icon, color = 'leaf', sub }) {
  const colors = {
    leaf:  { bg: 'bg-leaf-50',  icon: 'bg-leaf-100',  text: 'text-leaf-600' },
    sky:   { bg: 'bg-sky-50',   icon: 'bg-sky-100',   text: 'text-sky-600' },
    earth: { bg: 'bg-earth-50', icon: 'bg-earth-100', text: 'text-earth-600' },
    amber: { bg: 'bg-amber-50', icon: 'bg-amber-100', text: 'text-amber-600' },
  }
  const c = colors[color]
  return (
    <div className={`card p-5 ${c.bg}`}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-earth-500 text-sm font-medium mb-1">{label}</p>
          <p className="font-display font-800 text-2xl text-earth-900">{value}</p>
          {sub && <p className="text-earth-400 text-xs mt-1">{sub}</p>}
        </div>
        {Icon && (
          <div className={`w-10 h-10 ${c.icon} rounded-xl flex items-center justify-center`}>
            <Icon className={`w-5 h-5 ${c.text}`} />
          </div>
        )}
      </div>
    </div>
  )
}

export function SectionHeader({ title, description, action }) {
  return (
    <div className="flex items-start justify-between mb-6">
      <div>
        <h2 className="font-display font-700 text-xl text-earth-900">{title}</h2>
        {description && <p className="text-earth-400 text-sm mt-0.5">{description}</p>}
      </div>
      {action}
    </div>
  )
}

export function Badge({ status }) {
  const map = {
    active:    'bg-leaf-100 text-leaf-700',
    inactive:  'bg-earth-100 text-earth-500',
    open:      'bg-sky-100 text-sky-700',
    closed:    'bg-earth-100 text-earth-500',
    pending:   'bg-amber-100 text-amber-700',
    confirmed: 'bg-leaf-100 text-leaf-700',
    completed: 'bg-leaf-200 text-leaf-800',
    cancelled: 'bg-red-100 text-red-600',
    available: 'bg-leaf-100 text-leaf-700',
    sold:      'bg-earth-100 text-earth-500',
  }
  return (
    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${map[status] || 'bg-earth-100 text-earth-500'}`}>
      {status}
    </span>
  )
}

export function Modal({ open, onClose, title, children }) {
  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-earth-900/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto animate-fade-up">
        <div className="flex items-center justify-between p-6 border-b border-earth-100">
          <h3 className="font-display font-700 text-lg text-earth-900">{title}</h3>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-earth-100 text-earth-400 hover:text-earth-600">✕</button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  )
}

export function FormField({ label, error, children, required }) {
  return (
    <div className="space-y-1.5">
      <label className="text-sm font-semibold text-earth-700">
        {label}{required && <span className="text-red-400 ml-0.5">*</span>}
      </label>
      {children}
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  )
}
