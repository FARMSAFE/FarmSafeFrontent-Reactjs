import { Link } from 'react-router-dom'
import { Sprout } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-earth-50 flex flex-col items-center justify-center text-center px-4">
      <div className="w-20 h-20 bg-leaf-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
        <Sprout className="w-10 h-10 text-leaf-500" />
      </div>
      <h1 className="font-display font-800 text-6xl text-earth-900 mb-2">404</h1>
      <p className="font-display font-700 text-xl text-earth-700 mb-2">Page not found</p>
      <p className="text-earth-400 mb-8 max-w-sm">Looks like this field is empty. The page you're looking for doesn't exist.</p>
      <Link to="/" className="btn-primary">Back to FarmSafe</Link>
    </div>
  )
}
