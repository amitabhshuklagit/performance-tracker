'use client'

import { useState } from 'react'
import {
  type Role,
  type Category,
  ROLE_LABELS,
  CATEGORY_LABELS,
  addAchievement,
} from 'app/lib/tracker-store'

interface AchievementFormProps {
  onAdd: () => void
  defaultRole?: Role
}

export function AchievementForm({ onAdd, defaultRole = 'dev' }: AchievementFormProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])
  const [category, setCategory] = useState<Category>('feature')
  const [role, setRole] = useState<Role>(defaultRole)
  const [impact, setImpact] = useState('')
  const [metrics, setMetrics] = useState('')
  const [tagsInput, setTagsInput] = useState('')

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!title.trim() || !description.trim()) return

    addAchievement({
      title: title.trim(),
      description: description.trim(),
      date,
      category,
      role,
      impact: impact.trim(),
      metrics: metrics.trim(),
      tags: tagsInput
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean),
    })

    // Reset form
    setTitle('')
    setDescription('')
    setDate(new Date().toISOString().split('T')[0])
    setCategory('feature')
    setImpact('')
    setMetrics('')
    setTagsInput('')
    setIsOpen(false)
    onAdd()
  }

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="w-full py-3 px-4 border-2 border-dashed border-neutral-300 dark:border-neutral-700 rounded-lg text-neutral-500 dark:text-neutral-400 hover:border-blue-500 hover:text-blue-500 dark:hover:border-blue-400 dark:hover:text-blue-400 transition-colors"
      >
        + Add Achievement
      </button>
    )
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="border border-neutral-200 dark:border-neutral-800 rounded-lg p-4 space-y-4 bg-neutral-50 dark:bg-neutral-900"
    >
      <div className="flex justify-between items-center">
        <h3 className="font-semibold text-lg">New Achievement</h3>
        <button
          type="button"
          onClick={() => setIsOpen(false)}
          className="text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300"
        >
          Cancel
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1 text-neutral-700 dark:text-neutral-300">
            Date *
          </label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            required
            className="w-full px-3 py-2 rounded-md border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-sm"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1 text-neutral-700 dark:text-neutral-300">
            Role
          </label>
          <select
            value={role}
            onChange={(e) => setRole(e.target.value as Role)}
            className="w-full px-3 py-2 rounded-md border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-sm"
          >
            {Object.entries(ROLE_LABELS).map(([key, label]) => (
              <option key={key} value={key}>
                {label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1 text-neutral-700 dark:text-neutral-300">
          Title *
        </label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g. Led migration from monolith to microservices"
          required
          className="w-full px-3 py-2 rounded-md border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-sm"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1 text-neutral-700 dark:text-neutral-300">
          Description *
        </label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Describe what you did, how you did it, and the context..."
          required
          rows={3}
          className="w-full px-3 py-2 rounded-md border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-sm resize-y"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1 text-neutral-700 dark:text-neutral-300">
          Category
        </label>
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value as Category)}
          className="w-full px-3 py-2 rounded-md border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-sm"
        >
          {Object.entries(CATEGORY_LABELS).map(([key, label]) => (
            <option key={key} value={key}>
              {label}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1 text-neutral-700 dark:text-neutral-300">
          Impact
        </label>
        <input
          type="text"
          value={impact}
          onChange={(e) => setImpact(e.target.value)}
          placeholder="e.g. Reduced deployment time by 80%, enabling daily releases"
          className="w-full px-3 py-2 rounded-md border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-sm"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1 text-neutral-700 dark:text-neutral-300">
          Metrics / Numbers
        </label>
        <input
          type="text"
          value={metrics}
          onChange={(e) => setMetrics(e.target.value)}
          placeholder="e.g. 50% reduction in page load time, 99.9% uptime achieved"
          className="w-full px-3 py-2 rounded-md border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-sm"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1 text-neutral-700 dark:text-neutral-300">
          Tags (comma-separated)
        </label>
        <input
          type="text"
          value={tagsInput}
          onChange={(e) => setTagsInput(e.target.value)}
          placeholder="e.g. React, TypeScript, AWS, CI/CD, Agile"
          className="w-full px-3 py-2 rounded-md border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-sm"
        />
      </div>

      <div className="flex gap-2 pt-2">
        <button
          type="submit"
          className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 transition-colors"
        >
          Save Achievement
        </button>
        <button
          type="button"
          onClick={() => setIsOpen(false)}
          className="px-4 py-2 border border-neutral-300 dark:border-neutral-700 rounded-md text-sm hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
        >
          Cancel
        </button>
      </div>
    </form>
  )
}
