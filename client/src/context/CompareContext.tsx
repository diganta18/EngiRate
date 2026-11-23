import React, { createContext, useContext, useState, useEffect } from 'react'

interface CompareContextType {
  selectedSlugs: string[]
  addSubject: (slug: string) => void
  removeSubject: (slug: string) => void
  clearSubjects: () => void
  isInCompare: (slug: string) => boolean
}

const CompareContext = createContext<CompareContextType | undefined>(undefined)

export const CompareProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [selectedSlugs, setSelectedSlugs] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('engirate_compare_tray')
      return saved ? JSON.parse(saved) : []
    } catch {
      return []
    }
  })

  useEffect(() => {
    localStorage.setItem('engirate_compare_tray', JSON.stringify(selectedSlugs))
  }, [selectedSlugs])

  const addSubject = (slug: string) => {
    const clean = slug.toLowerCase()
    if (selectedSlugs.includes(clean)) return
    if (selectedSlugs.length >= 4) {
      alert('You can compare a maximum of 4 subjects side-by-side.')
      return
    }
    setSelectedSlugs([...selectedSlugs, clean])
  }

  const removeSubject = (slug: string) => {
    const clean = slug.toLowerCase()
    setSelectedSlugs(selectedSlugs.filter((s) => s !== clean))
  }

  const clearSubjects = () => {
    setSelectedSlugs([])
  }

  const isInCompare = (slug: string) => {
    return selectedSlugs.includes(slug.toLowerCase())
  }

  return (
    <CompareContext.Provider
      value={{
        selectedSlugs,
        addSubject,
        removeSubject,
        clearSubjects,
        isInCompare,
      }}
    >
      {children}
    </CompareContext.Provider>
  )
}

export const useCompare = () => {
  const context = useContext(CompareContext)
  if (!context) {
    throw new Error('useCompare must be used within a CompareProvider')
  }
  return context
}
