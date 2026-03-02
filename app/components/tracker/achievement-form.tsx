'use client'

import { useState } from 'react'
import {
  type Role,
  type Category,
  type Achievement,
  type WinType,
  ROLE_LABELS,
  CATEGORY_LABELS,
  WIN_TYPE_LABELS,
  VISIBILITY_LABELS,
  EFFORT_LABELS,
  ACHIEVEMENT_TEMPLATES,
  type AchievementTemplate,
  suggestCategory,
} from 'app/lib/tracker-store'
import { saveCloudAchievement } from 'app/lib/cloud-store'

interface AchievementFormProps {
  onAdd: () => void
  defaultRole?: Role
  userId: string
  existingTags?: string[]
}

export function AchievementForm({ onAdd, defaultRole = 'dev', userId, existingTags = [] }: AchievementFormProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [showAdvanced, setShowAdvanced] = useState(false)
  const [saving, setSaving] = useState(false)
  const [selectedTemplate, setSelectedTemplate] = useState<AchievementTemplate | null>(null)

  // Core fields (only title is truly required)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])
  const [category, setCategory] = useState<Category>('other')
  const [role, setRole] = useState<Role>(defaultRole)
  const [winType, setWinType] = useState<WinType>('general')

  // Optional fields
  const [impact, setImpact] = useState('')
  const [metrics, setMetrics] = useState('')
  const [tagsInput, setTagsInput] = useState('')
  const [notes, setNotes] = useState('')
  const [visibility, setVisibility] = useState<'team' | 'org' | 'company' | 'external'>('team')
  const [effort, setEffort] = useState<'small' | 'medium' | 'large' | ''>('')

  // Tag suggestions
  const [showTagSuggestions, setShowTagSuggestions] = useState(false)
  const currentTags = tagsInput.split(',').map((t) => t.trim()).filter(Boolean)
  const tagSuggestions = existingTags.filter(
    (t) => !currentTags.includes(t) && (!tagsInput || t.toLowerCase().includes(tagsInput.split(',').pop()?.trim().toLowerCase() || ''))
  ).slice(0, 8)

  function applyTemplate(template: AchievementTemplate) {
    setSelectedTemplate(template)
    setWinType(template.winType)
    setCategory(template.category)
    // Don't set values, just use placeholders
  }

  function handleTitleBlur() {
    // Auto-suggest category from title
    if (title && category === 'other') {
      const suggested = suggestCategory(title)
      if (suggested !== 'other') {
        setCategory(suggested)
      }
    }
  }

  function handleDescriptionBlur() {
    // Auto-suggest category from description if still 'other'
    if (description && category === 'other') {
      const suggested = suggestCategory(description)
      if (suggested !== 'other') {
        setCategory(suggested)
      }
    }
  }

  function addTagSuggestion(tag: string) {
    const tags = tagsInput.split(',').map((t) => t.trim()).filter(Boolean)
    tags.push(tag)
    setTagsInput(tags.join(', '))
    setShowTagSuggestions(false)
  }

  function resetForm() {
    setTitle('')
    setDescription('')
    setDate(new Date().toISOString().split('T')[0])
    setCategory('other')
    setWinType('general')
    setImpact('')
    setMetrics('')
    setTagsInput('')
    setNotes('')
    setVisibility('team')
    setEffort('')
    setSelectedTemplate(null)
    setShowAdvanced(false)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!title.trim() || saving) return

    setSaving(true)
    try {
      const d = new Date(date)
      const q = Math.ceil((d.getMonth() + 1) / 3)
      const quarter = `Q${q} ${d.getFullYear()}`
      const id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`

      const achievement: Achievement = {
        id,
        title: title.trim(),
        description: description.trim(),
        date,
        category,
        role,
        impact: impact.trim(),
        metrics: metrics.trim(),
        tags: tagsInput.split(',').map((t) => t.trim()).filter(Boolean),
        quarter,
        notes: notes.trim(),
        winType,
        visibility,
        effort,
        customFields: {},
      }

      await saveCloudAchievement(userId, achievement)
      resetForm()
      setIsOpen(false)
      onAdd()
    } catch (error) {
      console.error('Error saving achievement:', error)
      alert('Failed to save achievement. Please try again.')
    } finally {
      setSaving(false)
    }
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

  const ph = selectedTemplate?.placeholders

  return (
    <form
      onSubmit={handleSubmit}
      className="border border-neutral-200 dark:border-neutral-800 rounded-lg p-4 space-y-4 bg-neutral-50 dark:bg-neutral-900"
    >
      <div className="flex justify-between items-center">
        <h3 className="font-semibold text-lg">New Achievement</h3>
        <button
          type="button"
          onClick={() => { resetForm(); setIsOpen(false) }}
          className="text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300"
        >
          Cancel
        </button>
      </div>

      {/* Templates */}
      <div>
        <label className="block text-sm font-medium mb-2 text-neutral-700 dark:text-neutral-300">
          Quick start with a template (optional)
        </label>
        <div className="flex flex-wrap gap-2">
          {ACHIEVEMENT_TEMPLATES.map((t) => (
            <button
              key={t.name}
              type="button"
              onClick={() => applyTemplate(t)}
              className={`px-3 py-1.5 text-xs rounded-full border transition-colors ${
                selectedTemplate?.name === t.name
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'border-neutral-300 dark:border-neutral-700 hover:border-blue-500 dark:hover:border-blue-400'
              }`}
            >
              {t.name}
            </button>
          ))}
        </div>
      </div>

      {/* Title - the only truly required field */}
      <div>
        <label className="block text-sm font-medium mb-1 text-neutral-700 dark:text-neutral-300">
          What did you accomplish? *
        </label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onBlur={handleTitleBlur}
          placeholder={ph?.title || 'e.g. Led migration from monolith to microservices'}
          required
          className="w-full px-3 py-2 rounded-md border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-sm"
        />
      </div>

      {/* Description - optional */}
      <div>
        <label className="block text-sm font-medium mb-1 text-neutral-700 dark:text-neutral-300">
          Tell the story (optional)
        </label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          onBlur={handleDescriptionBlur}
          placeholder={ph?.description || 'Context, what you did, how you did it... as much or little as you want.'}
          rows={3}
          className="w-full px-3 py-2 rounded-md border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-sm resize-y"
        />
      </div>

      {/* Date + Win Type row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1 text-neutral-700 dark:text-neutral-300">
            When?
          </label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full px-3 py-2 rounded-md border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-sm"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1 text-neutral-700 dark:text-neutral-300">
            Type of win
          </label>
          <select
            value={winType}
            onChange={(e) => setWinType(e.target.value as WinType)}
            className="w-full px-3 py-2 rounded-md border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-sm"
          >
            {Object.entries(WIN_TYPE_LABELS).map(([key, label]) => (
              <option key={key} value={key}>{label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Impact + Metrics (optional but encouraged) */}
      <div>
        <label className="block text-sm font-medium mb-1 text-neutral-700 dark:text-neutral-300">
          Impact (optional - what changed because of your work?)
        </label>
        <input
          type="text"
          value={impact}
          onChange={(e) => setImpact(e.target.value)}
          placeholder={ph?.impact || 'e.g. Reduced deployment time by 80%'}
          className="w-full px-3 py-2 rounded-md border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-sm"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1 text-neutral-700 dark:text-neutral-300">
          Numbers / Metrics (optional - any quantifiable results?)
        </label>
        <input
          type="text"
          value={metrics}
          onChange={(e) => setMetrics(e.target.value)}
          placeholder={ph?.metrics || 'e.g. 50% faster, 99.9% uptime, 10k users impacted'}
          className="w-full px-3 py-2 rounded-md border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-sm"
        />
      </div>

      {/* Tags with autocomplete */}
      <div className="relative">
        <label className="block text-sm font-medium mb-1 text-neutral-700 dark:text-neutral-300">
          Tags (optional, comma-separated)
        </label>
        <input
          type="text"
          value={tagsInput}
          onChange={(e) => { setTagsInput(e.target.value); setShowTagSuggestions(true) }}
          onFocus={() => setShowTagSuggestions(true)}
          onBlur={() => setTimeout(() => setShowTagSuggestions(false), 200)}
          placeholder={ph?.tags || 'e.g. React, TypeScript, AWS'}
          className="w-full px-3 py-2 rounded-md border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-sm"
        />
        {showTagSuggestions && tagSuggestions.length > 0 && (
          <div className="absolute z-10 mt-1 w-full bg-white dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded-md shadow-lg max-h-32 overflow-y-auto">
            {tagSuggestions.map((tag) => (
              <button
                key={tag}
                type="button"
                onMouseDown={() => addTagSuggestion(tag)}
                className="w-full text-left px-3 py-1.5 text-sm hover:bg-neutral-100 dark:hover:bg-neutral-700"
              >
                {tag}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Progressive disclosure: Advanced fields */}
      <button
        type="button"
        onClick={() => setShowAdvanced(!showAdvanced)}
        className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
      >
        {showAdvanced ? '- Hide additional fields' : '+ More details (category, role, notes, visibility...)'}
      </button>

      {showAdvanced && (
        <div className="space-y-4 pt-2 border-t border-neutral-200 dark:border-neutral-800">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                  <option key={key} value={key}>{label}</option>
                ))}
              </select>
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
                  <option key={key} value={key}>{label}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1 text-neutral-700 dark:text-neutral-300">
                Visibility / Scope
              </label>
              <select
                value={visibility}
                onChange={(e) => setVisibility(e.target.value as typeof visibility)}
                className="w-full px-3 py-2 rounded-md border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-sm"
              >
                {Object.entries(VISIBILITY_LABELS).map(([key, label]) => (
                  <option key={key} value={key}>{label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 text-neutral-700 dark:text-neutral-300">
                Effort Level
              </label>
              <select
                value={effort}
                onChange={(e) => setEffort(e.target.value as typeof effort)}
                className="w-full px-3 py-2 rounded-md border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-sm"
              >
                <option value="">Not specified</option>
                {Object.entries(EFFORT_LABELS).map(([key, label]) => (
                  <option key={key} value={key}>{label}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1 text-neutral-700 dark:text-neutral-300">
              Private Notes (only for you)
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Any private thoughts, context, lessons learned..."
              rows={2}
              className="w-full px-3 py-2 rounded-md border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-sm resize-y"
            />
          </div>
        </div>
      )}

      <div className="flex gap-2 pt-2">
        <button
          type="submit"
          disabled={saving}
          className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 transition-colors disabled:opacity-50"
        >
          {saving ? 'Saving...' : 'Save Achievement'}
        </button>
        <button
          type="button"
          onClick={() => { resetForm(); setIsOpen(false) }}
          className="px-4 py-2 border border-neutral-300 dark:border-neutral-700 rounded-md text-sm hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
        >
          Cancel
        </button>
      </div>
    </form>
  )
}
