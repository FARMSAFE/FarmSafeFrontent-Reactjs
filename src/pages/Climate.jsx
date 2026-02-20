import { useState, useEffect } from 'react'
import Navbar from '../components/common/Navbar'
import { alertsApi } from '../api/services'
import { Spinner } from '../components/common/UI'
import { CloudRain, Wind, Thermometer, AlertTriangle, CheckCircle, XCircle } from 'lucide-react'

const DISTRICTS = [
  { name: 'Lilongwe',  lat: -13.9669, lon: 33.7873 },
  { name: 'Blantyre',  lat: -15.7861, lon: 34.9966 },
  { name: 'Mzuzu',     lat: -11.4656, lon: 34.0207 },
  { name: 'Zomba',     lat: -15.3833, lon: 35.3167 },
  { name: 'Kasungu',   lat: -13.0333, lon: 33.4833 },
  { name: 'Mangochi',  lat: -14.4667, lon: 35.2667 },
  { name: 'Salima',    lat: -13.7833, lon: 34.4500 },
  { name: 'Dedza',     lat: -14.3667, lon: 34.3333 },
  { name: 'Ntcheu',    lat: -14.8167, lon: 34.6333 },
  { name: 'Balaka',    lat: -14.9833, lon: 34.9667 },
]

const WMO = {
  0: '☀️', 1: '🌤️', 2: '⛅', 3: '☁️',
  45: '🌫️', 48: '🌫️',
  51: '🌦️', 53: '🌦️', 55: '🌧️',
  61: '🌧️', 63: '🌧️', 65: '🌧️',
  80: '🌦️', 81: '🌧️', 82: '⛈️',
  95: '⛈️', 96: '⛈️', 99: '⛈️',
}

const WMO_LABEL = {
  0: 'Clear sky', 1: 'Mainly clear', 2: 'Partly cloudy', 3: 'Overcast',
  45: 'Foggy', 48: 'Foggy',
  51: 'Light drizzle', 53: 'Drizzle', 55: 'Heavy drizzle',
  61: 'Light rain', 63: 'Rain', 65: 'Heavy rain',
  80: 'Rain showers', 81: 'Showers', 82: 'Heavy showers',
  95: 'Thunderstorm', 96: 'Thunderstorm', 99: 'Thunderstorm',
}

function getFarmingAdvice(code, rain, maxTemp, minTemp, wind) {
  const tasks = []

  // Planting
  if (rain >= 5 && rain <= 25 && code < 80 && maxTemp < 35)
    tasks.push({ task: 'Planting', ok: true, reason: `Good soil moisture from ${rain.toFixed(0)}mm rain` })
  else if (rain > 25 || code >= 95)
    tasks.push({ task: 'Planting', ok: false, reason: 'Too much rain or storms — wait for drier conditions' })
  else if (rain < 2 && maxTemp > 32)
    tasks.push({ task: 'Planting', ok: false, reason: 'Too dry and hot — seeds may not germinate' })
  else
    tasks.push({ task: 'Planting', ok: true, reason: 'Conditions acceptable for planting' })

  // Harvesting
  if (rain < 5 && code <= 3 && wind < 30)
    tasks.push({ task: 'Harvesting', ok: true, reason: 'Dry and calm — ideal for harvesting and drying' })
  else if (rain > 10 || code >= 61)
    tasks.push({ task: 'Harvesting', ok: false, reason: `Rain expected (${rain.toFixed(0)}mm) — crop may get wet` })
  else
    tasks.push({ task: 'Harvesting', ok: false, reason: 'Unsettled weather — monitor before harvesting' })

  // Spraying
  if (wind < 15 && rain < 3 && code < 61)
    tasks.push({ task: 'Spraying pesticides', ok: true, reason: 'Low wind and dry — good spray conditions' })
  else if (wind >= 15)
    tasks.push({ task: 'Spraying pesticides', ok: false, reason: `Wind too strong (${wind.toFixed(0)} km/h) — chemicals will drift` })
  else
    tasks.push({ task: 'Spraying pesticides', ok: false, reason: 'Rain may wash off chemicals — avoid spraying' })

  // Irrigation
  if (rain < 5 && maxTemp > 28)
    tasks.push({ task: 'Irrigation needed', ok: true, reason: `Hot (${maxTemp.toFixed(0)}°C) and dry — water your crops` })
  else if (rain >= 10)
    tasks.push({ task: 'Irrigation needed', ok: false, reason: `Rain (${rain.toFixed(0)}mm) provides enough water` })
  else
    tasks.push({ task: 'Irrigation needed', ok: null, reason: 'Check soil moisture before irrigating' })

  // Frost warning (relevant for highlands like Dedza, Zomba, Mzuzu)
  if (minTemp < 10)
    tasks.push({ task: 'Frost risk', ok: false, reason: `Low of ${minTemp.toFixed(0)}°C — protect sensitive crops overnight` })

  return tasks
}

