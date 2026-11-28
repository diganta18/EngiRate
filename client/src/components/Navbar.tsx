import React, { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { Search, User, LogOut, ShieldCheck, Film, Plus, Sparkles, Menu, X } from 'lucide-react'
import { SubmitSubjectModal } from './SubmitSubjectModal'

interface NavbarProps {
  onOpenSearch: () => void
  currentPath?: string
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenSearch, currentPath = '/' }) => {
  const { user, logout, openAuthModal } = useAuth()
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [isSubmitOpen, setIsSubmitOpen] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <header className="sticky top-0 z-40 bg-[#FAF8F5]/90 backdrop-blur-md border-b border-[#E6E2DA]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        {/* Left: Deadpan Editorial Logo */}
        <div className="flex items-center gap-6">
          <a href="/" className="flex items-center gap-2 group">
            <div className="w-7 h-7 bg-[#0A0A0A] rounded-xs flex items-center justify-center text-[#FAF8F5] font-serif font-bold text-base shadow-xs group-hover:bg-neutral-800 transition-colors">
              E
            </div>
            <div>
              <span className="font-serif font-bold text-lg sm:text-xl tracking-tight text-[#141414] block leading-none">
                ENGIRATE
              </span>
              <span className="font-mono text-[9px] uppercase tracking-widest text-[#666660] block mt-0.5">
                The B.Tech Cinema Journal
              </span>
            </div>
          </a>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center gap-5 text-xs font-mono tracking-wider uppercase">
            <a
              href="/"
              className={`transition-colors hover:text-black ${
                currentPath === '/' ? 'text-black font-semibold border-b-2 border-black pb-0.5' : 'text-[#666660]'
              }`}
            >
              Catalog
            </a>
            <a
              href="/charts"
              className={`transition-colors hover:text-black ${
                currentPath === '/charts' ? 'text-black font-semibold border-b-2 border-black pb-0.5' : 'text-[#666660]'
              }`}
            >
              Leaderboards
            </a>
            <a
              href="/lists"
              className={`transition-colors hover:text-black ${
                currentPath.startsWith('/lists') ? 'text-black font-semibold border-b-2 border-black pb-0.5' : 'text-[#666660]'
              }`}
            >
              Watchlists
            </a>
            <a
              href="/forecast"
              className={`transition-colors hover:text-black flex items-center gap-1 ${
                currentPath === '/forecast' ? 'text-black font-semibold border-b-2 border-black pb-0.5' : 'text-[#666660]'
              }`}
            >
              <Sparkles className="w-3 h-3 text-amber-600" />
              <span>Forecast</span>
            </a>
          </nav>
        </div>

        {/* Right: Propose Button, Instant Search & Auth */}
        <div className="flex items-center gap-2.5">
          {/* Propose Subject Button */}
          <button
            onClick={() => {
              if (!user) openAuthModal('login')
              else setIsSubmitOpen(true)
            }}
            className="hidden sm:flex items-center gap-1 px-2.5 py-1.5 border border-[#E6E2DA] hover:border-black rounded-sm text-xs font-mono text-[#141414] bg-white transition-colors"
            title="Propose a missing engineering subject to catalog"
          >
            <Plus className="w-3 h-3 text-amber-600" />
            <span>Propose</span>
          </button>

          {/* Search Trigger */}
          <button
            onClick={onOpenSearch}
            className="flex items-center gap-2 px-3 py-1.5 bg-white border border-[#E6E2DA] hover:border-neutral-400 rounded-sm text-xs font-mono text-[#666660] transition-colors"
            title="Search subjects by name or alias (OS, DSA, M3...)"
          >
            <Search className="w-3.5 h-3.5 text-neutral-400" />
            <span className="hidden sm:inline">Search (e.g. M3, OS)</span>
            <kbd className="hidden sm:inline-block bg-[#FAF8F5] text-[10px] px-1 py-0.2 rounded border border-[#E6E2DA]">
              ⌘K
            </kbd>
          </button>

          {/* Auth Button or User Menu */}
          {user ? (
            <div className="relative">
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center gap-2 px-3 py-1.5 bg-white border border-[#E6E2DA] rounded-sm hover:border-black transition-colors text-xs font-mono font-medium"
              >
                <User className="w-3.5 h-3.5 text-neutral-500" />
                <span className="truncate max-w-[100px]">@{user.username}</span>
              </button>

              {dropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white border border-[#E6E2DA] shadow-xl rounded-sm py-1.5 text-xs font-mono z-50">
                  <div className="px-3 py-1.5 border-b border-[#E6E2DA] text-[#666660] text-[10px]">
                    Signed in as <strong className="text-black block text-xs">@{user.username}</strong>
                  </div>
                  <a
                    href={`/u/${user.username}`}
                    onClick={() => setDropdownOpen(false)}
                    className="flex items-center gap-2 px-3 py-2 hover:bg-[#FAF8F5] text-[#141414] transition-colors"
                  >
                    <Film className="w-3.5 h-3.5" />
                    <span>The Transcript (Profile)</span>
                  </a>
                  {user.role === 'admin' && (
                    <a
                      href="/admin"
                      onClick={() => setDropdownOpen(false)}
                      className="flex items-center gap-2 px-3 py-2 hover:bg-[#FAF8F5] text-amber-800 transition-colors"
                    >
                      <ShieldCheck className="w-3.5 h-3.5" />
                      <span>Admin Moderation</span>
                    </a>
                  )}
                  <button
                    onClick={() => {
                      setDropdownOpen(false)
                      logout()
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 hover:bg-rose-50 text-rose-700 transition-colors text-left"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Sign Out</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <button
                onClick={() => openAuthModal('login')}
                className="text-xs font-mono text-[#666660] hover:text-black px-2 py-1.5 transition-colors"
              >
                Sign In
              </button>
              <button
                onClick={() => openAuthModal('register')}
                className="text-xs font-mono font-medium bg-[#0A0A0A] hover:bg-neutral-800 text-[#FAF8F5] px-3 py-1.5 rounded-sm transition-colors uppercase tracking-wider"
              >
                Join
              </button>
            </div>
          )}

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-1.5 border border-[#E6E2DA] rounded-sm bg-white text-[#141414] hover:border-black transition-colors"
            aria-label="Toggle mobile navigation"
          >
            {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation Drawer */}
      {mobileMenuOpen && (
        <nav className="md:hidden border-t border-[#E6E2DA] bg-[#FAF8F5] px-4 py-3 space-y-2 text-xs font-mono uppercase tracking-wider">
          <a
            href="/"
            onClick={() => setMobileMenuOpen(false)}
            className={`block py-1.5 ${currentPath === '/' ? 'text-black font-bold' : 'text-[#666660]'}`}
          >
            Catalog
          </a>
          <a
            href="/charts"
            onClick={() => setMobileMenuOpen(false)}
            className={`block py-1.5 ${currentPath === '/charts' ? 'text-black font-bold' : 'text-[#666660]'}`}
          >
            Leaderboards
          </a>
          <a
            href="/lists"
            onClick={() => setMobileMenuOpen(false)}
            className={`block py-1.5 ${currentPath.startsWith('/lists') ? 'text-black font-bold' : 'text-[#666660]'}`}
          >
            Watchlists
          </a>
          <a
            href="/forecast"
            onClick={() => setMobileMenuOpen(false)}
            className={`flex items-center gap-1.5 py-1.5 ${currentPath === '/forecast' ? 'text-black font-bold' : 'text-[#666660]'}`}
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-600" />
            <span>Semester Forecast</span>
          </a>
          <button
            onClick={() => {
              setMobileMenuOpen(false)
              if (!user) openAuthModal('login')
              else setIsSubmitOpen(true)
            }}
            className="w-full text-left flex items-center gap-1.5 py-1.5 text-[#141414] font-semibold border-t border-[#E6E2DA] pt-2.5"
          >
            <Plus className="w-3.5 h-3.5 text-amber-600" />
            <span>Propose Missing Subject</span>
          </button>
        </nav>
      )}

      {/* Propose Subject Modal */}
      <SubmitSubjectModal
        isOpen={isSubmitOpen}
        onClose={() => setIsSubmitOpen(false)}
      />
    </header>
  )
}
