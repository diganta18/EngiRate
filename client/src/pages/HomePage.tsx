import React, { useState, useEffect } from 'react'
import { Subject } from '../types'
import { subjectsApi, chartsApi } from '../lib/api'
import { SubjectPoster } from '../components/SubjectPoster'
import { ArrowRight, Flame, Trophy } from 'lucide-react'

export const HomePage: React.FC = () => {
  const [subjects, setSubjects] = useState<Subject[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)

  // Filters
  const [dept, setDept] = useState<string>('')
  const [sem, setSem] = useState<string>('')
  const [type, setType] = useState<string>('')
  const [sort, setSort] = useState<string>('weighted')

  // Top Charts Snapshot
  const [topFame, setTopFame] = useState<Subject[]>([])
  const [topPain, setTopPain] = useState<Subject[]>([])

  useEffect(() => {
    // Fetch snapshots
    chartsApi.getChart('hall-of-fame').then(res => setTopFame(res.subjects.slice(0, 3))).catch(() => {})
    chartsApi.getChart('hall-of-pain').then(res => setTopPain(res.subjects.slice(0, 3))).catch(() => {})
  }, [])

  useEffect(() => {
    fetchSubjects()
  }, [dept, sem, type, sort, page])

  const fetchSubjects = async () => {
    setLoading(true)
    try {
      const res = await subjectsApi.getAll({
        dept: dept || undefined,
        sem: sem || undefined,
        type: type || undefined,
        sort,
        page,
      })
      setSubjects(res.subjects)
      setTotal(res.total)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const departments = ['Common 1st Year', 'CSE', 'IT', 'ECE', 'EE', 'ME', 'Civil']

  return (
    <div className="space-y-12">
      {/* Editorial Hero Section */}
      <section className="text-center py-10 sm:py-16 border-b border-[#E6E2DA] max-w-4xl mx-auto space-y-4 px-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FAF8F5] border border-[#E6E2DA] text-[11px] font-mono text-[#666660]">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
          <span>Vol. IV • Semester Examinations Classification Board</span>
        </div>

        <h1 className="font-serif text-4xl sm:text-6xl font-bold tracking-tight text-[#141414] leading-[1.08]">
          Prestige cinema critique for B.Tech subjects.
        </h1>

        <p className="font-serif italic text-base sm:text-lg text-[#666660] max-w-2xl mx-auto leading-relaxed">
          Because Engineering Mathematics III deserves the cinematic gravity of The Godfather, and Environmental Engineering is the ultimate GPA farmer.
        </p>

        <div className="flex items-center justify-center gap-6 pt-4 font-mono text-xs text-[#666660]">
          <div>
            <strong className="text-black text-sm block">30+</strong>
            Iconic Subjects
          </div>
          <div className="w-px h-6 bg-[#E6E2DA]" />
          <div>
            <strong className="text-black text-sm block">4-Axis</strong>
            Survival Metric
          </div>
          <div className="w-px h-6 bg-[#E6E2DA]" />
          <div>
            <strong className="text-black text-sm block">Zero Meme</strong>
            Editorial Calm
          </div>
        </div>
      </section>

      {/* Featured Leaderboard Highlights */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Hall of Fame Snapshot */}
        <div className="paper-card p-5 rounded-sm">
          <div className="flex items-center justify-between pb-3 border-b border-[#E6E2DA] mb-4">
            <div className="flex items-center gap-2">
              <Trophy className="w-4 h-4 text-amber-600" />
              <h2 className="font-serif font-bold text-base text-[#141414]">The Hall of Fame</h2>
            </div>
            <a href="/charts" className="text-xs font-mono text-[#666660] hover:text-black flex items-center gap-1">
              <span>View All</span>
              <ArrowRight className="w-3 h-3" />
            </a>
          </div>

          <div className="space-y-3">
            {topFame.map((sub, idx) => {
              const depts = typeof sub.departments === 'string' ? JSON.parse(sub.departments) : sub.departments
              return (
                <a
                  key={sub.id}
                  href={`/s/${sub.slug}`}
                  className="flex items-center justify-between p-2 rounded hover:bg-[#FAF8F5] transition-colors group"
                >
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-xs font-bold text-[#666660] w-4">
                      0{idx + 1}
                    </span>
                    <div>
                      <h4 className="font-serif font-bold text-sm text-[#141414] group-hover:underline">
                        {sub.title}
                      </h4>
                      <span className="text-[11px] font-mono text-[#666660]">
                        {sub.acronym} • {depts[0]}
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="font-mono font-bold text-xs text-amber-700">
                      {sub.weightedScore > 0 ? sub.weightedScore.toFixed(1) : '—'}/10
                    </span>
                  </div>
                </a>
              )
            })}
          </div>
        </div>

        {/* Hall of Pain Snapshot */}
        <div className="paper-card p-5 rounded-sm">
          <div className="flex items-center justify-between pb-3 border-b border-[#E6E2DA] mb-4">
            <div className="flex items-center gap-2">
              <Flame className="w-4 h-4 text-rose-600" />
              <h2 className="font-serif font-bold text-base text-[#141414]">The Hall of Pain</h2>
            </div>
            <a href="/charts" className="text-xs font-mono text-[#666660] hover:text-black flex items-center gap-1">
              <span>View All</span>
              <ArrowRight className="w-3 h-3" />
            </a>
          </div>

          <div className="space-y-3">
            {topPain.map((sub, idx) => {
              const depts = typeof sub.departments === 'string' ? JSON.parse(sub.departments) : sub.departments
              return (
                <a
                  key={sub.id}
                  href={`/s/${sub.slug}`}
                  className="flex items-center justify-between p-2 rounded hover:bg-[#FAF8F5] transition-colors group"
                >
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-xs font-bold text-[#666660] w-4">
                      0{idx + 1}
                    </span>
                    <div>
                      <h4 className="font-serif font-bold text-sm text-[#141414] group-hover:underline">
                        {sub.title}
                      </h4>
                      <span className="text-[11px] font-mono text-[#666660]">
                        {sub.acronym} • Rated {sub.censorRating}
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="font-mono font-bold text-xs text-rose-700">
                      Melt: {sub.avgBrainMelt.toFixed(1)}/10
                    </span>
                  </div>
                </a>
              )
            })}
          </div>
        </div>
      </section>

      {/* Catalog Filter Bar */}
      <section className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#E6E2DA] pb-4">
          <div>
            <h2 className="font-serif text-2xl font-bold text-[#141414]">Academic Catalog</h2>
            <p className="text-xs text-[#666660] font-mono mt-0.5">
              Showing {subjects.length} of {total} catalogued curriculum subjects
            </p>
          </div>

          {/* Filter Controls */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Dept Filter */}
            <select
              value={dept}
              onChange={(e) => {
                setDept(e.target.value)
                setPage(1)
              }}
              className="text-xs font-mono bg-white border border-[#E6E2DA] rounded-sm px-2.5 py-1.5 focus:outline-none focus:border-black"
            >
              <option value="">All Branches</option>
              {departments.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>

            {/* Semester Filter */}
            <select
              value={sem}
              onChange={(e) => {
                setSem(e.target.value)
                setPage(1)
              }}
              className="text-xs font-mono bg-white border border-[#E6E2DA] rounded-sm px-2.5 py-1.5 focus:outline-none focus:border-black"
            >
              <option value="">All Semesters</option>
              {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
                <option key={s} value={s}>
                  Sem {s}
                </option>
              ))}
            </select>

            {/* Type Filter */}
            <select
              value={type}
              onChange={(e) => {
                setType(e.target.value)
                setPage(1)
              }}
              className="text-xs font-mono bg-white border border-[#E6E2DA] rounded-sm px-2.5 py-1.5 focus:outline-none focus:border-black"
            >
              <option value="">All Types</option>
              <option value="Core">Core</option>
              <option value="Elective">Elective</option>
              <option value="Lab">Lab</option>
            </select>

            {/* Sort Order */}
            <select
              value={sort}
              onChange={(e) => {
                setSort(e.target.value)
                setPage(1)
              }}
              className="text-xs font-mono bg-white border border-[#E6E2DA] rounded-sm px-2.5 py-1.5 focus:outline-none focus:border-black font-semibold text-neutral-800"
            >
              <option value="weighted">Bayesian Weighted Score</option>
              <option value="brain_melt">Highest Brain Melt</option>
              <option value="survival">Highest 1-Night Survival</option>
              <option value="votes">Most Community Votes</option>
            </select>
          </div>
        </div>

        {/* Subjects Poster Grid */}
        {loading ? (
          <div className="py-20 text-center font-mono text-xs text-[#666660]">
            Consulting syllabus records...
          </div>
        ) : subjects.length === 0 ? (
          <div className="paper-card p-12 text-center rounded-sm space-y-2">
            <h3 className="font-serif text-lg font-bold text-[#141414]">No subjects found</h3>
            <p className="text-xs font-mono text-[#666660]">
              Try resetting branch or semester filters to broaden results.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-6">
            {subjects.map((sub) => {
              const depts = typeof sub.departments === 'string' ? JSON.parse(sub.departments) : sub.departments
              return (
                <a
                  key={sub.id}
                  href={`/s/${sub.slug}`}
                  className="group flex flex-col items-center transition-transform duration-200 hover:-translate-y-1"
                >
                  <SubjectPoster
                    acronym={sub.acronym}
                    title={sub.title}
                    subjectType={sub.subjectType}
                    censorRating={sub.censorRating}
                    departments={depts}
                    typicalSem={sub.typicalSem}
                    size="md"
                    className="w-full h-auto aspect-[2/3]"
                  />

                  {/* Card Metadata */}
                  <div className="w-full mt-2.5 text-left space-y-0.5">
                    <div className="flex items-baseline justify-between">
                      <span className="font-serif font-bold text-xs text-[#141414] group-hover:underline truncate max-w-[70%]">
                        {sub.title}
                      </span>
                      <span className="font-mono font-bold text-xs text-[#141414]">
                        {sub.weightedScore > 0 ? sub.weightedScore.toFixed(1) : '—'}
                      </span>
                    </div>

                    <p className="text-[11px] font-serif italic text-[#666660] line-clamp-1 leading-snug">
                      {sub.tagline || `${depts[0]} • Sem ${sub.typicalSem}`}
                    </p>
                  </div>
                </a>
              )
            })}
          </div>
        )}

        {/* Pagination */}
        {total > 20 && (
          <div className="flex justify-center items-center gap-3 pt-6 font-mono text-xs">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-3 py-1.5 bg-white border border-[#E6E2DA] rounded-sm disabled:opacity-40"
            >
              Previous
            </button>
            <span className="text-[#666660]">
              Page {page} of {Math.ceil(total / 20)}
            </span>
            <button
              onClick={() => setPage((p) => p + 1)}
              disabled={page >= Math.ceil(total / 20)}
              className="px-3 py-1.5 bg-white border border-[#E6E2DA] rounded-sm disabled:opacity-40"
            >
              Next
            </button>
          </div>
        )}
      </section>
    </div>
  )
}
