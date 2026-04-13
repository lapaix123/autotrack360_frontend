import { useNavigate } from 'react-router-dom'

const features = [
  { icon: '🚗', title: 'Vehicle Management', desc: 'Track every vehicle from import to sale with full status history.' },
  { icon: '🚢', title: 'Shipment Tracking', desc: 'Manage shipments, assign vehicles, and monitor transit status.' },
  { icon: '🏭', title: 'Inventory Control', desc: 'Know exactly what is in stock, where, and its availability.' },
  { icon: '💰', title: 'Sales & Customers', desc: 'Create sales, manage customers, and complete transactions.' },
  { icon: '💳', title: 'Payment Recording', desc: 'Record and track payments against each sale.' },
  { icon: '📄', title: 'Document Storage', desc: 'Upload and retrieve documents linked to vehicles or sales.' },
]

export default function Landing() {
  const navigate = useNavigate()
  const isLoggedIn = !!localStorage.getItem('token')

  return (
    <div className="min-h-screen bg-gray-950 text-white flex flex-col">
      {/* Navbar */}
      <nav className="flex items-center justify-between px-8 py-5 border-b border-gray-800">
        <div>
          <span className="text-xl font-bold">AutoTrack<span className="text-blue-400">360</span></span>
          <span className="ml-3 text-xs text-gray-500 hidden sm:inline">Vehicle Import & Sales Management</span>
        </div>
        <button
          onClick={() => navigate(isLoggedIn ? '/dashboard' : '/login')}
          className="bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium px-5 py-2 rounded-lg transition-colors"
        >
          {isLoggedIn ? 'Go to Dashboard' : 'Sign In'}
        </button>
      </nav>

      {/* Hero */}
      <section className="flex-1 flex flex-col items-center justify-center text-center px-6 py-20">
        <span className="text-xs font-semibold tracking-widest text-blue-400 uppercase mb-4">Demo System</span>
        <h1 className="text-5xl sm:text-6xl font-extrabold leading-tight mb-6">
          Manage Your Vehicle<br />
          <span className="text-blue-400">Import Pipeline</span>
        </h1>
        <p className="text-gray-400 text-lg max-w-xl mb-10">
          End-to-end platform for importing, tracking, and selling vehicles — from shipment to final sale.
        </p>
        <div className="flex gap-3">
          <button
            onClick={() => navigate(isLoggedIn ? '/dashboard' : '/login')}
            className="bg-blue-600 hover:bg-blue-500 text-white font-semibold px-8 py-3 rounded-xl text-sm transition-colors"
          >
            {isLoggedIn ? 'Open Dashboard →' : 'Get Started →'}
          </button>
          <a
            href="http://localhost:8080/swagger-ui/index.html"
            target="_blank"
            rel="noreferrer"
            className="border border-gray-700 hover:border-gray-500 text-gray-300 hover:text-white font-medium px-8 py-3 rounded-xl text-sm transition-colors"
          >
            API Docs
          </a>
        </div>
      </section>

      {/* Features */}
      <section className="px-8 pb-20 max-w-5xl mx-auto w-full">
        <p className="text-center text-xs font-semibold tracking-widest text-gray-500 uppercase mb-8">What's included</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {features.map(({ icon, title, desc }) => (
            <div key={title} className="bg-gray-900 border border-gray-800 rounded-xl p-5 hover:border-gray-600 transition-colors">
              <div className="text-2xl mb-3">{icon}</div>
              <h3 className="font-semibold text-white mb-1">{title}</h3>
              <p className="text-gray-400 text-sm">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-800 px-8 py-5 text-center text-xs text-gray-600">
        AutoTrack360 — Demo Project · Backend at{' '}
        <a href="http://localhost:8080" className="text-gray-500 hover:text-gray-300">localhost:8080</a>
      </footer>
    </div>
  )
}
