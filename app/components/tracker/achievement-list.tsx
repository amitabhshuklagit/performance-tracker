'use client'

import { useState } from 'react'
import {
  type Achievement,
  type Category,
  type WinType,
  CATEGORY_LABELS,
  ROLE_LABELS,
  WIN_TYPE_LABELS,
  EFFORT_LABELS,
  VISIBILITY_LABELS,
  groupByQuarter,
  filterAchievements,
  getAllTags,
} from 'app/lib/tracker-store'
import { deleteCloudAchievement } from 'app/lib/cloud-store'

interface AchievementListProps {
  achievements: Achievement[]
  onUpdate: () => void
  userId: string
}

export function AchievementList({ achievements, onUpdate, userId }: AchievementListProps) {
  const [search, setSearch] = useState('')
  const [filterCategory, setFilterCategory] = useState<Category | ''>('')
  const [filterWinType, setFilterWinType] = useState<WinType | ''>('')
  const [filterQuarter, setFilterQuarter] = useState('')
  const [showFilters, setShowFilters] = useState(false)

  if (achievements.length === 0) {
    return (
      <div className="text-center py-12 text-neutral-500 dark:text-neutral-400">
        <p className="text-lg mb-2">No achievements yet</p>
        <p className="text-sm">
          Start tracking your wins, milestones, and contributions above.
        </p>
      </div>
    )
  }

  const filtered = filterAchievements(achievements, {
    search,
    category: filterCategory,
    winType: filterWinType,
    quarter: filterQuarter,
  })

  const grouped = groupByQuarter(filtered)
  const quarters = Object.keys(groupByQuarter(achievements))
  const allTags = getAllTags(achievements)

  return (
    <div className="space-y-4">
      {/* Search bar */}
      <div className="flex gap-2">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search achievements..."
          className="flex-1 px-3 py-2 rounded-md border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-sm"
        />
        <button
          type="button"
          onClick={() => setShowFilters(!showFilters)}
          className={`px-3 py-2 rounded-md border text-sm transition-colors ${
            showFilters || filterCategory || filterWinType || filterQuarter
              ? 'border-blue-500 text-blue-600 dark:text-blue-400'
              : 'border-neutral-300 dark:border-neutral-700'
          }`}
        >
          Filters{(filterCategory || filterWinType || filterQuarter) ? ' *' : ''}
        </button>
      </div>

      {/* Filter controls */}
      {showFilters && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 p-3 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900">
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value as Category | '')}
            className="px-2 py-1.5 rounded-md border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-xs"
          >
            <option value="">All categories</option>
            {Object.entries(CATEGORY_LABELS).map(([k, v]) => (
              <option key={k} value={k}>{v}</option>
            ))}
          </select>
          <select
            value={filterWinType}
            onChange={(e) => setFilterWinType(e.target.value as WinType | '')}
            className="px-2 py-1.5 rounded-md border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-xs"
          >
            <option value="">All win types</option>
            {Object.entries(WIN_TYPE_LABELS).map(([k, v]) => (
              <option key={k} value={k}>{v}</option>
            ))}
          </select>
          <select
            value={filterQuarter}
            onChange={(e) => setFilterQuarter(e.target.value)}
            className="px-2 py-1.5 rounded-md border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-xs"
          >
            <option value="">All quarters</option>
            {quarters.map((q) => (
              <option key={q} value={q}>{q}</option>
            ))}
          </select>
          {(filterCategory || filterWinType || filterQuarter) && (
            <button
              type="button"
              onClick={() => { setFilterCategory(''); setFilterWinType(''); setFilterQuarter('') }}
              className="text-xs text-red-500 hover:underline"
            >
              Clear filters
            </button>
          )}
        </div>
      )}

      {/* Results count */}
      {(search || filterCategory || filterWinType || filterQuarter) && (
        <p className="text-xs text-neutral-500">
          Showing {filtered.length} of {achievements.length} achievements
        </p>
      )}

      {/* Grouped list */}
      <div className="space-y-8">
        {Object.entries(grouped).map(([quarter, items]) => (
          <div key={quarter}>
            <h3 className="text-lg font-semibold mb-3 text-neutral-800 dark:text-neutral-200">
              {quarter}{' '}
              <span className="text-sm font-normal text-neutral-500">
                ({items.length} {items.length === 1 ? 'item' : 'items'})
              </span>
            </h3>
            <div className="space-y-3">
              {items.map((item) => (
                <AchievementCard key={item.id} item={item} onDeleted={onUpdate} userId={userId} />
              ))}
            </div>
          </div>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-8 text-neutral-500 dark:text-neutral-400">
          No achievements match your search/filters.
        </div>
      )}
    </div>
  )
}

