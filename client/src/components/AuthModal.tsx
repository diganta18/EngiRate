import React, { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { X, AlertCircle } from 'lucide-react'

export const AuthModal: React.FC = () => {
  const { isAuthModalOpen, authModalTab, closeAuthModal, login, register } = useAuth()
  const [tab, setTab] = useState<'login' | 'register'>(authModalTab)
  
  // Login form
  const [loginEmail, setLoginEmail] = useState('')
  const [loginPassword, setLoginPassword] = useState('')

  // Register form
  const [regUsername, setRegUsername] = useState('')
  const [regEmail, setRegEmail] = useState('')
  const [regPassword, setRegPassword] = useState('')
  const [regBranch, setRegBranch] = useState('CSE')
  const [regGradYear, setRegGradYear] = useState(2026)

  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  // Sync tab with context
  React.useEffect(() => {
    setTab(authModalTab)
    setError(null)
  }, [authModalTab, isAuthModalOpen])

  if (!isAuthModalOpen) return null

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    setError(null)
    try {
      await login(loginEmail, loginPassword)
    } catch (err: any) {
      setError(err.message || 'Login failed')
    } finally {
      setSubmitting(false)
    }
  }

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    setError(null)
    try {
      await register({
        username: regUsername.trim(),
        email: regEmail.trim(),
        password: regPassword,
        branch: regBranch,
        gradYear: Number(regGradYear),
      })
    } catch (err: any) {
      setError(err.message || 'Registration failed')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="relative w-full max-w-md bg-[#FAF8F5] border border-[#141414] shadow-2xl rounded-sm p-6 sm:p-8">
        <button
          onClick={closeAuthModal}
          className="absolute top-4 right-4 p-1.5 text-neutral-400 hover:text-black transition-colors rounded-sm"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Tab Switcher */}
        <div className="flex border-b border-[#E6E2DA] mb-6">
          <button
            onClick={() => {
              setTab('login')
              setError(null)
            }}
            className={`pb-2.5 px-3 font-mono text-xs uppercase tracking-wider transition-colors ${
              tab === 'login'
                ? 'border-b-2 border-black font-bold text-black'
                : 'text-[#666660] hover:text-black'
            }`}
          >
            Sign In
          </button>
          <button
            onClick={() => {
              setTab('register')
              setError(null)
            }}
            className={`pb-2.5 px-3 font-mono text-xs uppercase tracking-wider transition-colors ${
              tab === 'register'
                ? 'border-b-2 border-black font-bold text-black'
                : 'text-[#666660] hover:text-black'
            }`}
          >
            Create Handle
          </button>
        </div>

        {/* Header */}
        <div className="mb-5">
          <h3 className="font-serif text-xl font-bold text-[#141414] tracking-tight">
            {tab === 'login' ? 'Welcome Back to the Ledger' : 'Claim Your Critic Handle'}
          </h3>
          <p className="text-xs text-[#666660] mt-1 font-serif italic">
            {tab === 'login'
              ? 'Access your rated subjects, survival logs, and voting history.'
              : 'Rate subjects, publish deadpan reviews, and build your Transcript.'}
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-rose-50 border border-rose-200 text-xs text-rose-800 rounded-sm flex items-start gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {tab === 'login' ? (
          <form onSubmit={handleLoginSubmit} className="space-y-4">
            <div className="space-y-1">
              <label className="block text-xs font-mono uppercase tracking-wider text-[#141414]">
                Email Address
              </label>
              <input
                type="email"
                required
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
                className="w-full text-xs p-2.5 bg-white border border-[#E6E2DA] rounded-sm focus:outline-none focus:border-black font-mono"
                placeholder="topper@college.edu"
              />
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-mono uppercase tracking-wider text-[#141414]">
                Password
              </label>
              <input
                type="password"
                required
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                className="w-full text-xs p-2.5 bg-white border border-[#E6E2DA] rounded-sm focus:outline-none focus:border-black"
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full mt-2 py-2.5 bg-[#0A0A0A] hover:bg-neutral-800 text-[#FAF8F5] text-xs font-mono font-medium uppercase tracking-wider rounded-sm transition-colors disabled:opacity-50"
            >
              {submitting ? 'Authenticating...' : 'Sign In'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleRegisterSubmit} className="space-y-3.5">
            <div className="space-y-1">
              <label className="block text-xs font-mono uppercase tracking-wider text-[#141414]">
                Pseudonymous Handle
              </label>
              <div className="relative">
                <span className="absolute left-2.5 top-2.5 text-xs font-mono text-[#666660]">@</span>
                <input
                  type="text"
                  required
                  pattern="^[a-zA-Z0-9_]{3,30}$"
                  title="3-30 letters, numbers, or underscores"
                  value={regUsername}
                  onChange={(e) => setRegUsername(e.target.value)}
                  className="w-full text-xs p-2.5 pl-6 bg-white border border-[#E6E2DA] rounded-sm focus:outline-none focus:border-black font-mono"
                  placeholder="cgpa_survivor"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-mono uppercase tracking-wider text-[#141414]">
                Email Address
              </label>
              <input
                type="email"
                required
                value={regEmail}
                onChange={(e) => setRegEmail(e.target.value)}
                className="w-full text-xs p-2.5 bg-white border border-[#E6E2DA] rounded-sm focus:outline-none focus:border-black font-mono"
                placeholder="critic@engirate.app"
              />
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-mono uppercase tracking-wider text-[#141414]">
                Password (min 8 chars)
              </label>
              <input
                type="password"
                required
                minLength={8}
                value={regPassword}
                onChange={(e) => setRegPassword(e.target.value)}
                className="w-full text-xs p-2.5 bg-white border border-[#E6E2DA] rounded-sm focus:outline-none focus:border-black"
                placeholder="••••••••"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="block text-xs font-mono uppercase tracking-wider text-[#141414]">
                  Branch
                </label>
                <select
                  value={regBranch}
                  onChange={(e) => setRegBranch(e.target.value)}
                  className="w-full text-xs p-2 bg-white border border-[#E6E2DA] rounded-sm focus:outline-none focus:border-black font-mono"
                >
                  <option value="CSE">CSE</option>
                  <option value="IT">IT</option>
                  <option value="ECE">ECE</option>
                  <option value="EE">EE</option>
                  <option value="ME">ME</option>
                  <option value="Civil">Civil</option>
                  <option value="Common 1st Year">1st Year</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-mono uppercase tracking-wider text-[#141414]">
                  Grad Year
                </label>
                <input
                  type="number"
                  min="2020"
                  max="2032"
                  value={regGradYear}
                  onChange={(e) => setRegGradYear(Number(e.target.value))}
                  className="w-full text-xs p-2 bg-white border border-[#E6E2DA] rounded-sm focus:outline-none focus:border-black font-mono"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full mt-3 py-2.5 bg-[#0A0A0A] hover:bg-neutral-800 text-[#FAF8F5] text-xs font-mono font-medium uppercase tracking-wider rounded-sm transition-colors disabled:opacity-50"
            >
              {submitting ? 'Creating Profile...' : 'Claim Handle'}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}
