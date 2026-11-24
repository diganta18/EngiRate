import React, { useState, useEffect, useRef } from 'react'
import { Subject, ForecastResult } from '../types'
import { exportElementAsPng } from '../lib/exportPng'
import { 
  Sparkles, 
  Download, 
  Share2, 
  AlertTriangle, 
  Moon, 
  ShieldCheck, 
  Check, 
  X, 
  Search, 
  RefreshCw,
  Clock,
  Film
} from 'lucide-react'

export const ForecastPage: React.FC = () => {
  const [subjects, setSubjects] = useState<Subject[]>([])
  const [selectedIds, setSelectedIds] = useState<number[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [deptFilter, setDeptFilter] = useState('All')

  const [loading, setLoading] = useState(true)
  const [calculating, setCalculating] = useState(false)
  const [forecast, setForecast] = useState<ForecastResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [exporting, setExporting] = useState(false)
  const [copied, setCopied] = useState(false)

  const posterRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    fetchSubjects()
  }, [])

  const fetchSubjects = async () => {
    try {
      const res = await fetch('/api/subjects?limit=100')
      if (res.ok) {
        const json = await res.json()
        setSubjects(json.subjects || [])
      }
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const toggleSelect = (id: number) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter(x => x !== id))
    } else {
      if (selectedIds.length >= 8) {
        setError('Maximum 8 subjects allowed in one semester forecast')
        return
      }
      setError(null)
      setSelectedIds([...selectedIds, id])
    }
  }

  const handleCalculate = async () => {
    if (selectedIds.length < 2) {
      setError('Please select at least 2 subjects to forecast your semester')
      return
    }

    setCalculating(true)
    setError(null)
    try {
      const res = await fetch('/api/forecast', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subjectIds: selectedIds }),
      })

      const json = await res.json()
      if (!res.ok) {
        setError(json.error || 'Failed to generate forecast')
      } else {
        setForecast(json.forecast)
        // Scroll smoothly to poster
        setTimeout(() => {
          posterRef.current?.scrollIntoView({ behavior: 'smooth' })
        }, 150)
      }
    } catch (err: any) {
      setError(err.message || 'Network error')
    } finally {
      setCalculating(false)
    }
  }

  const handleExportPng = async () => {
    if (!posterRef.current || !forecast) return
    setExporting(true)
    try {
      const filename = `EngiRate-Semester-Forecast-${forecast.title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`
      await exportElementAsPng(posterRef.current, filename, { backgroundColor: '#0A0A0A' })
    } catch (err) {
      console.error('PNG export failed', err)
    } finally {
      setExporting(false)
    }
  }

  const handleCopySummary = () => {
    if (!forecast) return
    const text = `🎬 *EngiRate Semester Forecast*\n\n*${forecast.title}* (${forecast.genre})\nCensor Rating: ${forecast.censorRating}\n\n📊 *Survival Index:* ${forecast.survivalIndex}/10\n🌙 *Estimated Sleep:* ${forecast.predictedSleepHours} hrs/night\n⚠️ *Hazard:* ${forecast.highestRiskSubject.acronym} (${forecast.highestRiskSubject.title})\n\n"${forecast.tagline}"\n\nCalculate yours at engirate.app/forecast`
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const filteredSubjects = subjects.filter(s => {
    const matchesSearch = s.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.acronym.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesDept = deptFilter === 'All' || s.departments.includes(deptFilter)
    return matchesSearch && matchesDept
  })

  const getCensorColor = (rating: string) => {
    switch (rating) {
      case 'U': return '#15803D'
      case 'PG-13': return '#78716C'
      case 'R': return '#D97706'
      case 'NC-17': return '#B91C1C'
      default: return '#141414'
    }
  }

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-12">
      {/* Page Title */}
      <div className="border-b border-[#E6E2DA] pb-4">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-amber-600" />
          <h1 className="font-serif text-3xl font-bold text-[#141414]">
            Semester Survival Forecast
          </h1>
        </div>
        <p className="text-xs font-mono text-[#666660] mt-1">
          Pick your upcoming 5–6 courses. The algorithm calculates your aggregate survival index and prints your official Semester Cinema Poster.
        </p>
      </div>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 text-red-800 text-xs font-mono rounded-sm flex items-center justify-between">
          <span>{error}</span>
          <button onClick={() => setError(null)} className="text-red-600 hover:text-black">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Subject Picker Section */}
      <section className="paper-card p-5 sm:p-6 rounded-sm bg-white border border-[#E6E2DA] space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-2 border-b border-[#E6E2DA] pb-3">
          <div>
            <h3 className="font-serif font-bold text-base text-[#141414]">
              Select Your Semester Curriculum
            </h3>
            <p className="text-[11px] font-mono text-[#666660]">
              Recommended: 5 to 6 subjects for standard engineering degree load
            </p>
          </div>
          <div className="flex items-center gap-2 font-mono text-xs">
            <span className={`px-2.5 py-1 rounded-sm border ${
              selectedIds.length >= 5
                ? 'bg-emerald-50 text-emerald-800 border-emerald-300 font-bold'
                : 'bg-neutral-100 text-[#666660] border-neutral-200'
            }`}>
              {selectedIds.length} Selected (Min 2, Max 8)
            </span>
            {selectedIds.length > 0 && (
              <button
                onClick={() => setSelectedIds([])}
                className="text-[11px] text-neutral-400 hover:text-red-600 underline"
              >
                Clear all
              </button>
            )}
          </div>
        </div>

        {/* Search & Department Filters */}
        <div className="flex items-center gap-3 flex-wrap">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="w-3.5 h-3.5 absolute left-3 top-3 text-neutral-400" />
            <input
              type="text"
              placeholder="Search by name or acronym (e.g. M3, OS, FLAT)..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-2 text-xs font-mono border border-[#E6E2DA] rounded-sm focus:outline-hidden focus:border-black"
            />
          </div>

          <div className="flex items-center gap-1 overflow-x-auto text-[11px] font-mono">
            {['All', 'CSE', 'IT', 'ECE', 'EE', 'ME', 'Civil', 'Common 1st Year'].map(dept => (
              <button
                key={dept}
                onClick={() => setDeptFilter(dept)}
                className={`px-2.5 py-1.5 rounded-sm border transition-colors ${
                  deptFilter === dept
                    ? 'bg-[#0A0A0A] text-white border-black font-semibold'
                    : 'bg-white text-[#666660] border-[#E6E2DA] hover:border-black'
                }`}
              >
                {dept}
              </button>
            ))}
          </div>
        </div>

        {/* Selected Tray Badges */}
        {selectedIds.length > 0 && (
          <div className="p-3 bg-[#FAF8F5] border border-[#E6E2DA] rounded-sm flex items-center gap-2 flex-wrap">
            <span className="font-mono text-[10px] uppercase tracking-wider text-[#666660] mr-1">
              Staged:
            </span>
            {selectedIds.map(id => {
              const subj = subjects.find(s => s.id === id)
              if (!subj) return null
              return (
                <span
                  key={id}
                  className="inline-flex items-center gap-1 text-xs font-mono px-2 py-0.5 rounded-sm bg-white border border-[#E6E2DA] text-[#141414]"
                >
                  <span className="font-bold">{subj.acronym}</span>
                  <button
                    onClick={() => toggleSelect(id)}
                    className="text-neutral-400 hover:text-black ml-0.5"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )
            })}
          </div>
        )}

        {/* Grid of Subjects to Pick */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5 max-h-[300px] overflow-y-auto p-1">
          {filteredSubjects.map(s => {
            const isSelected = selectedIds.includes(s.id)
            return (
              <button
                key={s.id}
                onClick={() => toggleSelect(s.id)}
                className={`p-2.5 rounded-sm border text-left transition-all flex items-start justify-between gap-1 group ${
                  isSelected
                    ? 'border-black bg-amber-50 shadow-xs'
                    : 'border-[#E6E2DA] bg-white hover:border-neutral-400'
                }`}
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="font-mono font-bold text-xs text-[#141414]">
                      {s.acronym}
                    </span>
                    <span
                      className="font-mono text-[9px] px-1 rounded-xs font-bold"
                      style={{ color: getCensorColor(s.censorRating) }}
                    >
                      {s.censorRating}
                    </span>
                  </div>
                  <p className="font-serif text-xs text-[#44403C] truncate mt-0.5">
                    {s.title}
                  </p>
                </div>
                <div className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 mt-0.5 ${
                  isSelected ? 'border-black bg-black text-white' : 'border-neutral-300'
                }`}>
                  {isSelected && <Check className="w-2.5 h-2.5" />}
                </div>
              </button>
            )
          })}
        </div>

        {/* Calculate Action */}
        <div className="pt-3 border-t border-[#E6E2DA] flex items-center justify-between">
          <span className="font-mono text-xs text-[#666660]">
            {selectedIds.length < 2
              ? 'Select at least 2 subjects to generate poster'
              : `Ready to compute forecast for ${selectedIds.length} subjects`}
          </span>

          <button
            onClick={handleCalculate}
            disabled={selectedIds.length < 2 || calculating}
            className="px-5 py-2.5 bg-[#0A0A0A] hover:bg-neutral-800 text-[#FAF8F5] text-xs font-mono font-semibold rounded-sm uppercase tracking-wider flex items-center gap-2 transition-colors disabled:opacity-40"
          >
            {calculating ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                <span>Simulating Exams...</span>
              </>
            ) : (
              <>
                <Film className="w-3.5 h-3.5 text-amber-400" />
                <span>Print Semester Poster</span>
              </>
            )}
          </button>
        </div>
      </section>

      {/* Generated Semester Movie Poster Section */}
      {forecast && (
        <section className="space-y-4 pt-4">
          <div className="flex items-center justify-between flex-wrap gap-2 border-b border-[#E6E2DA] pb-2">
            <div>
              <span className="font-mono text-[10px] uppercase font-bold tracking-widest text-[#666660]">
                Official Forecast Document
              </span>
              <h2 className="font-serif text-2xl font-bold text-[#141414]">
                Your Semester Cinematic Poster
              </h2>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleCopySummary}
                className="px-3.5 py-1.5 text-xs font-mono border border-[#E6E2DA] rounded-sm bg-white hover:border-black flex items-center gap-1.5 transition-colors"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Share2 className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied!' : 'Share Text'}</span>
              </button>

              <button
                onClick={handleExportPng}
                disabled={exporting}
                className="px-4 py-1.5 text-xs font-mono bg-[#0A0A0A] hover:bg-neutral-800 text-white rounded-sm font-semibold flex items-center gap-1.5 transition-colors disabled:opacity-50"
              >
                <Download className="w-3.5 h-3.5" />
                <span>{exporting ? 'Exporting PNG...' : 'Export Poster (PNG)'}</span>
              </button>
            </div>
          </div>

          {/* The High-Resolution 2:3 Cinematic Poster Container */}
          <div className="flex justify-center">
            <div
              ref={posterRef}
              className="w-full max-w-md bg-[#0A0A0A] text-[#FAF8F5] p-6 sm:p-8 rounded-sm shadow-2xl border border-neutral-800 space-y-6 relative overflow-hidden"
              style={{ fontFamily: 'Inter, sans-serif' }}
            >
              {/* Discrete Watermark for PNG Export */}
              <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
                <span className="font-mono text-[10px] uppercase tracking-widest text-neutral-400">
                  ENGIRATE SEMESTER ARCHIVE
                </span>
                <span
                  className="font-mono text-[10px] font-bold px-2 py-0.5 rounded border"
                  style={{
                    color: getCensorColor(forecast.censorRating),
                    borderColor: getCensorColor(forecast.censorRating),
                  }}
                >
                  {forecast.censorRating}
                </span>
              </div>

              {/* Poster Main Title & Genre */}
              <div className="text-center space-y-2 pt-2">
                <span className="font-mono text-[11px] uppercase tracking-widest text-amber-400 block font-semibold">
                  — {forecast.genre} —
                </span>
                <h1 className="font-serif text-3xl sm:text-4xl font-black tracking-tight text-[#FAF8F5] uppercase leading-tight">
                  {forecast.title}
                </h1>
                <p className="font-serif italic text-xs text-neutral-400 max-w-xs mx-auto">
                  "{forecast.tagline}"
                </p>
              </div>

              {/* Star Billing: The Subject Acronyms */}
              <div className="py-2.5 border-y border-neutral-800/80 text-center">
                <span className="font-mono text-[9px] uppercase tracking-widest text-neutral-400 block mb-1">
                  STARRING (CURRICULUM ENSEMBLE)
                </span>
                <p className="font-mono text-xs font-bold text-neutral-200 tracking-wider">
                  {forecast.subjects.map(s => s.acronym).join('  •  ')}
                </p>
              </div>

              {/* Key Forecast Gauges */}
              <div className="grid grid-cols-2 gap-3">
                {/* Survival Index */}
                <div className="p-3 bg-neutral-900 border border-neutral-800 rounded-sm text-center">
                  <span className="font-mono text-[10px] uppercase tracking-wider text-neutral-400 block">
                    Survival Probability
                  </span>
                  <div className="flex items-baseline justify-center gap-1 mt-1">
                    <span className="font-mono text-3xl font-bold text-amber-400">
                      {forecast.survivalIndex}
                    </span>
                    <span className="font-mono text-xs text-neutral-400">/10</span>
                  </div>
                  <span className="font-mono text-[10px] text-neutral-400 block mt-0.5">
                    Composite odds
                  </span>
                </div>

                {/* Predicted Sleep */}
                <div className="p-3 bg-neutral-900 border border-neutral-800 rounded-sm text-center">
                  <span className="font-mono text-[10px] uppercase tracking-wider text-neutral-400 block">
                    Estimated Sleep
                  </span>
                  <div className="flex items-baseline justify-center gap-1 mt-1">
                    <span className="font-mono text-3xl font-bold text-emerald-400">
                      {forecast.predictedSleepHours}
                    </span>
                    <span className="font-mono text-xs text-neutral-400">hrs</span>
                  </div>
                  <span className="font-mono text-[10px] text-neutral-400 block mt-0.5">
                    Per night (median)
                  </span>
                </div>
              </div>

              {/* Highest Risk Hazard Warning */}
              <div className="p-3 bg-red-950/40 border-l-3 border-l-red-500 border border-red-900/50 rounded-sm space-y-1">
                <div className="flex items-center gap-1.5 text-red-400">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  <span className="font-mono text-[10px] uppercase font-bold tracking-wider">
                    Maximum Hazard Alert
                  </span>
                </div>
                <p className="font-serif text-sm font-bold text-neutral-100">
                  {forecast.highestRiskSubject.acronym} — {forecast.highestRiskSubject.title}
                </p>
                <p className="font-mono text-[11px] text-neutral-300">
                  Rated {forecast.highestRiskSubject.censorRating}. Survival odds: {forecast.highestRiskSubject.avgSurvival}/10. Prioritize this syllabus first.
                </p>
              </div>

              {/* Satirical Survival Gear Checklist */}
              <div className="space-y-1.5 pt-1">
                <span className="font-mono text-[10px] uppercase tracking-widest text-neutral-400 block">
                  Mandatory Survival Kit
                </span>
                <ul className="space-y-1 font-mono text-xs text-neutral-300">
                  {forecast.survivalGear.map((item, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="text-amber-400 shrink-0">✓</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Poster Billing Block / Credits */}
              <div className="border-t border-neutral-800 pt-3 text-center space-y-1">
                <p className="font-mono text-[9px] uppercase tracking-widest text-neutral-400 leading-relaxed">
                  DIRECTED BY THE SYLLABUS COMMITTEE • SOUNDTRACK BY 3 AM CAFFEINE • PRODUCED IN BLOOD, SWEAT & RECURSION
                </p>
                <span className="font-mono text-[10px] text-neutral-400 font-bold block pt-1">
                  engirate.app/forecast
                </span>
              </div>
            </div>
          </div>
        </section>
      )}
    </div>
  )
}
