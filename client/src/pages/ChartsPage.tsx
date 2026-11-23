import React, { useState, useEffect } from 'react'
import { Subject } from '../types'
import { chartsApi } from '../lib/api'
import { SubjectPoster } from '../components/SubjectPoster'
import { Trophy, Flame, Sprout, Zap } from 'lucide-react'

type ChartType = 'hall-of-fame' | 'hall-of-pain' | 'gpa-farmers' | 'most-controversial'

export const ChartsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<ChartType>('hall-of-fame')
  const [subjects, setSubjects] = useState<Subject[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchChart(activeTab)
  }, [activeTab])

  const fetchChart = async (type: ChartType) => {
    setLoading(true)
    try {
      const res = await chartsApi.getChart(type)
      setSubjects(res.subjects)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const tabs: { id: ChartType; label: string; icon: any; desc: string }[] = [
    {
      id: 'hall-of-fame',
      label: 'The Hall of Fame',
      icon: Trophy,
      desc: 'Top subjects ranked by IMDb-style Bayesian weighted rating',
    },
    {
      id: 'hall-of-pain',
      label: 'The Hall of Pain',
      icon: Flame,
      desc: 'Lowest enjoyability and highest cognitive brain melt index',
    },
    {
      id: 'gpa-farmers',
      label: 'Certified GPA Farmers',
      icon: Sprout,
      desc: 'Maximum survival odds paired with minimal effort and stress',
    },
    {
      id: 'most-controversial',
      label: 'Most Controversial',
      icon: Zap,
      desc: 'Subjects with highest score divergence and polarized reviews',
    },
  ]

  const currentTabMeta = tabs.find((t) => t.id === activeTab)!

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Header */}
      <div className="border-b border-[#E6E2DA] pb-6 space-y-2">
        <span className="font-mono text-xs uppercase tracking-widest text-[#666660]">
          Official Examination Charts & Ledgers
        </span>
        <h1 className="font-serif text-3xl sm:text-4xl font-bold text-[#141414] tracking-tight">
          Curriculum Leaderboards
        </h1>
        <p className="font-serif italic text-sm text-[#666660]">
          Rankings dynamically computed using Bayesian weighted statistics to neutralize vote hijacking.
        </p>
      </div>

      {/* Tabs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
        {tabs.map((tab) => {
          const Icon = tab.icon
          const isActive = activeTab === tab.id
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`p-3.5 rounded-sm border text-left transition-all ${
                isActive
                  ? 'bg-[#0A0A0A] text-[#FAF8F5] border-black shadow-sm'
                  : 'bg-white text-[#141414] border-[#E6E2DA] hover:border-neutral-400'
              }`}
            >
              <div className="flex items-center gap-2 mb-1.5">
                <Icon className={`w-4 h-4 ${isActive ? 'text-amber-400' : 'text-neutral-500'}`} />
                <span className="font-serif font-bold text-sm tracking-tight">{tab.label}</span>
              </div>
              <p className={`text-[10px] line-clamp-2 ${isActive ? 'text-neutral-300' : 'text-[#666660]'}`}>
                {tab.desc}
              </p>
            </button>
          )
        })}
      </div>

      {/* Content */}
      <div className="space-y-4">
        <div className="flex items-center justify-between text-xs font-mono text-[#666660] px-2">
          <span>Ranking Ledger ({subjects.length} subjects)</span>
          <span>{currentTabMeta.desc}</span>
        </div>

        {loading ? (
          <div className="py-20 text-center font-mono text-xs text-[#666660]">
            Computing Bayesian rank metrics...
          </div>
        ) : subjects.length === 0 ? (
          <div className="paper-card p-12 text-center rounded-sm">
            <p className="font-serif text-base text-[#141414]">No subjects currently qualify for this chart.</p>
          </div>
        ) : (
          <div className="paper-card rounded-sm divide-y divide-[#E6E2DA] overflow-hidden">
            {subjects.map((sub, idx) => {
              const depts = typeof sub.departments === 'string' ? JSON.parse(sub.departments) : sub.departments
              return (
                <div
                  key={sub.id}
                  className="flex items-center justify-between p-4 sm:p-5 hover:bg-[#FAF8F5] transition-colors group"
                >
                  <div className="flex items-center gap-4 sm:gap-6 min-w-0">
                    <span className="font-mono font-bold text-base sm:text-lg text-[#666660] w-6 sm:w-8 shrink-0 text-center">
                      {String(idx + 1).padStart(2, '0')}
                    </span>

                    <a href={`/s/${sub.slug}`} className="shrink-0">
                      <SubjectPoster
                        acronym={sub.acronym}
                        title={sub.title}
                        subjectType={sub.subjectType}
                        censorRating={sub.censorRating}
                        departments={depts}
                        typicalSem={sub.typicalSem}
                        size="sm"
                        className="scale-90 origin-left"
                      />
                    </a>

                    <div className="min-w-0 space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <a
                          href={`/s/${sub.slug}`}
                          className="font-serif font-bold text-base sm:text-lg text-[#141414] group-hover:underline truncate"
                        >
                          {sub.title}
                        </a>
                        <span className="font-mono text-xs px-1.5 py-0.5 rounded bg-neutral-100 text-neutral-800">
                          {sub.acronym}
                        </span>
                        <span className="font-mono text-[10px] px-1.5 py-0.5 rounded border border-neutral-300 text-neutral-600">
                          Sem {sub.typicalSem}
                        </span>
                      </div>

                      <p className="font-serif italic text-xs text-[#666660] truncate max-w-md hidden sm:block">
                        {sub.tagline || `${depts.join(', ')}`}
                      </p>
                    </div>
                  </div>

                  {/* Right Score Badges depending on Chart */}
                  <div className="text-right shrink-0 pl-3">
                    {activeTab === 'hall-of-fame' && (
                      <div>
                        <span className="font-mono font-bold text-base sm:text-xl text-[#0A0A0A] block">
                          {sub.weightedScore > 0 ? sub.weightedScore.toFixed(2) : '—'}
                          <span className="text-xs text-[#666660]">/10</span>
                        </span>
                        <span className="text-[10px] font-mono text-[#666660] block">
                          {sub.voteCount} votes
                        </span>
                      </div>
                    )}

                    {activeTab === 'hall-of-pain' && (
                      <div>
                        <span className="font-mono font-bold text-sm sm:text-base text-rose-700 block">
                          Melt: {sub.avgBrainMelt.toFixed(1)}/10
                        </span>
                        <span className="text-[10px] font-mono text-[#666660] block">
                          Overall: {sub.avgOverall.toFixed(1)}/10
                        </span>
                      </div>
                    )}

                    {activeTab === 'gpa-farmers' && (
                      <div>
                        <span className="font-mono font-bold text-sm sm:text-base text-emerald-700 block">
                          Survival: {sub.avgSurvival.toFixed(1)}/10
                        </span>
                        <span className="text-[10px] font-mono text-[#666660] block">
                          Melt: {sub.avgBrainMelt.toFixed(1)}/10
                        </span>
                      </div>
                    )}

                    {activeTab === 'most-controversial' && (
                      <div>
                        <span className="font-mono font-bold text-sm sm:text-base text-amber-700 block">
                          StdDev: ±{sub.scoreStddev.toFixed(2)}
                        </span>
                        <span className="text-[10px] font-mono text-[#666660] block">
                          {sub.voteCount} votes
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
