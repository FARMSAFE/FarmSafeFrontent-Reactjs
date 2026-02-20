import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { AuthProvider, useAuth } from './context/AuthContext'

import Login from './pages/Login'
import Register from './pages/Register'
import Marketplace from './pages/Marketplace'
import ListingDetail from './pages/ListingDetail'
import FarmerDashboard from './pages/FarmerDashboard'
import BuyerDashboard from './pages/BuyerDashboard'
import AdminDashboard from './pages/AdminDashboard'
import Messages from './pages/Messages'
import Profile from './pages/Profile'
import Climate from './pages/Climate'
import NotFound from './pages/NotFound'

function PrivateRoute({ children, roles }) {
  const { user, loading } = useAuth()
  if (loading) return (
    <div className="min-h-screen bg-earth-50 flex items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <div className="w-10 h-10 border-4 border-leaf-200 border-t-leaf-600 rounded-full animate-spin" />
        <p className="text-earth-500 font-body text-sm">Loading FarmSafe...</p>
      </div>
    </div>
  )
  if (!user) return <Navigate to="/login" replace />
  if (roles && !roles.includes(user.role)) return <Navigate to="/" replace />
  return children
}

function RoleRedirect() {
  const { user, loading } = useAuth()
  if (loading) return null
  if (!user) return <Navigate to="/marketplace" replace />
  if (user.role === 'farmer') return <Navigate to="/farmer" replace />
  if (user.role === 'buyer') return <Navigate to="/buyer" replace />
  if (user.role === 'admin') return <Navigate to="/admin" replace />
  return <Navigate to="/marketplace" replace />
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              fontFamily: 'Satoshi, sans-serif',
              borderRadius: '12px',
              background: '#3d2a1a',
              color: '#f7f3ee',
            },
            success: { iconTheme: { primary: '#2d8f2a', secondary: '#f0f9f0' } },
            error:   { iconTheme: { primary: '#ef4444', secondary: '#fef2f2' } },
          }}
        />
        <Routes>
          <Route path="/" element={<RoleRedirect />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/marketplace" element={<Marketplace />} />
          <Route path="/listings/:id" element={<ListingDetail />} />
          <Route path="/climate" element={<Climate />} />
          <Route path="/farmer" element={
            <PrivateRoute roles={['farmer']}><FarmerDashboard /></PrivateRoute>
          } />
          <Route path="/buyer" element={
            <PrivateRoute roles={['buyer']}><BuyerDashboard /></PrivateRoute>
          } />
          <Route path="/admin" element={
            <PrivateRoute roles={['admin']}><AdminDashboard /></PrivateRoute>
          } />
          <Route path="/messages" element={
            <PrivateRoute><Messages /></PrivateRoute>
          } />
          <Route path="/profile" element={
            <PrivateRoute><Profile /></PrivateRoute>
          } />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}
