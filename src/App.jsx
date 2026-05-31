import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Landing from './pages/Landing'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Vehicles from './pages/Vehicles'
import Shipments from './pages/Shipments'
import Inventory from './pages/Inventory'
import Sales from './pages/Sales'
import Payments from './pages/Payments'
import Documents from './pages/Documents'
import TrackShipment from './pages/TrackShipment'
import Reports from './pages/Reports'
import CustomerPortal from './pages/CustomerPortal'
import ShippingPortal from './pages/ShippingPortal'
import MainLayout from './layouts/MainLayout'

function PrivateRoute({ children }) {
  return localStorage.getItem('token') ? children : <Navigate to="/login" replace />
}

function AppHome() {
  const role = localStorage.getItem('role')
  if (role === 'CUSTOMER') return <Navigate to="/customer" replace />
  if (role === 'SHIPPING_COMPANY') return <Navigate to="/app/shipping" replace />
  return <Navigate to="/app/dashboard" replace />
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/track" element={<TrackShipment />} />
        <Route path="/track/:trackingNumber" element={<TrackShipment />} />
        <Route path="/customer" element={<PrivateRoute><CustomerPortal /></PrivateRoute>} />
        <Route path="/app" element={<PrivateRoute><MainLayout /></PrivateRoute>}>
          <Route index element={<AppHome />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="shipping" element={<ShippingPortal />} />
          <Route path="vehicles" element={<Vehicles />} />
          <Route path="shipments" element={<Shipments />} />
          <Route path="inventory" element={<Inventory />} />
          <Route path="sales" element={<Sales />} />
          <Route path="payments" element={<Payments />} />
          <Route path="documents" element={<Documents />} />
          <Route path="reports" element={<Reports />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
