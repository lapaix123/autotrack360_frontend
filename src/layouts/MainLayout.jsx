import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard, Car, Ship, Warehouse, BadgeDollarSign,
  CreditCard, FileText, LogOut, ChevronRight, BarChart3,
  Users, Package
} from 'lucide-react'

const allNavItems = [
  { to: '/app/dashboard', label: 'Dashboard', Icon: LayoutDashboard, roles: ['ADMIN', 'SALES', 'LOGISTICS'] },
  // Sales department
  { to: '/app/sales', label: 'Sales Orders', Icon: BadgeDollarSign, roles: ['ADMIN', 'SALES'], group: 'Sales' },
  { to: '/app/payments', label: 'Payments', Icon: CreditCard, roles: ['ADMIN', 'SALES'], group: 'Sales' },
  { to: '/app/documents', label: 'Documents', Icon: FileText, roles: ['ADMIN', 'SALES'], group: 'Sales' },
  // Logistics department
  { to: '/app/vehicles', label: 'Vehicles', Icon: Car, roles: ['ADMIN', 'LOGISTICS'], group: 'Logistics' },
  { to: '/app/shipments', label: 'Shipments', Icon: Ship, roles: ['ADMIN', 'LOGISTICS'], group: 'Logistics' },
  { to: '/app/inventory', label: 'Inventory', Icon: Warehouse, roles: ['ADMIN', 'LOGISTICS'], group: 'Logistics' },
  // Reports
  { to: '/app/reports', label: 'Reports', Icon: BarChart3, roles: ['ADMIN', 'SALES'], group: 'Reports' },
]

const roleLabels = {
  ADMIN: { label: 'Administrator', color: 'bg-purple-500/10 text-purple-400 border-purple-500/20' },
  SALES: { label: 'Sales Department', color: 'bg-green-500/10 text-green-400 border-green-500/20' },
  LOGISTICS: { label: 'Logistics Department', color: 'bg-blue-500/10 text-blue-400 border-blue-500/20' },
}

const groupColors = {
  Sales: 'text-green-500',
  Logistics: 'text-blue-400',
  Reports: 'text-purple-400',
}

export default function MainLayout() {
  const navigate = useNavigate()
  const email = localStorage.getItem('email') || 'User'
  const role = localStorage.getItem('role') || 'ADMIN'
  const name = localStorage.getItem('name') || email.split('@')[0]

  const navItems = allNavItems.filter(item => item.roles.includes(role))

  // Group items for display
  const grouped = navItems.reduce((acc, item) => {
    const g = item.group || 'General'
    if (!acc[g]) acc[g] = []
    acc[g].push(item)
    return acc
  }, {})

  function logout() {
    localStorage.clear()
    navigate('/login')
  }

  const roleInfo = roleLabels[role] || roleLabels.ADMIN

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="w-64 bg-gray-950 flex flex-col shadow-xl">
        <div className="px-6 py-5 border-b border-gray-800">
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

        <nav className="flex-1 px-3 py-4 overflow-y-auto space-y-4">
          {/* Dashboard always first */}
          {navItems.filter(i => !i.group).map(({ to, label, Icon }) => (
            <NavLink key={to} to={to} className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all group ${
                isActive ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' : 'text-gray-400 hover:bg-gray-800 hover:text-white'
              }`
            }>
              {({ isActive }) => (
                <>
                  <Icon size={17} className={isActive ? 'text-white' : 'text-gray-500 group-hover:text-white'} />
                  <span className="flex-1">{label}</span>
                  {isActive && <ChevronRight size={14} className="text-blue-200" />}
                </>
              )}
            </NavLink>
          ))}

          {/* Grouped sections */}
          {Object.entries(grouped).map(([group, items]) => (
            <div key={group}>
              <p className={`text-xs font-semibold uppercase tracking-wider px-3 mb-1.5 ${groupColors[group] || 'text-gray-600'}`}>
                {group}
              </p>
              {items.map(({ to, label, Icon }) => (
                <NavLink key={to} to={to} className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all group ${
                    isActive ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                  }`
                }>
                  {({ isActive }) => (
                    <>
                      <Icon size={17} className={isActive ? 'text-white' : 'text-gray-500 group-hover:text-white'} />
                      <span className="flex-1">{label}</span>
                      {isActive && <ChevronRight size={14} className="text-blue-200" />}
                    </>
                  )}
                </NavLink>
              ))}
            </div>
          ))}
        </nav>

        <div className="px-4 py-4 border-t border-gray-800">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs font-bold">
              {(name[0] || email[0])?.toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-gray-200 text-xs font-medium truncate">{name}</p>
              <span className={`text-xs px-1.5 py-0.5 rounded border ${roleInfo.color}`}>{roleInfo.label}</span>
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
            Welcome back, <span className="font-semibold text-gray-800">{name}</span>
          </p>
          <span className={`text-xs font-medium px-2.5 py-1 rounded-full border ${roleInfo.color}`}>
            {roleInfo.label}
          </span>
        </header>
        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
