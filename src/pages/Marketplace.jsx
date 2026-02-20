import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Navbar from '../components/common/Navbar'
import { ListingCard, ProcurementCard } from '../components/common/Cards'
import { EmptyState, PageLoader } from '../components/common/UI'
import { listingsApi, procurementApi, cropsApi, alertsApi } from '../api/services'
import { Search, Filter, ShoppingBag, Bell, CloudRain } from 'lucide-react'

const DISTRICTS = ['Lilongwe','Blantyre','Mzuzu','Zomba','Kasungu','Mangochi','Salima','Dedza','Ntcheu','Balaka']

export default function Marketplace() {
  const navigate = useNavigate()
  const [tab, setTab] = useState('listings')
  const [listings, setListings] = useState([])
  const [procurement, setProcurement] = useState([])
  const [alerts, setAlerts] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [district, setDistrict] = useState('')
  const [crops, setCrops] = useState([])
  const [cropFilter, setCropFilter] = useState('')

  useEffect(() => {
    Promise.all([
      listingsApi.getAll({ district: district || undefined, cropId: cropFilter || undefined }),
      procurementApi.getAll({ district: district || undefined }),
      alertsApi.getAll(),
      cropsApi.getAll(),
    ]).then(([l, p, a, c]) => {
      setListings(l.data)
      setProcurement(p.data)
      setAlerts(a.data.slice(0, 3))
      setCrops(c.data)
    }).catch(console.error)
      .finally(() => setLoading(false))
  }, [district, cropFilter])

  const filtered = (tab === 'listings' ? listings : procurement)
    .filter(item => {
      if (!search) return true
      const name = tab === 'listings'
        ? item.crop?.name?.toLowerCase()
        : item.crop?.name?.toLowerCase()
      return name?.includes(search.toLowerCase())
    })

  if (loading) return <PageLoader />

  return (
    <div className="min-h-screen bg-earth-50">
      <Navbar />

      {/* Hero */}
      <div className="bg-gradient-to-r from-leaf-700 to-leaf-900 text-white py-12 px-4">
        <div className="max-w-7xl mx-auto">
          <h1 className="font-display font-800 text-4xl mb-2">Crop Marketplace</h1>
          <p className="text-leaf-200 text-lg mb-8">Connecting Malawi's farmers to the tables that need them most</p>

          {/* Search bar */}
          <div className="flex gap-3 flex-col sm:flex-row">
            <div className="relative flex-1 max-w-lg">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-earth-400" />
              <input className="w-full pl-10 pr-4 py-3 rounded-xl bg-white text-earth-900 placeholder-earth-300 focus:outline-none focus:ring-2 focus:ring-leaf-300"
                placeholder="Search crops..." value={search} onChange={e => setSearch(e.target.value)} />
            </div>
            <select className="px-4 py-3 rounded-xl bg-white text-earth-700 focus:outline-none focus:ring-2 focus:ring-leaf-300"
              value={district} onChange={e => setDistrict(e.target.value)}>
              <option value="">All districts</option>
              {DISTRICTS.map(d => <option key={d} value={d}>{d}</option>)}
            </select>
            <select className="px-4 py-3 rounded-xl bg-white text-earth-700 focus:outline-none focus:ring-2 focus:ring-leaf-300"
              value={cropFilter} onChange={e => setCropFilter(e.target.value)}>
              <option value="">All crops</option>
              {crops.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Alerts banner */}
        {alerts.length > 0 && (
          <div className="mb-6 space-y-2">
            {alerts.map(a => (
              <div key={a.id} className={`flex items-start gap-3 p-4 rounded-xl border ${
                a.severity === 'high' ? 'bg-red-50 border-red-200' :
                a.severity === 'medium' ? 'bg-amber-50 border-amber-200' :
                'bg-sky-50 border-sky-200'}`}>
                <Bell className={`w-4 h-4 mt-0.5 flex-shrink-0 ${
                  a.severity === 'high' ? 'text-red-500' :
                  a.severity === 'medium' ? 'text-amber-500' : 'text-sky-500'}`} />
                <div>
                  <p className="font-semibold text-sm text-earth-900">{a.title}</p>
                  <p className="text-xs text-earth-500 mt-0.5">{a.message}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-1 p-1 bg-white rounded-xl border border-earth-100 w-fit mb-6">
          {[['listings','Crop Listings'], ['procurement','Procurement Requests']].map(([key, label]) => (
            <button key={key} onClick={() => setTab(key)}
              className={`px-5 py-2 rounded-lg text-sm font-semibold transition-all ${
                tab === key ? 'bg-leaf-600 text-white shadow-sm' : 'text-earth-500 hover:text-earth-800'}`}>
              {label}
              <span className="ml-2 text-xs opacity-70">
                ({key === 'listings' ? listings.length : procurement.length})
              </span>
            </button>
          ))}
        </div>

        {/* Grid */}
        {filtered.length === 0 ? (
          <EmptyState icon={ShoppingBag} title="Nothing here yet"
            description={`No ${tab} match your filters.`} />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {tab === 'listings'
              ? filtered.map(l => (
                  <ListingCard key={l.id} listing={l} onClick={() => navigate(`/listings/${l.id}`)} />
                ))
              : filtered.map(p => <ProcurementCard key={p.id} request={p} />)
            }
          </div>
        )}
      </div>
    </div>
  )
}
