import { Outlet, NavLink, useNavigate } from 'react-router-dom'

const navItems = [
  { to: '/app/dashboard', label: 'Dashboard', icon: '📊' },
  { to: '/app/vehicles', label: 'Vehicles', icon: '🚗' },
  { to: '/app/shipments', label: 'Shipments', icon: '🚢' },
  { to: '/app/inventory', label: 'Inventory', icon: '🏭' },
  { to: '/app/sales', label: 'Sales', icon: '💰' },
  { to: '/app/payments', label: 'Payments', icon: '💳' },
  { to: '/app/documents', label: 'Documents', icon: '📄' },
]

export default function MainLayout() {
  const navigate = useNavigate()
  const email = localStorage.getItem('email') || 'User'
  const role = localStorage.getItem('role') || ''

  function logout() {
    localStorage.clear()
    navigate('/login')
  }

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="w-60 bg-gray-900 flex flex-col">
        <div className="px-6 py-5 border-b border-gray-700">
          <h1 className="text-white font-bold text-lg leading-tight">AutoTrack<span className="text-blue-400">360</span></h1>
          <p className="text-gray-400 text-xs mt-0.5">Vehicle Management</p>
        </div>
        <nav className="flex-1 px-3 py-4 space-y-1">
          {navItems.map(({ to, label, icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                  isActive ? 'bg-blue-600 text-white' : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                }`
              }
            >
              <span>{icon}</span>
              {label}
            </NavLink>
          ))}
        </nav>
        <div className="px-4 py-4 border-t border-gray-700">
          <p className="text-gray-300 text-xs truncate">{email}</p>
          <p className="text-gray-500 text-xs">{role}</p>
          <button onClick={logout} className="mt-2 text-xs text-red-400 hover:text-red-300">
            Sign out
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white border-b border-gray-200 px-6 py-4">
          <p className="text-sm text-gray-500">Welcome back, <span className="font-medium text-gray-700">{email}</span></p>
        </header>
        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
