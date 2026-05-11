import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Car, Ship, Warehouse, BadgeDollarSign, CreditCard, FileText, ArrowRight, Search } from 'lucide-react'

const heroImages = [
  '/images/pexels-bylukemiller-32725750.jpg',
  '/images/pexels-ashlyn-decorges-2160142324-36922872.jpg',
  '/images/pexels-fbo-media-535159577-36841288.jpg',
  '/images/pexels-holyson-h-2154634702-35420481.jpg',
]

const features = [
  { Icon: Car, title: 'Vehicle Management', desc: 'Track every vehicle from import to sale with full status history and image gallery.' },
  { Icon: Ship, title: 'Shipment Tracking', desc: 'Manage shipments, assign vehicles, and let customers track with a unique code.' },
  { Icon: Warehouse, title: 'Inventory Control', desc: 'Know exactly what is in stock, where, and its current availability.' },
  { Icon: BadgeDollarSign, title: 'Sales & Customers', desc: 'Create sales, manage customers, and complete transactions seamlessly.' },
  { Icon: CreditCard, title: 'Payment Recording', desc: 'Record and track payments against each sale in real time.' },
  { Icon: FileText, title: 'Document Storage', desc: 'Upload and retrieve documents linked to vehicles or sales.' },
]

export default function Landing() {
  const navigate = useNavigate()
  const isLoggedIn = !!localStorage.getItem('token')
  const [imgIndex, setImgIndex] = useState(0)
  const [trackingInput, setTrackingInput] = useState('')

  useEffect(() => {
    const t = setInterval(() => setImgIndex((i) => (i + 1) % heroImages.length), 4000)
    return () => clearInterval(t)
  }, [])

  function handleTrack(e) {
    e.preventDefault()
    if (trackingInput.trim()) navigate(`/track/${trackingInput.trim()}`)
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white flex flex-col">
      {/* Navbar */}
      <nav className="flex items-center justify-between px-8 py-4 border-b border-gray-800/60 backdrop-blur-sm sticky top-0 z-50 bg-gray-950/90">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <Car size={16} className="text-white" />
          </div>
          <span className="text-lg font-bold">AutoTrack<span className="text-blue-400">360</span></span>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/track')}
            className="text-gray-400 hover:text-white text-sm transition-colors"
          >
            Track Shipment
          </button>
          <button
            onClick={() => navigate(isLoggedIn ? '/app/dashboard' : '/login')}
            className="bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium px-5 py-2 rounded-lg transition-colors flex items-center gap-1.5"
          >
            {isLoggedIn ? 'Dashboard' : 'Sign In'}
            <ArrowRight size={14} />
          </button>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative flex-1 flex items-center min-h-[85vh] overflow-hidden">
        {/* Background image slideshow */}
        {heroImages.map((src, i) => (
          <div
            key={src}
            className="absolute inset-0 transition-opacity duration-1000"
            style={{ opacity: i === imgIndex ? 1 : 0 }}
          >
            <img src={src} alt="" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-r from-gray-950 via-gray-950/80 to-gray-950/30" />
          </div>
        ))}

        <div className="relative z-10 px-8 max-w-2xl">
          <span className="inline-block text-xs font-semibold tracking-widest text-blue-400 uppercase mb-4 bg-blue-400/10 border border-blue-400/20 px-3 py-1 rounded-full">
            Vehicle Import & Sales Platform
          </span>
          <h1 className="text-5xl sm:text-6xl font-extrabold leading-tight mb-6">
            Your Complete<br />
            <span className="text-blue-400">Vehicle Pipeline</span>
          </h1>
          <p className="text-gray-300 text-lg max-w-lg mb-8">
            End-to-end platform for importing, tracking, and selling vehicles — from shipment to final sale.
          </p>
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => navigate(isLoggedIn ? '/app/dashboard' : '/login')}
              className="bg-blue-600 hover:bg-blue-500 text-white font-semibold px-8 py-3 rounded-xl text-sm transition-colors flex items-center gap-2"
            >
              {isLoggedIn ? 'Open Dashboard' : 'Get Started'}
              <ArrowRight size={16} />
            </button>
            <button
              onClick={() => navigate('/track')}
              className="border border-gray-600 hover:border-gray-400 text-gray-300 hover:text-white font-medium px-8 py-3 rounded-xl text-sm transition-colors flex items-center gap-2"
            >
              <Search size={15} />
              Track a Shipment
            </button>
          </div>

          {/* Inline tracking */}
          <form onSubmit={handleTrack} className="mt-8 flex gap-2 max-w-sm">
            <input
              value={trackingInput}
              onChange={(e) => setTrackingInput(e.target.value)}
              placeholder="Enter tracking number (e.g. AT-3F9A1B2C)"
              className="flex-1 bg-white/10 border border-white/20 text-white placeholder-gray-500 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button type="submit" className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2.5 rounded-lg text-sm font-medium transition-colors">
              Track
            </button>
          </form>
        </div>

        {/* Slide indicators */}
        <div className="absolute bottom-8 left-8 flex gap-2 z-10">
          {heroImages.map((_, i) => (
            <button
              key={i}
              onClick={() => setImgIndex(i)}
              className={`h-1.5 rounded-full transition-all ${i === imgIndex ? 'w-8 bg-blue-400' : 'w-2 bg-white/30'}`}
            />
          ))}
        </div>
      </section>

      {/* Car showcase strip */}
      <section className="bg-gray-900 py-6 overflow-hidden border-y border-gray-800">
        <div className="flex gap-4 animate-none" style={{ display: 'flex', gap: '1rem', padding: '0 2rem' }}>
          {[...heroImages, ...heroImages].map((src, i) => (
            <img
              key={i}
              src={src}
              alt=""
              className="h-28 w-48 object-cover rounded-xl flex-shrink-0 opacity-70 hover:opacity-100 transition-opacity"
            />
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="px-8 py-20 max-w-6xl mx-auto w-full">
        <div className="text-center mb-12">
          <p className="text-xs font-semibold tracking-widest text-blue-400 uppercase mb-3">Platform Features</p>
          <h2 className="text-3xl font-bold text-white">Everything you need to manage vehicles</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {features.map(({ Icon, title, desc }) => (
            <div key={title} className="bg-gray-900 border border-gray-800 rounded-2xl p-6 hover:border-blue-600/50 hover:bg-gray-800/50 transition-all group">
              <div className="w-10 h-10 bg-blue-600/10 border border-blue-600/20 rounded-xl flex items-center justify-center mb-4 group-hover:bg-blue-600/20 transition-colors">
                <Icon size={20} className="text-blue-400" />
              </div>
              <h3 className="font-semibold text-white mb-2">{title}</h3>
              <p className="text-gray-400 text-sm leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="relative overflow-hidden">
        <img
          src="/images/pexels-dheeraj-madambil-480824580-35231778.jpg"
          alt=""
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gray-950/80" />
        <div className="relative z-10 text-center py-20 px-8">
          <h2 className="text-3xl font-bold mb-4">Ready to streamline your vehicle business?</h2>
          <p className="text-gray-400 mb-8 max-w-md mx-auto">Sign in to access the full management dashboard.</p>
          <button
            onClick={() => navigate(isLoggedIn ? '/app/dashboard' : '/login')}
            className="bg-blue-600 hover:bg-blue-500 text-white font-semibold px-10 py-3.5 rounded-xl text-sm transition-colors inline-flex items-center gap-2"
          >
            {isLoggedIn ? 'Go to Dashboard' : 'Get Started Now'}
            <ArrowRight size={16} />
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-800 px-8 py-5 flex items-center justify-between text-xs text-gray-600">
        <span>AutoTrack360 — Vehicle Import & Sales Management</span>
        <div className="flex gap-4">
          <button onClick={() => navigate('/track')} className="hover:text-gray-400 transition-colors">Track Shipment</button>
          <a href="http://localhost:8080/swagger-ui/index.html" target="_blank" rel="noreferrer" className="hover:text-gray-400 transition-colors">API Docs</a>
        </div>
      </footer>
    </div>
  )
}
