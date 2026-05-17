import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { authAPI } from '../api/services'
import { Car, ArrowLeft } from 'lucide-react'

const input = 'w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50'

export default function Login() {
  const [tab, setTab] = useState('login') // login | register | forgot | reset
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-gray-950 flex">
      {/* Left panel — car image */}
      <div className="hidden lg:block lg:w-1/2 relative overflow-hidden">
        <img
          src="/images/pexels-obi-onyeador-1787470-12906428.jpg"
          alt="Car"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-gray-950 via-gray-950/40 to-transparent" />
        <div className="absolute bottom-10 left-10 right-10">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <Car size={16} className="text-white" />
            </div>
            <span className="text-white font-bold text-lg">AutoTrack<span className="text-blue-400">360</span></span>
          </div>
          <p className="text-gray-300 text-sm leading-relaxed max-w-sm">
            End-to-end vehicle import and sales management platform.
          </p>
        </div>
      </div>

      {/* Right panel — form */}
      <div className="flex-1 flex items-center justify-center px-6 py-12 bg-white">
        <div className="w-full max-w-md">
          <div className="lg:hidden flex items-center gap-2 mb-8">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <Car size={16} className="text-white" />
            </div>
            <span className="text-gray-900 font-bold text-lg">AutoTrack<span className="text-blue-600">360</span></span>
          </div>

          {tab === 'login' && <LoginForm onRegister={() => setTab('register')} onForgot={() => setTab('forgot')} navigate={navigate} />}
          {tab === 'register' && <RegisterForm onBack={() => setTab('login')} />}
          {tab === 'forgot' && <ForgotForm onBack={() => setTab('login')} onOtpSent={() => setTab('reset')} />}
          {tab === 'reset' && <ResetForm onBack={() => setTab('login')} />}
        </div>
      </div>
    </div>
  )
}

function LoginForm({ onRegister, onForgot, navigate }) {
  const [form, setForm] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const { data } = await authAPI.login(form)
      localStorage.setItem('token', data.token)
      localStorage.setItem('email', data.email)
      localStorage.setItem('role', data.role)
      localStorage.setItem('name', data.name || data.email)
      navigate('/app/dashboard')
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <h2 className="text-2xl font-bold text-gray-900 mb-1">Welcome back</h2>
      <p className="text-gray-500 text-sm mb-8">Sign in to your account</p>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Email</label>
          <input type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className={input} placeholder="you@example.com" />
        </div>
        <div>
          <div className="flex justify-between mb-1">
            <label className="text-xs font-medium text-gray-600">Password</label>
            <button type="button" onClick={onForgot} className="text-xs text-blue-600 hover:underline">Forgot password?</button>
          </div>
          <input type="password" required value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} className={input} placeholder="••••••••" />
        </div>
        {error && <p className="text-red-500 text-sm">{error}</p>}
        <button type="submit" disabled={loading} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 rounded-lg text-sm transition-colors disabled:opacity-60">
          {loading ? 'Signing in...' : 'Sign In'}
        </button>
      </form>
      <p className="mt-6 text-center text-sm text-gray-500">
        Don't have an account?{' '}
        <button onClick={onRegister} className="text-blue-600 font-medium hover:underline">Create one</button>
      </p>

    </>
  )
}

function RegisterForm({ onBack }) {
  const [form, setForm] = useState({ email: '', password: '', phone: '', role: 'SALES' })
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await authAPI.register(form)
      setSuccess('Account created! You can now sign in.')
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <button onClick={onBack} className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 mb-6">
        <ArrowLeft size={15} /> Back to sign in
      </button>
      <h2 className="text-2xl font-bold text-gray-900 mb-1">Create account</h2>
      <p className="text-gray-500 text-sm mb-8">Fill in your details to get started</p>
      {success ? (
        <div className="bg-green-50 border border-green-200 text-green-700 rounded-xl p-4 text-sm">
          {success}
          <button onClick={onBack} className="block mt-3 text-blue-600 font-medium hover:underline">Sign in now →</button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Email *</label>
            <input type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className={input} />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Phone</label>
            <input type="tel" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className={input} placeholder="+1234567890" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Password *</label>
            <input type="password" required value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} className={input} />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Role</label>
            <select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} className={input}>
              <option value="SALES">Sales</option>
              <option value="LOGISTICS">Logistics</option>
              <option value="ADMIN">Admin</option>
            </select>
          </div>
          {error && <p className="text-red-500 text-sm">{error}</p>}
          <button type="submit" disabled={loading} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 rounded-lg text-sm disabled:opacity-60">
            {loading ? 'Creating...' : 'Create Account'}
          </button>
        </form>
      )}
    </>
  )
}

function ForgotForm({ onBack, onOtpSent }) {
  const [phone, setPhone] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await authAPI.forgotPassword({ email: phone })
      onOtpSent()
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to send OTP')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <button onClick={onBack} className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 mb-6">
        <ArrowLeft size={15} /> Back to sign in
      </button>
      <h2 className="text-2xl font-bold text-gray-900 mb-1">Forgot password</h2>
      <p className="text-gray-500 text-sm mb-8">Enter your email address to receive a 6-digit OTP.</p>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Email Address *</label>
          <input type="email" required value={phone} onChange={(e) => setPhone(e.target.value)} className={input} placeholder="you@example.com" />
        </div>
        {error && <p className="text-red-500 text-sm">{error}</p>}
        <button type="submit" disabled={loading} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 rounded-lg text-sm disabled:opacity-60">
          {loading ? 'Sending...' : 'Send OTP'}
        </button>
      </form>
    </>
  )
}

function ResetForm({ onBack }) {
  const [form, setForm] = useState({ phone: '', otp: '', newPassword: '' })
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await authAPI.resetPassword(form)
      setSuccess(true)
    } catch (err) {
      setError(err.response?.data?.error || 'Reset failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <button onClick={onBack} className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 mb-6">
        <ArrowLeft size={15} /> Back to sign in
      </button>
      <h2 className="text-2xl font-bold text-gray-900 mb-1">Reset password</h2>
      <p className="text-gray-500 text-sm mb-8">Enter the OTP sent to your phone and choose a new password.</p>
      {success ? (
        <div className="bg-green-50 border border-green-200 text-green-700 rounded-xl p-4 text-sm">
          Password reset successfully!
          <button onClick={onBack} className="block mt-3 text-blue-600 font-medium hover:underline">Sign in now →</button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Email Address *</label>
            <input type="email" required value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className={input} />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">OTP Code *</label>
            <input type="text" required maxLength={6} value={form.otp} onChange={(e) => setForm({ ...form, otp: e.target.value })} className={input} placeholder="123456" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">New Password *</label>
            <input type="password" required value={form.newPassword} onChange={(e) => setForm({ ...form, newPassword: e.target.value })} className={input} />
          </div>
          {error && <p className="text-red-500 text-sm">{error}</p>}
          <button type="submit" disabled={loading} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 rounded-lg text-sm disabled:opacity-60">
            {loading ? 'Resetting...' : 'Reset Password'}
          </button>
        </form>
      )}
    </>
  )
}
