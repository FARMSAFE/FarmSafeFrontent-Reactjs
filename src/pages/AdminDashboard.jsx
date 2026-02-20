import { useState, useEffect } from 'react'
import Navbar from '../components/common/Navbar'
import { analyticsApi, usersApi, cropsApi, alertsApi, climateApi } from '../api/services'
import { StatCard, SectionHeader, EmptyState, Modal, FormField, Spinner, Badge } from '../components/common/UI'
import toast from 'react-hot-toast'
import { Users, Package, GitMerge, TrendingUp, Plus, Bell, CloudRain, ShoppingBag, Trash2 } from 'lucide-react'

const DISTRICTS = ['Lilongwe','Blantyre','Mzuzu','Zomba','Kasungu','Mangochi','Salima','Dedza','Ntcheu','Balaka']

export default function AdminDashboard() {
  const [stats, setStats] = useState(null)
  const [users, setUsers] = useState([])
  const [trends, setTrends] = useState([])
  const [districts, setDistricts] = useState([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState('overview')

  // Modals
  const [cropModal, setCropModal] = useState(false)
  const [alertModal, setAlertModal] = useState(false)
  const [climateModal, setClimateModal] = useState(false)
  const [cropForm, setCropForm] = useState({ name:'', localName:'', category:'cereals', unitOfMeasure:'kg', description:'', growthPeriodDays:'' })
  const [alertForm, setAlertForm] = useState({ title:'', message:'', type:'weather', severity:'medium', affectedDistricts:[], expiresAt:'' })
  const [climateForm, setClimateForm] = useState({ district:'', date:'', temperatureMin:'', temperatureMax:'', rainfall:'', humidity:'', windSpeed:'', condition:'', recommendation:'' })
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    Promise.all([
      analyticsApi.getDashboard(),
      usersApi.getAll(),
      analyticsApi.getMarketTrends(),
      analyticsApi.getDistricts(),
    ]).then(([s, u, t, d]) => {
      setStats(s.data)
      setUsers(u.data)
      setTrends(t.data)
      setDistricts(d.data)
    }).catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  const setCropF = k => e => setCropForm(p => ({ ...p, [k]: e.target.value }))
  const setAlertF = k => e => setAlertForm(p => ({ ...p, [k]: e.target.value }))
  const setClimF = k => e => setClimateForm(p => ({ ...p, [k]: e.target.value }))

  const toggleAlertDistrict = (d) => {
    setAlertForm(p => ({
      ...p,
      affectedDistricts: p.affectedDistricts.includes(d)
        ? p.affectedDistricts.filter(x => x !== d)
        : [...p.affectedDistricts, d]
    }))
  }

  const handleCreateCrop = async (e) => {
    e.preventDefault(); setSubmitting(true)
    try {
      await cropsApi.create({ ...cropForm, growthPeriodDays: cropForm.growthPeriodDays ? Number(cropForm.growthPeriodDays) : undefined })
      toast.success('Crop added to catalogue!'); setCropModal(false)
    } catch (err) { toast.error(err.response?.data?.message ?? 'Failed') }
    finally { setSubmitting(false) }
  }

  const handleCreateAlert = async (e) => {
    e.preventDefault(); setSubmitting(true)
    try {
      await alertsApi.create(alertForm)
      toast.success('Alert broadcast!'); setAlertModal(false)
    } catch (err) { toast.error(err.response?.data?.message ?? 'Failed') }
    finally { setSubmitting(false) }
  }

  const handleCreateClimate = async (e) => {
    e.preventDefault(); setSubmitting(true)
    try {
      await climateApi.create({
        ...climateForm,
        temperatureMin: Number(climateForm.temperatureMin),
        temperatureMax: Number(climateForm.temperatureMax),
        rainfall: Number(climateForm.rainfall),
        humidity: Number(climateForm.humidity),
        windSpeed: Number(climateForm.windSpeed),
      })
      toast.success('Climate data saved!'); setClimateModal(false)
    } catch (err) { toast.error(err.response?.data?.message ?? 'Failed') }
    finally { setSubmitting(false) }
  }

  const verifyUser = async (id) => {
    try { await usersApi.verifyEmail(id); toast.success('User verified'); setUsers(p => p.map(u => u.id === id ? {...u, isEmailVerified: true, status:'active'} : u)) }
    catch { toast.error('Failed') }
  }

  const deleteUser = async (id) => {
    if (!confirm('Delete this user?')) return
    try { await usersApi.remove(id); setUsers(p => p.filter(u => u.id !== id)); toast.success('User deleted') }
    catch { toast.error('Failed') }
  }

  return (
    <div className="min-h-screen bg-earth-50">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-display font-800 text-3xl text-earth-900">Admin Dashboard</h1>
            <p className="text-earth-400 mt-1">Platform overview and management</p>
          </div>
          <div className="flex gap-2">
            <button onClick={() => setCropModal(true)} className="btn-secondary text-sm flex items-center gap-1.5"><Package className="w-4 h-4"/>Add Crop</button>
            <button onClick={() => setAlertModal(true)} className="btn-secondary text-sm flex items-center gap-1.5"><Bell className="w-4 h-4"/>Broadcast Alert</button>
            <button onClick={() => setClimateModal(true)} className="btn-primary text-sm flex items-center gap-1.5"><CloudRain className="w-4 h-4"/>Add Climate Data</button>
          </div>
        </div>

        {/* Stats */}
        {stats && (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <StatCard label="Total Listings" value={stats.listings?.total ?? 0} icon={ShoppingBag} color="leaf" sub={`${stats.listings?.active ?? 0} active`} />
            <StatCard label="Procurement" value={stats.procurement?.total ?? 0} icon={Package} color="sky" sub={`${stats.procurement?.open ?? 0} open`} />
            <StatCard label="Total Deals" value={stats.deals?.total ?? 0} icon={GitMerge} color="amber" sub={`${stats.deals?.completed ?? 0} completed`} />
            <StatCard label="Users" value={users.length} icon={Users} color="earth" />
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-1 p-1 bg-white rounded-xl border border-earth-100 w-fit mb-6">
          {[['overview','Market Overview'], ['users','Users'], ['trends','Trends']].map(([key, label]) => (
            <button key={key} onClick={() => setTab(key)}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${tab === key ? 'bg-leaf-600 text-white' : 'text-earth-500 hover:text-earth-800'}`}>
              {label}
            </button>
          ))}
        </div>

        {/* Overview tab */}
        {tab === 'overview' && (
          <div className="grid md:grid-cols-2 gap-6">
            <div className="card p-6">
              <SectionHeader title="District Activity" description="Listings by district" />
              {districts.length === 0 ? <EmptyState icon={TrendingUp} title="No data yet" description="Data appears once listings are created" /> : (
                <div className="space-y-3">
                  {districts.map(d => (
                    <div key={d.district} className="flex items-center justify-between p-3 bg-earth-50 rounded-xl">
                      <span className="font-semibold text-earth-800 text-sm">{d.district}</span>
                      <div className="text-right">
                        <p className="text-sm font-semibold text-leaf-700">{d.listingCount} listings</p>
                        <p className="text-xs text-earth-400">Avg: MK {Number(d.avgPrice).toFixed(0)}/kg</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div className="card p-6">
              <SectionHeader title="Market Trends" description="Average prices by crop" />
              {trends.length === 0 ? <EmptyState icon={TrendingUp} title="No data yet" description="Data appears once listings are created" /> : (
                <div className="space-y-3">
                  {trends.map(t => (
                    <div key={t.cropName} className="flex items-center justify-between p-3 bg-earth-50 rounded-xl">
                      <span className="font-semibold text-earth-800 text-sm">{t.cropName}</span>
                      <div className="text-right">
                        <p className="text-sm font-semibold text-leaf-700">MK {Number(t.avgPrice).toFixed(0)}/kg</p>
                        <p className="text-xs text-earth-400">{t.listingCount} listings</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Users tab */}
        {tab === 'users' && (
          <div className="card p-6">
            <SectionHeader title="All Users" description={`${users.length} registered users`} />
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-earth-100">
                    {['Name','Email','Role','Status','Actions'].map(h => (
                      <th key={h} className="text-left py-3 px-2 text-earth-400 font-semibold text-xs uppercase tracking-wider">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {users.map(u => (
                    <tr key={u.id} className="border-b border-earth-50 hover:bg-earth-50">
                      <td className="py-3 px-2 font-medium text-earth-900">{u.firstName} {u.lastName}</td>
                      <td className="py-3 px-2 text-earth-500">{u.email}</td>
                      <td className="py-3 px-2">
                        <span className={u.role === 'farmer' ? 'badge-farmer' : u.role === 'buyer' ? 'badge-buyer' : 'badge-admin'}>{u.role}</span>
                      </td>
                      <td className="py-3 px-2"><Badge status={u.status ?? 'pending'} /></td>
                      <td className="py-3 px-2">
                        <div className="flex gap-2">
                          {!u.isEmailVerified && (
                            <button onClick={() => verifyUser(u.id)} className="text-xs btn-outline py-1 px-2">Verify</button>
                          )}
                          <button onClick={() => deleteUser(u.id)} className="p-1 text-earth-300 hover:text-red-500 transition-colors">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Trends tab */}
        {tab === 'trends' && (
          <div className="card p-6">
            <SectionHeader title="Market Trends" description="Crop pricing and supply data" />
            {trends.length === 0 ? <EmptyState icon={TrendingUp} title="No trend data" description="Data will appear once listings are active" /> : (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {trends.map(t => (
                  <div key={t.cropName} className="bg-leaf-50 border border-leaf-100 rounded-xl p-4">
                    <h3 className="font-display font-700 text-earth-900 mb-3">{t.cropName}</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between"><span className="text-earth-500">Avg Price</span><span className="font-semibold text-leaf-700">MK {Number(t.avgPrice).toFixed(0)}/kg</span></div>
                      <div className="flex justify-between"><span className="text-earth-500">Total Qty</span><span className="font-semibold">{Number(t.totalQuantity).toLocaleString()} kg</span></div>
                      <div className="flex justify-between"><span className="text-earth-500">Listings</span><span className="font-semibold">{t.listingCount}</span></div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Add Crop Modal */}
      <Modal open={cropModal} onClose={() => setCropModal(false)} title="Add Crop to Catalogue">
        <form onSubmit={handleCreateCrop} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <FormField label="Crop Name" required><input className="input" placeholder="Maize" value={cropForm.name} onChange={setCropF('name')} required /></FormField>
            <FormField label="Local Name"><input className="input" placeholder="Chimanga" value={cropForm.localName} onChange={setCropF('localName')} /></FormField>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <FormField label="Category" required>
              <select className="input" value={cropForm.category} onChange={setCropF('category')}>
                {['cereals','legumes','vegetables','fruits','roots','cash_crops'].map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </FormField>
            <FormField label="Unit of Measure" required>
              <select className="input" value={cropForm.unitOfMeasure} onChange={setCropF('unitOfMeasure')}>
                {['kg','ton','bag','crate','bunch'].map(u => <option key={u} value={u}>{u}</option>)}
              </select>
            </FormField>
          </div>
          <FormField label="Growth Period (days)"><input type="number" className="input" placeholder="90" value={cropForm.growthPeriodDays} onChange={setCropF('growthPeriodDays')} /></FormField>
          <FormField label="Description"><textarea className="input resize-none" rows={2} value={cropForm.description} onChange={setCropF('description')} /></FormField>
          <div className="flex gap-3"><button type="button" onClick={() => setCropModal(false)} className="btn-secondary flex-1">Cancel</button><button type="submit" disabled={submitting} className="btn-primary flex-1 flex items-center justify-center gap-2">{submitting ? <><Spinner size="sm"/>Adding...</> : 'Add Crop'}</button></div>
        </form>
      </Modal>

      {/* Alert Modal */}
      <Modal open={alertModal} onClose={() => setAlertModal(false)} title="Broadcast Alert">
        <form onSubmit={handleCreateAlert} className="space-y-4">
          <FormField label="Title" required><input className="input" placeholder="Heavy Rainfall Warning" value={alertForm.title} onChange={setAlertF('title')} required /></FormField>
          <FormField label="Message" required><textarea className="input resize-none" rows={3} placeholder="Alert details..." value={alertForm.message} onChange={setAlertF('message')} required /></FormField>
          <div className="grid grid-cols-2 gap-3">
            <FormField label="Type">
              <select className="input" value={alertForm.type} onChange={setAlertF('type')}>
                {['weather','market','general','pest'].map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </FormField>
            <FormField label="Severity">
              <select className="input" value={alertForm.severity} onChange={setAlertF('severity')}>
                {['low','medium','high'].map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </FormField>
          </div>
          <FormField label="Affected Districts">
            <div className="flex flex-wrap gap-2">
              {DISTRICTS.map(d => (
                <button key={d} type="button" onClick={() => toggleAlertDistrict(d)}
                  className={`text-xs px-3 py-1.5 rounded-full border transition-all ${alertForm.affectedDistricts.includes(d) ? 'bg-red-100 border-red-300 text-red-700' : 'border-earth-200 text-earth-500 hover:border-earth-300'}`}>
                  {d}
                </button>
              ))}
            </div>
          </FormField>
          <FormField label="Expires At"><input type="datetime-local" className="input" value={alertForm.expiresAt} onChange={setAlertF('expiresAt')} /></FormField>
          <div className="flex gap-3"><button type="button" onClick={() => setAlertModal(false)} className="btn-secondary flex-1">Cancel</button><button type="submit" disabled={submitting} className="btn-primary flex-1 flex items-center justify-center gap-2">{submitting ? <><Spinner size="sm"/>Broadcasting...</> : 'Broadcast Alert'}</button></div>
        </form>
      </Modal>

      {/* Climate Modal */}
      <Modal open={climateModal} onClose={() => setClimateModal(false)} title="Add Climate Data">
        <form onSubmit={handleCreateClimate} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <FormField label="District" required>
              <select className="input" value={climateForm.district} onChange={setClimF('district')} required>
                <option value="">Select...</option>
                {DISTRICTS.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </FormField>
            <FormField label="Date" required><input type="date" className="input" value={climateForm.date} onChange={setClimF('date')} required /></FormField>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <FormField label="Min Temp (°C)"><input type="number" className="input" placeholder="18" value={climateForm.temperatureMin} onChange={setClimF('temperatureMin')} /></FormField>
            <FormField label="Max Temp (°C)"><input type="number" className="input" placeholder="28" value={climateForm.temperatureMax} onChange={setClimF('temperatureMax')} /></FormField>
            <FormField label="Rainfall (mm)"><input type="number" className="input" placeholder="12.5" value={climateForm.rainfall} onChange={setClimF('rainfall')} /></FormField>
            <FormField label="Humidity (%)"><input type="number" className="input" placeholder="75" value={climateForm.humidity} onChange={setClimF('humidity')} /></FormField>
          </div>
          <FormField label="Condition"><input className="input" placeholder="Partly Cloudy" value={climateForm.condition} onChange={setClimF('condition')} /></FormField>
          <FormField label="Farming Recommendation"><textarea className="input resize-none" rows={2} placeholder="Good conditions for planting..." value={climateForm.recommendation} onChange={setClimF('recommendation')} /></FormField>
          <div className="flex gap-3"><button type="button" onClick={() => setClimateModal(false)} className="btn-secondary flex-1">Cancel</button><button type="submit" disabled={submitting} className="btn-primary flex-1 flex items-center justify-center gap-2">{submitting ? <><Spinner size="sm"/>Saving...</> : 'Save Data'}</button></div>
        </form>
      </Modal>
    </div>
  )
}
