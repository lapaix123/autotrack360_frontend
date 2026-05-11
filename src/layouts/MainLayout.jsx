import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard, Car, Ship, Warehouse, BadgeDollarSign,
  CreditCard, FileText, LogOut, ChevronRight
} from 'lucide-react'

const navItems = [
  { to: '/app/dashboard', label: 'Dashboard', Icon: LayoutDashboard },
  { to: '/app/vehicles', label: 'Vehicles', Icon: Car },
  { to: '/app/shipments', label: 'Shipments', Icon: Ship },
  { to: '/app/inventory', label: 'Inventory', Icon: Warehouse },
  { to: '/app/sales', label: 'Sales', Icon: BadgeDollarSign },
  { to: '/app/payments', label: 'Payments', Icon: CreditCard },
  { to: '/app/documents', label: 'Documents', Icon: FileText },
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
      <aside className="w-64 bg-gray-950 flex flex-col shadow-xl">
        <div className="px-6 py-6 border-b border-gray-800">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <Car size={16} className="text-white" />
            </div>
            <div>
              <h1 className="text-white font-bold text-base leading-tight">
                AutoTrack<span className="text-blue-400">360</span>
              </h1>
              <p className="text-gray-500 text-xs">Vehicle Management</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-0.5">
          {navItems.map(({ to, label, Icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all group ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20'
                    : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <Icon size={17} className={isActive ? 'text-white' : 'text-gray-500 group-hover:text-white'} />
                  <span className="flex-1">{label}</span>
                  {isActive && <ChevronRight size={14} className="text-blue-200" />}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        <div className="px-4 py-4 border-t border-gray-800">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs font-bold">
              {email[0]?.toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-gray-200 text-xs font-medium truncate">{email}</p>
              <p className="text-gray-500 text-xs">{role}</p>
            </div>
          </div>
          <button
            onClick={logout}
            className="flex items-center gap-2 text-xs text-gray-500 hover:text-red-400 transition-colors"
          >
            <LogOut size={13} />
            Sign out
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white border-b border-gray-200 px-6 py-3.5 flex items-center justify-between">
          <p className="text-sm text-gray-500">
            Welcome back, <span className="font-semibold text-gray-800">{email}</span>
          </p>
          <span className="text-xs bg-blue-50 text-blue-600 font-medium px-2.5 py-1 rounded-full border border-blue-100">
            {role}
          </span>
        </header>
        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
