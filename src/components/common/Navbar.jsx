import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import toast from 'react-hot-toast'
import {
  Sprout, ShoppingBag, MessageSquare, User, LogOut,
  Menu, X, LayoutDashboard, Bell, ChevronDown
} from 'lucide-react'

export default function Navbar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)

  const handleLogout = async () => {
    await logout()
    toast.success('Logged out successfully')
    navigate('/login')
  }

  const dashboardPath = user?.role === 'farmer' ? '/farmer'
    : user?.role === 'buyer' ? '/buyer'
    : user?.role === 'admin' ? '/admin' : '/'

  const isActive = (path) => location.pathname === path

  return (
    <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-earth-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 bg-gradient-to-br from-leaf-500 to-leaf-700 rounded-lg flex items-center justify-center shadow-sm group-hover:shadow-md transition-shadow">
              <Sprout className="w-4 h-4 text-white" />
            </div>
            <span className="font-display font-800 text-xl text-earth-900 tracking-tight">
              Farm<span className="text-leaf-600">Safe</span>
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-1">
            <NavLink to="/marketplace" active={isActive('/marketplace')}>
              <ShoppingBag className="w-4 h-4" /> Marketplace
            </NavLink>
            <NavLink to="/climate" active={isActive('/climate')}>
              <Bell className="w-4 h-4" /> Weather
            </NavLink>
            {user && (
              <>
                <NavLink to={dashboardPath} active={isActive(dashboardPath)}>
                  <LayoutDashboard className="w-4 h-4" /> Dashboard
                </NavLink>
                <NavLink to="/messages" active={isActive('/messages')}>
                  <MessageSquare className="w-4 h-4" /> Messages
                </NavLink>
              </>
            )}
          </div>

          {/* Right side */}
          <div className="hidden md:flex items-center gap-3">
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-earth-50 transition-colors"
                >
                  <div className="w-8 h-8 bg-leaf-100 rounded-full flex items-center justify-center">
                    <span className="text-leaf-700 font-semibold text-sm">
                      {user.firstName?.[0]}{user.lastName?.[0]}
                    </span>
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-semibold text-earth-900 leading-none">{user.firstName}</p>
                    <span className={`text-xs ${user.role === 'farmer' ? 'badge-farmer' : user.role === 'buyer' ? 'badge-buyer' : 'badge-admin'}`}>
                      {user.role}
                    </span>
                  </div>
                  <ChevronDown className="w-4 h-4 text-earth-400" />
                </button>

                {userMenuOpen && (
                  <div className="absolute right-0 top-full mt-1 w-48 card shadow-lg py-1 animate-fade-in">
                    <Link to="/profile" onClick={() => setUserMenuOpen(false)}
                      className="flex items-center gap-2 px-4 py-2.5 text-sm text-earth-700 hover:bg-earth-50">
                      <User className="w-4 h-4" /> Profile
                    </Link>
                    <hr className="border-earth-100 my-1" />
                    <button onClick={handleLogout}
                      className="flex items-center gap-2 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 w-full text-left">
                      <LogOut className="w-4 h-4" /> Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link to="/login" className="btn-secondary text-sm py-2">Log in</Link>
                <Link to="/register" className="btn-primary text-sm py-2">Get Started</Link>
              </div>
            )}
          </div>

          {/* Mobile toggle */}
          <button onClick={() => setMobileOpen(!mobileOpen)} className="md:hidden p-2 rounded-lg hover:bg-earth-50">
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-earth-100 bg-white px-4 py-3 space-y-1 animate-fade-in">
          <MobileLink to="/marketplace" onClick={() => setMobileOpen(false)}>Marketplace</MobileLink>
          {user && (
            <>
              <MobileLink to={dashboardPath} onClick={() => setMobileOpen(false)}>Dashboard</MobileLink>
              <MobileLink to="/messages" onClick={() => setMobileOpen(false)}>Messages</MobileLink>
              <MobileLink to="/profile" onClick={() => setMobileOpen(false)}>Profile</MobileLink>
              <button onClick={handleLogout} className="w-full text-left px-3 py-2 text-red-600 font-medium rounded-lg hover:bg-red-50">
                Logout
              </button>
            </>
          )}
          {!user && (
            <div className="flex gap-2 pt-2">
              <Link to="/login" className="btn-secondary flex-1 text-center text-sm" onClick={() => setMobileOpen(false)}>Log in</Link>
              <Link to="/register" className="btn-primary flex-1 text-center text-sm" onClick={() => setMobileOpen(false)}>Register</Link>
            </div>
          )}
        </div>
      )}
    </nav>
  )
}

function NavLink({ to, active, children }) {
  return (
    <Link to={to}
      className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors
        ${active ? 'bg-leaf-50 text-leaf-700' : 'text-earth-600 hover:text-earth-900 hover:bg-earth-50'}`}>
      {children}
    </Link>
  )
}

function MobileLink({ to, onClick, children }) {
  return (
    <Link to={to} onClick={onClick}
      className="block px-3 py-2 text-earth-700 font-medium rounded-lg hover:bg-earth-50">
      {children}
    </Link>
  )
}
