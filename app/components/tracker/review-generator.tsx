'use client'

import { useState, useEffect } from 'react'
import {
  type Achievement,
  getAchievements,
  getProfile,
  groupByQuarter,
  groupByYear,
  generateQuarterlyReview,
  generateYearlyReview,
  exportToMarkdown,
} from 'app/lib/tracker-store'

export function ReviewGenerator() {
  const [achievements, setAchievements] = useState<Achievement[]>([])
  const [selectedPeriod, setSelectedPeriod] = useState<string>('')
  const [reviewType, setReviewType] = useState<'quarterly' | 'yearly'>('quarterly')
  const [generatedReview, setGeneratedReview] = useState<string>('')

  useEffect(() => {
    setAchievements(getAchievements())
  }, [])

  const quarters = Object.keys(groupByQuarter(achievements))
  const years = Object.keys(groupByYear(achievements))
  const periods = reviewType === 'quarterly' ? quarters : years

  function handleGenerate() {
    if (!selectedPeriod) return
    const profile = getProfile()

    if (reviewType === 'quarterly') {
      const grouped = groupByQuarter(achievements)
      const items = grouped[selectedPeriod] || []
      setGeneratedReview(generateQuarterlyReview(selectedPeriod, items, profile))
    } else {
      const grouped = groupByYear(achievements)
      const items = grouped[selectedPeriod] || []
      setGeneratedReview(generateYearlyReview(selectedPeriod, items, profile))
    }
  }

  function handleExport() {
    if (!generatedReview) return
    const filename = `${reviewType}-review-${selectedPeriod.replace(/\s/g, '-').toLowerCase()}.md`
    exportToMarkdown(generatedReview, filename)
  }

  function handleCopy() {
    if (!generatedReview) return
    navigator.clipboard.writeText(generatedReview)
  }

  if (achievements.length === 0) {
    return (
      <div className="text-center py-12 text-neutral-500 dark:text-neutral-400">
        <p className="text-lg mb-2">No achievements recorded yet</p>
        <p className="text-sm">
          Add some achievements first, then come back to generate your review.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex gap-2">
          <button
            onClick={() => {
              setReviewType('quarterly')
              setSelectedPeriod('')
              setGeneratedReview('')
            }}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              reviewType === 'quarterly'
                ? 'bg-blue-600 text-white'
                : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-700'
            }`}
          >
            Quarterly Review
          </button>
          <button
            onClick={() => {
              setReviewType('yearly')
              setSelectedPeriod('')
              setGeneratedReview('')
            }}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              reviewType === 'yearly'
                ? 'bg-blue-600 text-white'
                : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-700'
            }`}
          >
            Yearly Review
          </button>
        </div>

        <div className="flex gap-2 flex-1">
          <select
            value={selectedPeriod}
            onChange={(e) => {
              setSelectedPeriod(e.target.value)
              setGeneratedReview('')
            }}
            className="flex-1 px-3 py-2 rounded-md border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-sm"
          >
            <option value="">
              Select {reviewType === 'quarterly' ? 'quarter' : 'year'}...
            </option>
            {periods.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>
          <button
            onClick={handleGenerate}
            disabled={!selectedPeriod}
            className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Generate
          </button>
        </div>
      </div>

      {generatedReview && (
        <div className="space-y-4">
          <div className="flex gap-2">
            <button
              onClick={handleCopy}
              className="px-3 py-1.5 text-xs border border-neutral-300 dark:border-neutral-700 rounded-md hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
            >
              Copy to Clipboard
            </button>
            <button
              onClick={handleExport}
              className="px-3 py-1.5 text-xs border border-neutral-300 dark:border-neutral-700 rounded-md hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
            >
              Export as Markdown
            </button>
          </div>
          <div className="prose dark:prose-invert max-w-none border border-neutral-200 dark:border-neutral-800 rounded-lg p-6 bg-white dark:bg-neutral-900">
            <pre className="whitespace-pre-wrap text-sm font-sans leading-relaxed bg-transparent border-0 p-0">
              {generatedReview}
            </pre>
          </div>
        </div>
      )}
    </div>
  )
}
