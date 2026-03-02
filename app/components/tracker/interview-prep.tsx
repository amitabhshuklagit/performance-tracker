'use client'

import { useState, useEffect } from 'react'
import {
  type Achievement,
  type Role,
  getAchievements,
  getProfile,
  CATEGORY_LABELS,
  generateInterviewAnswer,
  generateInterviewQuestions,
  exportToMarkdown,
} from 'app/lib/tracker-store'

export function InterviewPrep() {
  const [achievements, setAchievements] = useState<Achievement[]>([])
  const [loading, setLoading] = useState(true)
  const [role, setRole] = useState<Role>('dev')
  const [selectedId, setSelectedId] = useState<string>('')
  const [generatedAnswer, setGeneratedAnswer] = useState<string>('')
  const [showQuestions, setShowQuestions] = useState(false)

  useEffect(() => {
    async function load() {
      setLoading(true)
      const [data, profile] = await Promise.all([getAchievements(), getProfile()])
      setAchievements(data)
      if (profile?.role) setRole(profile.role)
      setLoading(false)
    }
    load()
  }, [])

  const questions = generateInterviewQuestions(achievements, role)

  function handleGenerateAnswer() {
    const achievement = achievements.find((a) => a.id === selectedId)
    if (!achievement) return
    setGeneratedAnswer(generateInterviewAnswer(achievement))
  }

  function handleGenerateAll() {
    const allAnswers = achievements
      .map((a) => generateInterviewAnswer(a))
      .join('\n---\n\n')
    setGeneratedAnswer(allAnswers)
    setSelectedId('')
  }

  function handleCopy() {
    if (!generatedAnswer) return
    navigator.clipboard.writeText(generatedAnswer)
  }

  function handleExport() {
    if (!generatedAnswer) return
    exportToMarkdown(generatedAnswer, 'interview-prep.md')
  }

  if (loading) {
    return (
      <div className="text-center py-12 text-neutral-500 dark:text-neutral-400">
        Loading achievements...
      </div>
    )
  }

  if (achievements.length === 0) {
    return (
      <div className="text-center py-12 text-neutral-500 dark:text-neutral-400">
        <p className="text-lg mb-2">No achievements recorded yet</p>
        <p className="text-sm">
          Add achievements first, then come back for interview prep.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Questions Bank */}
      <div>
        <button
          onClick={() => setShowQuestions(!showQuestions)}
          className="flex items-center gap-2 text-sm font-medium text-neutral-700 dark:text-neutral-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
        >
          <span>{showQuestions ? '[-]' : '[+]'}</span>
          Likely Interview Questions Based on Your Experience ({questions.length})
        </button>
        {showQuestions && (
          <ul className="mt-3 space-y-2 pl-4">
            {questions.map((q, i) => (
              <li
                key={i}
                className="text-sm text-neutral-600 dark:text-neutral-400 list-disc"
              >
                {q}
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* STAR Answer Generator */}
      <div className="space-y-4">
        <h3 className="font-semibold text-neutral-800 dark:text-neutral-200">
          Generate STAR Answers
        </h3>
        <p className="text-sm text-neutral-500 dark:text-neutral-400">
          Select an achievement to generate a structured STAR (Situation, Task, Action,
          Result) answer for behavioral interviews.
        </p>

        <div className="flex flex-col sm:flex-row gap-2">
          <select
            value={selectedId}
            onChange={(e) => {
              setSelectedId(e.target.value)
              setGeneratedAnswer('')
            }}
            className="flex-1 px-3 py-2 rounded-md border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-sm"
          >
            <option value="">Select an achievement...</option>
            {achievements.map((a) => (
              <option key={a.id} value={a.id}>
                {a.title} ({CATEGORY_LABELS[a.category]})
              </option>
            ))}
          </select>
          <button
            onClick={handleGenerateAnswer}
            disabled={!selectedId}
            className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Generate STAR Answer
          </button>
        </div>

        <button
          onClick={handleGenerateAll}
          className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
        >
          Generate all STAR answers at once
        </button>
      </div>

      {generatedAnswer && (
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
              {generatedAnswer}
            </pre>
          </div>
        </div>
      )}
    </div>
  )
}
