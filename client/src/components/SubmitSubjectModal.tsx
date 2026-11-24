import React, { useState } from 'react'
import { createPortal } from 'react-dom'
import { useAuth } from '../context/AuthContext'
import { X, Send, Film, AlertCircle, CheckCircle } from 'lucide-react'

interface SubmitSubjectModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess?: () => void
}

const DEPARTMENTS = ['Common 1st Year', 'CSE', 'IT', 'ECE', 'EE', 'ME', 'Civil']
const CENSOR_RATINGS = [
  { rating: 'U', desc: 'Pure Chill (Certified GPA Farmer)' },
  { rating: 'PG-13', desc: 'Minor Headache (Standard Effort)' },
  { rating: 'R', desc: 'Mathematical Trauma (Severe Study Needed)' },
  { rating: 'NC-17', desc: 'Backlog Territory (Existential Crisis)' },
] as const

export const SubmitSubjectModal: React.FC<SubmitSubjectModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const { user, openAuthModal } = useAuth()

  const [title, setTitle] = useState('')
  const [acronym, setAcronym] = useState('')
  const [typicalYear, setTypicalYear] = useState<number>(3)
  const [typicalSem, setTypicalSem] = useState<number>(5)
  const [subjectType, setSubjectType] = useState<'Core' | 'Lab' | 'Elective'>('Core')
  const [selectedDepts, setSelectedDepts] = useState<string[]>(['CSE'])
  const [censorRating, setCensorRating] = useState<'U' | 'PG-13' | 'R' | 'NC-17'>('PG-13')
  const [tagline, setTagline] = useState('')
  const [aliases, setAliases] = useState('')

  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [successMsg, setSuccessMsg] = useState<string | null>(null)

  if (!isOpen) return null

  const toggleDept = (dept: string) => {
    if (selectedDepts.includes(dept)) {
      if (selectedDepts.length > 1) {
        setSelectedDepts(selectedDepts.filter(d => d !== dept))
      }
    } else {
      setSelectedDepts([...selectedDepts, dept])
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) {
      openAuthModal('login')
      return
    }

    if (!title.trim() || !acronym.trim()) {
      setError('Title and Acronym are required')
      return
    }

    setSubmitting(true)
    setError(null)
    setSuccessMsg(null)

    const aliasList = aliases
      .split(',')
      .map(a => a.trim())
      .filter(Boolean)

    try {
      const res = await fetch('/api/subjects/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          title: title.trim(),
          acronym: acronym.trim().toUpperCase(),
          typicalYear,
          typicalSem,
          subjectType,
          departments: selectedDepts,
          censorRating,
          tagline: tagline.trim() || undefined,
          aliases: aliasList,
        })
      })

      const json = await res.json()
      if (!res.ok) {
        setError(json.error || 'Failed to submit subject')
      } else {
        setSuccessMsg(json.message)
        setTimeout(() => {
          onClose()
          if (onSuccess) onSuccess()
        }, 1800)
      }
    } catch (err: any) {
      setError(err.message || 'Network error')
    } finally {
      setSubmitting(false)
    }
  }

  return createPortal(
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
      <div className="paper-card w-full max-w-lg bg-white p-6 sm:p-7 rounded-sm shadow-2xl border border-[#E6E2DA] space-y-4 my-auto max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-[#E6E2DA] pb-3">
          <div>
            <div className="flex items-center gap-2">
              <Film className="w-4 h-4 text-amber-600" />
              <h3 className="font-serif font-bold text-xl text-[#141414]">
                Propose a Missing Subject
              </h3>
            </div>
            <p className="text-xs font-mono text-[#666660] mt-0.5">
              Crowd-sourced addition for your college curriculum or department
            </p>
          </div>
          <button onClick={onClose} className="text-neutral-400 hover:text-black">
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 text-red-800 text-xs font-mono rounded-sm flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {successMsg && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-mono rounded-sm flex items-center gap-2">
            <CheckCircle className="w-4 h-4 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs font-mono">
          {/* Title & Acronym */}
          <div className="grid grid-cols-3 gap-3">
            <div className="col-span-2">
              <label className="block uppercase text-[10px] text-[#666660] mb-1">
                Subject Title *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Cloud Computing & DevOps"
                value={title}
                onChange={e => setTitle(e.target.value)}
                className="w-full p-2.5 border border-[#E6E2DA] rounded-sm focus:outline-hidden focus:border-black"
              />
            </div>
            <div>
              <label className="block uppercase text-[10px] text-[#666660] mb-1">
                Acronym *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. CCDO"
                value={acronym}
                onChange={e => setAcronym(e.target.value)}
                className="w-full p-2.5 border border-[#E6E2DA] rounded-sm uppercase focus:outline-hidden focus:border-black"
              />
            </div>
          </div>

          {/* Departments */}
          <div>
            <label className="block uppercase text-[10px] text-[#666660] mb-1">
              Departments *
            </label>
            <div className="flex flex-wrap gap-1.5">
              {DEPARTMENTS.map(dept => {
                const isSelected = selectedDepts.includes(dept)
                return (
                  <button
                    type="button"
                    key={dept}
                    onClick={() => toggleDept(dept)}
                    className={`px-2.5 py-1 rounded-sm border text-[11px] transition-colors ${
                      isSelected
                        ? 'bg-[#0A0A0A] text-white border-black font-semibold'
                        : 'bg-[#FAF8F5] text-[#666660] border-[#E6E2DA] hover:border-black'
                    }`}
                  >
                    {dept}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Year, Sem, Type */}
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block uppercase text-[10px] text-[#666660] mb-1">
                Typical Year
              </label>
              <select
                value={typicalYear}
                onChange={e => setTypicalYear(parseInt(e.target.value))}
                className="w-full p-2 border border-[#E6E2DA] rounded-sm bg-white focus:outline-hidden"
              >
                <option value={1}>1st Year</option>
                <option value={2}>2nd Year</option>
                <option value={3}>3rd Year</option>
                <option value={4}>4th Year</option>
              </select>
            </div>

            <div>
              <label className="block uppercase text-[10px] text-[#666660] mb-1">
                Typical Sem
              </label>
              <select
                value={typicalSem}
                onChange={e => setTypicalSem(parseInt(e.target.value))}
                className="w-full p-2 border border-[#E6E2DA] rounded-sm bg-white focus:outline-hidden"
              >
                {[1, 2, 3, 4, 5, 6, 7, 8].map(s => (
                  <option key={s} value={s}>Semester 0{s}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block uppercase text-[10px] text-[#666660] mb-1">
                Subject Type
              </label>
              <select
                value={subjectType}
                onChange={e => setSubjectType(e.target.value as any)}
                className="w-full p-2 border border-[#E6E2DA] rounded-sm bg-white focus:outline-hidden"
              >
                <option value="Core">Core</option>
                <option value="Elective">Elective</option>
                <option value="Lab">Lab</option>
              </select>
            </div>
          </div>

          {/* Suggested Censor Rating */}
          <div>
            <label className="block uppercase text-[10px] text-[#666660] mb-1">
              Suggested Censor Rating
            </label>
            <div className="grid grid-cols-2 gap-2">
              {CENSOR_RATINGS.map(c => {
                const isSelected = censorRating === c.rating
                return (
                  <button
                    type="button"
                    key={c.rating}
                    onClick={() => setCensorRating(c.rating as any)}
                    className={`p-2 rounded-sm border text-left transition-colors ${
                      isSelected
                        ? 'border-black bg-amber-50/50'
                        : 'border-[#E6E2DA] bg-[#FAF8F5] hover:border-black'
                    }`}
                  >
                    <span className="font-bold text-xs block text-[#141414]">
                      {c.rating}
                    </span>
                    <span className="text-[10px] text-[#666660] block leading-tight">
                      {c.desc}
                    </span>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Tagline */}
          <div>
            <label className="block uppercase text-[10px] text-[#666660] mb-1">
              Deadpan Editorial Tagline (Optional)
            </label>
            <input
              type="text"
              placeholder="e.g. When a single floating gate causes an existential crisis."
              value={tagline}
              onChange={e => setTagline(e.target.value)}
              className="w-full p-2.5 border border-[#E6E2DA] rounded-sm focus:outline-hidden focus:border-black"
            />
          </div>

          {/* Aliases */}
          <div>
            <label className="block uppercase text-[10px] text-[#666660] mb-1">
              Nicknames / Aliases (Comma separated)
            </label>
            <input
              type="text"
              placeholder="e.g. Cloud, DevOps, AWS Class"
              value={aliases}
              onChange={e => setAliases(e.target.value)}
              className="w-full p-2.5 border border-[#E6E2DA] rounded-sm focus:outline-hidden focus:border-black"
            />
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#E6E2DA]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-[#E6E2DA] text-[#666660] hover:text-black rounded-sm"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2 bg-[#0A0A0A] hover:bg-neutral-800 text-white font-semibold rounded-sm flex items-center gap-1.5 disabled:opacity-50"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{submitting ? 'Submitting...' : 'Submit Proposal'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  )
}