function AchievementCard({
  item,
  onDeleted,
  userId,
}: {
  item: Achievement
  onDeleted: () => void
  userId: string
}) {
  const [deleting, setDeleting] = useState(false)
  const [expanded, setExpanded] = useState(false)

  async function handleDelete() {
    if (!window.confirm('Delete this achievement?')) return
    setDeleting(true)
    try {
      await deleteCloudAchievement(userId, item.id)
      onDeleted()
    } catch (error) {
      console.error('Error deleting:', error)
      alert('Failed to delete. Please try again.')
    } finally {
      setDeleting(false)
    }
  }

  return (
    <div
      className="border border-neutral-200 dark:border-neutral-800 rounded-lg p-4 hover:border-neutral-300 dark:hover:border-neutral-700 transition-colors cursor-pointer"
      onClick={() => setExpanded(!expanded)}
    >
      <div className="flex justify-between items-start gap-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <h4 className="font-medium text-neutral-900 dark:text-neutral-100">
              {item.title}
            </h4>
            <span className="inline-block px-2 py-0.5 text-xs rounded-full bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200">
              {CATEGORY_LABELS[item.category]}
            </span>
            {item.winType && item.winType !== 'general' && (
              <span className="inline-block px-2 py-0.5 text-xs rounded-full bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200">
                {WIN_TYPE_LABELS[item.winType]}
              </span>
            )}
            {item.effort && (
              <span className="inline-block px-2 py-0.5 text-xs rounded-full bg-amber-100 dark:bg-amber-900 text-amber-800 dark:text-amber-200">
                {EFFORT_LABELS[item.effort]}
              </span>
            )}
          </div>
          {item.description && (
            <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-2">
              {expanded ? item.description : item.description.slice(0, 150) + (item.description.length > 150 ? '...' : '')}
            </p>
          )}
          <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-neutral-500 dark:text-neutral-400">
            <span>{new Date(item.date).toLocaleDateString()}</span>
            {item.impact && (
              <span className="text-green-600 dark:text-green-400">
                Impact: {item.impact}
              </span>
            )}
            {item.metrics && (
              <span className="text-purple-600 dark:text-purple-400">
                Metrics: {item.metrics}
              </span>
            )}
            {item.visibility && item.visibility !== 'team' && (
              <span>{VISIBILITY_LABELS[item.visibility]}</span>
            )}
          </div>

          {/* Expanded details */}
          {expanded && (
            <div className="mt-3 pt-3 border-t border-neutral-200 dark:border-neutral-800 space-y-2">
              <div className="text-xs text-neutral-500">
                <span>Role: {ROLE_LABELS[item.role]}</span>
                {item.visibility && <span> | Visibility: {VISIBILITY_LABELS[item.visibility]}</span>}
              </div>
              {item.notes && (
                <div className="text-sm text-neutral-500 dark:text-neutral-400 italic">
                  Notes: {item.notes}
                </div>
              )}
            </div>
          )}

          {item.tags && item.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {item.tags.map((tag) => (
                <span
                  key={tag}
                  className="px-2 py-0.5 text-xs rounded bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>
        <button
          onClick={(e) => { e.stopPropagation(); handleDelete() }}
          disabled={deleting}
          className="text-neutral-400 hover:text-red-500 transition-colors text-sm shrink-0 disabled:opacity-50"
          title="Delete"
        >
          {deleting ? '...' : '\u00d7'}
        </button>
      </div>
    </div>
  )
}
