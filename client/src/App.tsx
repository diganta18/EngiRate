import React, { useState, useEffect } from 'react'
import { AuthProvider } from './context/AuthContext'
import { CompareProvider } from './context/CompareContext'
import { Navbar } from './components/Navbar'
import { InstantSearchModal } from './components/InstantSearchModal'
import { AuthModal } from './components/AuthModal'
import { ComparisonTray } from './components/ComparisonTray'
import { HomePage } from './pages/HomePage'
import { SubjectDetailPage } from './pages/SubjectDetailPage'
import { ChartsPage } from './pages/ChartsPage'
import { ProfilePage } from './pages/ProfilePage'
import { AdminPage } from './pages/AdminPage'
import { ComparePage } from './pages/ComparePage'
import { WatchlistsPage } from './pages/WatchlistsPage'
import { WatchlistDetailPage } from './pages/WatchlistDetailPage'

export const AppContent: React.FC = () => {
  const [currentPath, setCurrentPath] = useState(window.location.pathname)
  const [isSearchOpen, setIsSearchOpen] = useState(false)

  useEffect(() => {
    // SPA navigation handler
    const handlePopState = () => {
      setCurrentPath(window.location.pathname)
      window.scrollTo(0, 0)
    }

    // Intercept internal link clicks for smooth SPA transitions
    const handleLinkClick = (e: MouseEvent) => {
      const target = (e.target as HTMLElement).closest('a')
      if (
        target &&
        target.href &&
        target.origin === window.location.origin &&
        !target.hasAttribute('download') &&
        target.target !== '_blank' &&
        !e.ctrlKey &&
        !e.metaKey &&
        !e.shiftKey
      ) {
        e.preventDefault()
        const newPath = target.pathname + target.search + target.hash
        window.history.pushState(null, '', newPath)
        setCurrentPath(target.pathname)
        window.scrollTo(0, 0)
      }
    }

    // Global Cmd+K / Ctrl+K keyboard shortcut for search
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setIsSearchOpen(true)
      }
      if (e.key === 'Escape') {
        setIsSearchOpen(false)
      }
    }

    window.addEventListener('popstate', handlePopState)
    document.addEventListener('click', handleLinkClick)
    window.addEventListener('keydown', handleKeyDown)

    return () => {
      window.removeEventListener('popstate', handlePopState)
      document.removeEventListener('click', handleLinkClick)
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [])

  // Router matching
  const renderRoute = () => {
    // Subject Detail: /s/:slug
    if (currentPath.startsWith('/s/')) {
      const slug = currentPath.replace('/s/', '').split('/')[0]
      return <SubjectDetailPage slug={slug} />
    }

    // Charts: /charts
    if (currentPath === '/charts') {
      return <ChartsPage />
    }

    // Profile: /u/:username
    if (currentPath.startsWith('/u/')) {
      const username = currentPath.replace('/u/', '').split('/')[0]
      return <ProfilePage username={username} />
    }

    // Admin: /admin
    if (currentPath === '/admin') {
      return <AdminPage />
    }

    // Compare: /compare
    if (currentPath === '/compare') {
      return <ComparePage />
    }

    // Watchlist Detail: /lists/:slug
    if (currentPath.startsWith('/lists/') && currentPath !== '/lists') {
      const slug = currentPath.replace('/lists/', '').split('/')[0]
      return <WatchlistDetailPage slug={slug} />
    }

    // Watchlists: /lists
    if (currentPath === '/lists') {
      return <WatchlistsPage />
    }

    // Default: HomePage
    return <HomePage />
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF8F5] text-[#141414]">
      {/* Editorial Masthead Navbar */}
      <Navbar onOpenSearch={() => setIsSearchOpen(true)} currentPath={currentPath} />

      {/* Main Page Canvas */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {renderRoute()}
      </main>

      {/* Floating Side-by-Side Comparison Tray */}
      <ComparisonTray />

      {/* Editorial Colophon / Footer */}
      <footer className="border-t border-[#E6E2DA] bg-[#FAF8F5] mt-16 py-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-mono text-[#666660]">
          <div className="flex items-center gap-2">
            <span className="font-serif font-bold text-black text-sm">ENGIRATE</span>
            <span>— The B.Tech Engineering Cinema Journal</span>
          </div>
          <div>
            <span>CBSE Certified • Letterboxd meets IMDb for Engineering Students</span>
          </div>
        </div>
      </footer>

      {/* Global Modals */}
      <InstantSearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
      />
      <AuthModal />
    </div>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <CompareProvider>
        <AppContent />
      </CompareProvider>
    </AuthProvider>
  )
}