export default function Climate() {
  const [district, setDistrict] = useState(DISTRICTS[0])
  const [weather, setWeather] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [alerts, setAlerts] = useState([])

  useEffect(() => {
    setLoading(true)
    setError(false)
    setWeather(null)
    const { lat, lon } = district
    fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}` +
      `&daily=weathercode,temperature_2m_max,temperature_2m_min,precipitation_sum,windspeed_10m_max` +
      `&current_weather=true&timezone=Africa%2FBlantyre&forecast_days=7`
    )
      .then(r => r.json())
      .then(data => {
        if (data.error) throw new Error(data.reason)
        setWeather(data)
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false))

    alertsApi.getAll().then(r => setAlerts(r.data)).catch(() => {})
  }, [district])

  const current = weather?.current_weather
  const daily = weather?.daily

  const days = daily ? daily.time.map((date, i) => ({
    date,
    code: daily.weathercode[i],
    maxTemp: daily.temperature_2m_max[i],
    minTemp: daily.temperature_2m_min[i],
    rain: daily.precipitation_sum[i],
    wind: daily.windspeed_10m_max[i],
  })) : []

  const today = days[0]

  return (
    <div className="min-h-screen bg-earth-50">
      <Navbar />

      {/* Header */}
      <div className="bg-gradient-to-r from-sky-700 to-sky-900 text-white py-10 px-4">
        <div className="max-w-7xl mx-auto">
          <h1 className="font-display font-800 text-4xl mb-1">Weather Forecast</h1>
          <p className="text-sky-200 mb-6">7-day forecast with daily farming advice for your district</p>
          <div className="flex flex-wrap gap-2">
            {DISTRICTS.map(d => (
              <button key={d.name} onClick={() => setDistrict(d)}
                className={`px-4 py-2 rounded-full text-sm font-semibold transition-all ${
                  district.name === d.name
                    ? 'bg-white text-sky-800 shadow'
                    : 'bg-sky-800 text-sky-100 hover:bg-sky-700'}`}>
                {d.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8 space-y-6">

        {/* Admin alerts */}
        {alerts.filter(a => !a.district || a.district === district.name).length > 0 && (
          <div className="space-y-2">
            {alerts.slice(0,3).map(a => (
              <div key={a.id} className={`flex items-start gap-3 p-4 rounded-xl border ${
                a.severity === 'high' ? 'bg-red-50 border-red-200' :
                a.severity === 'medium' ? 'bg-amber-50 border-amber-200' :
                'bg-sky-50 border-sky-200'}`}>
                <AlertTriangle className={`w-4 h-4 mt-0.5 flex-shrink-0 ${
                  a.severity === 'high' ? 'text-red-500' :
                  a.severity === 'medium' ? 'text-amber-500' : 'text-sky-500'}`} />
                <div>
                  <p className="font-semibold text-sm">{a.title}</p>
                  <p className="text-xs text-earth-500 mt-0.5">{a.message}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {loading && (
          <div className="flex items-center justify-center py-24 gap-3 text-earth-500">
            <Spinner /> Loading weather for {district.name}...
          </div>
        )}

        {error && (
          <div className="card p-8 text-center text-red-500">
            Could not load weather data. Check your internet connection and try again.
          </div>
        )}

        {!loading && !error && weather && (
          <>
            {/* TODAY — big card */}
            {today && (
              <div className="card p-6">
                <div className="flex items-start justify-between mb-6">
                  <div>
                    <p className="text-earth-400 text-sm font-medium mb-1">Today — {district.name}</p>
                    <div className="flex items-end gap-3">
                      <p className="font-display font-800 text-6xl text-earth-900 leading-none">
                        {Math.round(current?.temperature ?? today.maxTemp)}°C
                      </p>
                      <p className="text-5xl mb-1">{WMO[today.code] ?? '🌡️'}</p>
                    </div>
                    <p className="text-earth-500 mt-2">{WMO_LABEL[today.code] ?? 'Unknown'}</p>
                  </div>
                  <div className="text-right text-sm text-earth-500 space-y-1">
                    <p>High: <span className="font-bold text-red-500">{Math.round(today.maxTemp)}°C</span></p>
                    <p>Low: <span className="font-bold text-sky-500">{Math.round(today.minTemp)}°C</span></p>
                    <p className="flex items-center justify-end gap-1">
                      <CloudRain className="w-3.5 h-3.5" /> {today.rain.toFixed(1)} mm rain
                    </p>
                    <p className="flex items-center justify-end gap-1">
                      <Wind className="w-3.5 h-3.5" /> {Math.round(today.wind)} km/h wind
                    </p>
                  </div>
                </div>

                {/* Today's farming checklist */}
                <div className="border-t border-earth-100 pt-5">
                  <p className="font-semibold text-earth-700 mb-3 text-sm">Today's Farming Checklist</p>
                  <div className="grid sm:grid-cols-2 gap-2">
                    {getFarmingAdvice(today.code, today.rain, today.maxTemp, today.minTemp, today.wind).map(item => (
                      <div key={item.task} className={`flex items-start gap-3 p-3 rounded-xl ${
                        item.ok === true ? 'bg-leaf-50' :
                        item.ok === false ? 'bg-red-50' : 'bg-amber-50'}`}>
                        {item.ok === true
                          ? <CheckCircle className="w-5 h-5 text-leaf-600 flex-shrink-0 mt-0.5" />
                          : item.ok === false
                          ? <XCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                          : <AlertTriangle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
                        }
                        <div>
                          <p className={`font-semibold text-sm ${
                            item.ok === true ? 'text-leaf-700' :
                            item.ok === false ? 'text-red-700' : 'text-amber-700'}`}>
                            {item.task}
                          </p>
                          <p className="text-xs text-earth-500 mt-0.5">{item.reason}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* 7-day forecast */}
            <div>
              <h2 className="font-display font-700 text-xl text-earth-900 mb-3">7-Day Forecast</h2>
              <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
                {days.map((day, i) => (
                  <div key={day.date} className={`card p-4 text-center ${i === 0 ? 'ring-2 ring-sky-400' : ''}`}>
                    <p className="text-xs text-earth-400 font-medium mb-1">
                      {i === 0 ? 'Today' : i === 1 ? 'Tomorrow' :
                        new Date(day.date).toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric' })}
                    </p>
                    <p className="text-3xl my-2">{WMO[day.code] ?? '🌡️'}</p>
                    <p className="text-xs text-earth-500 mb-2 leading-tight">{WMO_LABEL[day.code]}</p>
                    <div className="text-sm space-y-1">
                      <p>
                        <span className="text-red-500 font-bold">{Math.round(day.maxTemp)}°</span>
                        {' / '}
                        <span className="text-sky-500 font-bold">{Math.round(day.minTemp)}°</span>
                      </p>
                      <p className="text-sky-600 flex items-center justify-center gap-1 text-xs">
                        <CloudRain className="w-3 h-3" /> {day.rain.toFixed(0)}mm
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Daily farming advice for rest of week */}
            <div>
              <h2 className="font-display font-700 text-xl text-earth-900 mb-3">Weekly Farming Planner</h2>
              <div className="space-y-3">
                {days.slice(1).map(day => {
                  const advice = getFarmingAdvice(day.code, day.rain, day.maxTemp, day.minTemp, day.wind)
                  const goodCount = advice.filter(a => a.ok === true).length
                  const badCount = advice.filter(a => a.ok === false).length
                  const overallOk = goodCount > badCount
                  return (
                    <div key={day.date} className="card p-4">
                      <div className="flex items-center gap-4 mb-3">
                        <p className="text-2xl">{WMO[day.code] ?? '🌡️'}</p>
                        <div className="flex-1">
                          <p className="font-semibold text-earth-900">
                            {new Date(day.date).toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' })}
                          </p>
                          <p className="text-xs text-earth-400">
                            {Math.round(day.maxTemp)}°C high · {day.rain.toFixed(0)}mm rain · {Math.round(day.wind)} km/h wind
                          </p>
                        </div>
                        <span className={`text-xs font-bold px-3 py-1 rounded-full ${
                          overallOk ? 'bg-leaf-100 text-leaf-700' : 'bg-red-100 text-red-600'}`}>
                          {overallOk ? '✓ Good day' : '⚠ Poor day'}
                        </span>
                      </div>
                      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-2">
                        {advice.map(item => (
                          <div key={item.task} className={`text-xs p-2 rounded-lg flex items-start gap-1.5 ${
                            item.ok === true ? 'bg-leaf-50 text-leaf-700' :
                            item.ok === false ? 'bg-red-50 text-red-600' : 'bg-amber-50 text-amber-700'}`}>
                            <span>{item.ok === true ? '✓' : item.ok === false ? '✗' : '?'}</span>
                            <span><strong>{item.task}</strong> — {item.reason}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
