'use client'

import { useState, useEffect } from 'react'
import {
  type Role,
  type Category,
  type Confidence,
  type CustomField,
  type Achievement,
  type AchievementTemplate,
  ROLE_LABELS,
  CATEGORY_LABELS,
  CONFIDENCE_LABELS,
  ACHIEVEMENT_TEMPLATES,
  addAchievement,
  updateAchievement,
  suggestCategory,
  calculateStrength,
} from 'app/lib/tracker-store'

type FormMode = 'closed' | 'template-picker' | 'quick-add' | 'full-form'

interface AchievementFormProps {
  onAdd: () => void
  defaultRole?: Role
  editingAchievement?: Achievement | null
  onCancelEdit?: () => void
}

export function AchievementForm({
  onAdd,
  defaultRole = 'dev',
  editingAchievement,
  onCancelEdit,
}: AchievementFormProps) {
  const [mode, setMode] = useState<FormMode>(editingAchievement ? 'full-form' : 'closed')
  const [showDetails, setShowDetails] = useState(false)
  const [selectedTemplate, setSelectedTemplate] = useState<AchievementTemplate | null>(null)
  const [categorySuggested, setCategorySuggested] = useState(false)

  // Form fields
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])
  const [category, setCategory] = useState<Category>('feature')
  const [role, setRole] = useState<Role>(defaultRole)
  const [impact, setImpact] = useState('')
  const [metrics, setMetrics] = useState('')
  const [tagsInput, setTagsInput] = useState('')
  const [confidence, setConfidence] = useState<Confidence>('medium')
  const [linksInput, setLinksInput] = useState('')
  const [collaboratorsInput, setCollaboratorsInput] = useState('')
  const [freeformNotes, setFreeformNotes] = useState('')
  const [customFields, setCustomFields] = useState<CustomField[]>([])

  // Quick add
  const [quickText, setQuickText] = useState('')

  // Populate form when editing
  useEffect(() => {
    if (editingAchievement) {
      setMode('full-form')
      setShowDetails(true)
      setTitle(editingAchievement.title)
      setDescription(editingAchievement.description)
      setDate(editingAchievement.date)
      setCategory(editingAchievement.category)
      setRole(editingAchievement.role)
      setImpact(editingAchievement.impact)
      setMetrics(editingAchievement.metrics)
      setTagsInput(editingAchievement.tags.join(', '))
      setConfidence(editingAchievement.confidence || 'medium')
      setLinksInput((editingAchievement.links || []).join(', '))
      setCollaboratorsInput((editingAchievement.collaborators || []).join(', '))
      setFreeformNotes(editingAchievement.freeformNotes || '')
      setCustomFields(editingAchievement.customFields || [])
    }
  }, [editingAchievement])

  // Smart category suggestion when description changes
  useEffect(() => {
    if (description.length > 15 && !categorySuggested) {
      const combined = `${title} ${description}`
      const suggested = suggestCategory(combined)
      if (suggested !== 'other') {
        setCategory(suggested)
        setCategorySuggested(true)
      }
    }
  }, [description, title, categorySuggested])

  function buildAchievementData() {
    return {
      title: title.trim(),
      description: description.trim(),
      date,
      category,
      role,
      impact: impact.trim(),
      metrics: metrics.trim(),
      tags: tagsInput.split(',').map((t) => t.trim()).filter(Boolean),
      confidence,
      links: linksInput.split(',').map((l) => l.trim()).filter(Boolean),
      collaborators: collaboratorsInput.split(',').map((c) => c.trim()).filter(Boolean),
      freeformNotes: freeformNotes.trim(),
      customFields: customFields.filter((cf) => cf.key.trim() && cf.value.trim()),
      templateUsed: selectedTemplate?.id || '',
    }
  }

  // Get a live preview of strength
  function getPreviewStrength() {
    const data = buildAchievementData()
    // Create a fake achievement to check strength
    const fake: Achievement = {
      ...data,
      id: 'preview',
      quarter: 'Q1 2025',
    }
    return calculateStrength(fake)
  }

  function resetForm() {
    setTitle('')
    setDescription('')
    setDate(new Date().toISOString().split('T')[0])
    setCategory('feature')
    setImpact('')
    setMetrics('')
    setTagsInput('')
    setConfidence('medium')
    setLinksInput('')
    setCollaboratorsInput('')
    setFreeformNotes('')
    setCustomFields([])
    setShowDetails(false)
    setSelectedTemplate(null)
    setCategorySuggested(false)
    setQuickText('')
    setMode('closed')
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!title.trim()) return

    const data = buildAchievementData()

    if (editingAchievement) {
      updateAchievement({
        ...editingAchievement,
        ...data,
      })
    } else {
      addAchievement(data)
    }

    resetForm()
    onAdd()
  }

  function handleQuickAdd(e: React.FormEvent) {
    e.preventDefault()
    if (!quickText.trim()) return

    // Parse quick text: use first line as title, rest as description
    const lines = quickText.trim().split('\n')
    const quickTitle = lines[0]
    const quickDesc = lines.slice(1).join('\n').trim()
    const suggestedCat = suggestCategory(quickText)

    addAchievement({
      title: quickTitle,
      description: quickDesc,
      date: new Date().toISOString().split('T')[0],
      category: suggestedCat,
      role: defaultRole || 'dev',
      impact: '',
      metrics: '',
      tags: [],
      confidence: 'low',
      links: [],
      collaborators: [],
      freeformNotes: '',
      customFields: [],
      templateUsed: 'quick-add',
    })

    setQuickText('')
    setMode('closed')
    onAdd()
  }

  function handleTemplateSelect(template: AchievementTemplate) {
    setSelectedTemplate(template)
    if (template.defaults.category) setCategory(template.defaults.category)
    if (template.defaults.confidence) setConfidence(template.defaults.confidence)
    setCategorySuggested(true) // Don't override template category
    setMode('full-form')
  }

  function handleCancel() {
    if (editingAchievement && onCancelEdit) {
      onCancelEdit()
    }
    resetForm()
  }

  function addCustomField() {
    setCustomFields([...customFields, { key: '', value: '' }])
  }

  function updateCustomField(index: number, field: 'key' | 'value', value: string) {
    const updated = [...customFields]
    updated[index] = { ...updated[index], [field]: value }
    setCustomFields(updated)
  }

  function removeCustomField(index: number) {
    setCustomFields(customFields.filter((_, i) => i !== index))
  }

  // ---- Closed state: show action buttons ----
  if (mode === 'closed') {
    return (
      <div className="space-y-2">
        <div className="flex gap-2">
          <button
            onClick={() => setMode('quick-add')}
            className="flex-1 py-3 px-4 border-2 border-dashed border-neutral-300 dark:border-neutral-700 rounded-lg text-neutral-500 dark:text-neutral-400 hover:border-green-500 hover:text-green-500 dark:hover:border-green-400 dark:hover:text-green-400 transition-colors text-sm"
          >
            Quick Add
          </button>
          <button
            onClick={() => setMode('template-picker')}
            className="flex-1 py-3 px-4 border-2 border-dashed border-neutral-300 dark:border-neutral-700 rounded-lg text-neutral-500 dark:text-neutral-400 hover:border-blue-500 hover:text-blue-500 dark:hover:border-blue-400 dark:hover:text-blue-400 transition-colors text-sm"
          >
            Use Template
          </button>
          <button
            onClick={() => setMode('full-form')}
            className="flex-1 py-3 px-4 border-2 border-dashed border-neutral-300 dark:border-neutral-700 rounded-lg text-neutral-500 dark:text-neutral-400 hover:border-purple-500 hover:text-purple-500 dark:hover:border-purple-400 dark:hover:text-purple-400 transition-colors text-sm"
          >
            Detailed Form
          </button>
        </div>
      </div>
    )
  }

  // ---- Quick Add mode ----
  if (mode === 'quick-add') {
    return (
      <form
        onSubmit={handleQuickAdd}
        className="border border-green-200 dark:border-green-900 rounded-lg p-4 space-y-3 bg-green-50 dark:bg-green-950"
      >
        <div className="flex justify-between items-center">
          <h3 className="font-semibold text-sm text-green-800 dark:text-green-200">
            Quick Add -- just type what you did
          </h3>
          <button
            type="button"
            onClick={handleCancel}
            className="text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300 text-sm"
          >
            Cancel
          </button>
        </div>
        <textarea
          value={quickText}
          onChange={(e) => setQuickText(e.target.value)}
          placeholder={"First line becomes the title.\nRest becomes the description.\n\nExample:\nShipped new search feature\nBuilt full-text search with Elasticsearch for the product catalog. Reduced average search time from 3s to 200ms."}
          rows={5}
          autoFocus
          className="w-full px-3 py-2 rounded-md border border-green-300 dark:border-green-800 bg-white dark:bg-neutral-800 text-sm resize-y"
        />
        <p className="text-xs text-green-600 dark:text-green-400">
          Category will be auto-detected. You can add more details later by editing.
        </p>
        <div className="flex gap-2">
          <button
            type="submit"
            disabled={!quickText.trim()}
            className="px-4 py-2 bg-green-600 text-white rounded-md text-sm font-medium hover:bg-green-700 transition-colors disabled:opacity-50"
          >
            Save
          </button>
          <button
            type="button"
            onClick={() => {
              // Switch to full form with quick text pre-filled
              const lines = quickText.trim().split('\n')
              setTitle(lines[0] || '')
              setDescription(lines.slice(1).join('\n').trim())
              const suggested = suggestCategory(quickText)
              if (suggested !== 'other') setCategory(suggested)
              setMode('full-form')
            }}
            className="px-4 py-2 border border-green-300 dark:border-green-800 rounded-md text-sm hover:bg-green-100 dark:hover:bg-green-900 transition-colors"
          >
            Switch to Full Form
          </button>
        </div>
      </form>
    )
  }

  // ---- Template picker ----
  if (mode === 'template-picker') {
    return (
      <div className="border border-blue-200 dark:border-blue-900 rounded-lg p-4 space-y-4 bg-blue-50 dark:bg-blue-950">
        <div className="flex justify-between items-center">
          <h3 className="font-semibold text-sm text-blue-800 dark:text-blue-200">
            Pick a template
          </h3>
          <button
            type="button"
            onClick={handleCancel}
            className="text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300 text-sm"
          >
            Cancel
          </button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {ACHIEVEMENT_TEMPLATES.map((template) => (
            <button
              key={template.id}
              onClick={() => handleTemplateSelect(template)}
              className="text-left p-3 rounded-lg border border-blue-200 dark:border-blue-800 hover:border-blue-400 dark:hover:border-blue-600 transition-colors bg-white dark:bg-neutral-900"
            >
              <div className="flex items-center gap-2 mb-1">
                <span>{template.icon}</span>
                <span className="font-medium text-sm">{template.name}</span>
              </div>
              <p className="text-xs text-neutral-500 dark:text-neutral-400">
                {template.description}
              </p>
            </button>
          ))}
        </div>
      </div>
    )
  }

  // ---- Full form (with progressive disclosure) ----
  const prompts = selectedTemplate?.prompts
  const strength = getPreviewStrength()
  const strengthColor =
    strength.score >= 80
      ? 'text-green-600 dark:text-green-400'
      : strength.score >= 60
        ? 'text-blue-600 dark:text-blue-400'
        : strength.score >= 40
          ? 'text-yellow-600 dark:text-yellow-400'
          : 'text-neutral-500 dark:text-neutral-400'
  const strengthBarColor =
    strength.score >= 80
      ? 'bg-green-500'
      : strength.score >= 60
        ? 'bg-blue-500'
        : strength.score >= 40
          ? 'bg-yellow-500'
          : 'bg-neutral-400'

  return (
    <form
      onSubmit={handleSubmit}
      className="border border-neutral-200 dark:border-neutral-800 rounded-lg p-4 space-y-4 bg-neutral-50 dark:bg-neutral-900"
    >
      <div className="flex justify-between items-center">
        <div>
          <h3 className="font-semibold text-lg">
            {editingAchievement ? 'Edit Achievement' : 'New Achievement'}
          </h3>
          {selectedTemplate && (
            <p className="text-xs text-blue-600 dark:text-blue-400">
              Template: {selectedTemplate.icon} {selectedTemplate.name}
            </p>
          )}
        </div>
        <button
          type="button"
          onClick={handleCancel}
          className="text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300"
        >
          Cancel
        </button>
      </div>

      {/* Strength indicator */}
      <div className="space-y-1">
        <div className="flex justify-between items-center text-xs">
          <span className={strengthColor}>
            Entry strength: {strength.label} ({strength.score}%)
          </span>
          {strength.suggestions.length > 0 && (
            <span className="text-neutral-400">
              {strength.suggestions.length} suggestion{strength.suggestions.length !== 1 ? 's' : ''}
            </span>
          )}
        </div>
        <div className="w-full bg-neutral-200 dark:bg-neutral-700 rounded-full h-1.5">
          <div
            className={`h-1.5 rounded-full transition-all ${strengthBarColor}`}
            style={{ width: `${strength.score}%` }}
          />
        </div>
        {strength.suggestions.length > 0 && strength.score < 60 && (
          <div className="text-xs text-neutral-400 space-y-0.5 pt-1">
            {strength.suggestions.slice(0, 2).map((s, i) => (
              <p key={i}>Tip: {s}</p>
            ))}
          </div>
        )}
      </div>

      {/* ---- Basic fields (always visible) ---- */}
      <div>
        <label className="block text-sm font-medium mb-1 text-neutral-700 dark:text-neutral-300">
          What did you do? *
        </label>
        <input
          type="text"
          value={title}
          onChange={(e) => {
            setTitle(e.target.value)
            setCategorySuggested(false)
          }}
          placeholder={prompts?.title || 'e.g. Led migration from monolith to microservices'}
          required
          autoFocus
          className="w-full px-3 py-2 rounded-md border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-sm"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1 text-neutral-700 dark:text-neutral-300">
          Tell me more (optional but helps reviews)
        </label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder={prompts?.description || 'Describe what you did, how you did it, and the context...'}
          rows={3}
          className="w-full px-3 py-2 rounded-md border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-sm resize-y"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1 text-neutral-700 dark:text-neutral-300">
            Date
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
            Category
            {categorySuggested && (
              <span className="ml-2 text-xs text-blue-500 font-normal">(auto-detected)</span>
            )}
          </label>
          <select
            value={category}
            onChange={(e) => {
              setCategory(e.target.value as Category)
              setCategorySuggested(false)
            }}
            className="w-full px-3 py-2 rounded-md border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-sm"
          >
            {Object.entries(CATEGORY_LABELS).map(([key, label]) => (
              <option key={key} value={key}>
                {label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* ---- Progressive disclosure toggle ---- */}
      <button
        type="button"
        onClick={() => setShowDetails(!showDetails)}
        className="w-full text-left text-sm text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
      >
        <span>{showDetails ? '[-]' : '[+]'}</span>
        {showDetails ? 'Hide' : 'Show'} additional details (impact, metrics, tags, links, ...)
      </button>

      {/* ---- Detailed fields (progressive disclosure) ---- */}
      {showDetails && (
        <div className="space-y-4 pt-2 border-t border-neutral-200 dark:border-neutral-800">
          <div>
            <label className="block text-sm font-medium mb-1 text-neutral-700 dark:text-neutral-300">
              Impact
            </label>
            <input
              type="text"
              value={impact}
              onChange={(e) => setImpact(e.target.value)}
              placeholder={prompts?.impact || 'e.g. Reduced deployment time by 80%, enabling daily releases'}
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
              placeholder={prompts?.metrics || 'e.g. 50% reduction in page load time, 99.9% uptime'}
              className="w-full px-3 py-2 rounded-md border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-sm"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1 text-neutral-700 dark:text-neutral-300">
                Confidence
              </label>
              <select
                value={confidence}
                onChange={(e) => setConfidence(e.target.value as Confidence)}
                className="w-full px-3 py-2 rounded-md border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-sm"
              >
                {Object.entries(CONFIDENCE_LABELS).map(([key, label]) => (
                  <option key={key} value={key}>
                    {label}
                  </option>
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
                  <option key={key} value={key}>
                    {label}
                  </option>
                ))}
              </select>
            </div>
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

          <div>
            <label className="block text-sm font-medium mb-1 text-neutral-700 dark:text-neutral-300">
              Collaborators (comma-separated)
            </label>
            <input
              type="text"
              value={collaboratorsInput}
              onChange={(e) => setCollaboratorsInput(e.target.value)}
              placeholder="e.g. Alice, Bob, Design team, Platform team"
              className="w-full px-3 py-2 rounded-md border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1 text-neutral-700 dark:text-neutral-300">
              Links (comma-separated)
            </label>
            <input
              type="text"
              value={linksInput}
              onChange={(e) => setLinksInput(e.target.value)}
              placeholder="e.g. PR link, Jira ticket, doc URL"
              className="w-full px-3 py-2 rounded-md border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1 text-neutral-700 dark:text-neutral-300">
              Freeform Notes
            </label>
            <textarea
              value={freeformNotes}
              onChange={(e) => setFreeformNotes(e.target.value)}
              placeholder="Any extra context, thoughts, or things to remember..."
              rows={2}
              className="w-full px-3 py-2 rounded-md border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-sm resize-y"
            />
          </div>

          {/* Custom Fields */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                Custom Fields
              </label>
              <button
                type="button"
                onClick={addCustomField}
                className="text-xs text-blue-600 dark:text-blue-400 hover:underline"
              >
                + Add field
              </button>
            </div>
            {customFields.length === 0 && (
              <p className="text-xs text-neutral-400">
                Add custom key-value pairs for anything not covered above (e.g. Sprint, Ticket, Team Size).
              </p>
            )}
            {customFields.map((cf, i) => (
              <div key={i} className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={cf.key}
                  onChange={(e) => updateCustomField(i, 'key', e.target.value)}
                  placeholder="Field name"
                  className="w-1/3 px-2 py-1.5 rounded-md border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-xs"
                />
                <input
                  type="text"
                  value={cf.value}
                  onChange={(e) => updateCustomField(i, 'value', e.target.value)}
                  placeholder="Value"
                  className="flex-1 px-2 py-1.5 rounded-md border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-xs"
                />
                <button
                  type="button"
                  onClick={() => removeCustomField(i)}
                  className="text-neutral-400 hover:text-red-500 text-xs px-1"
                >
                  &times;
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ---- Submit ---- */}
      <div className="flex gap-2 pt-2">
        <button
          type="submit"
          className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 transition-colors"
        >
          {editingAchievement ? 'Update' : 'Save Achievement'}
        </button>
        <button
          type="button"
          onClick={handleCancel}
          className="px-4 py-2 border border-neutral-300 dark:border-neutral-700 rounded-md text-sm hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
        >
          Cancel
        </button>
      </div>
    </form>
  )
}
