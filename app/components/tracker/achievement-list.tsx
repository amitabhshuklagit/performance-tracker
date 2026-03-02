'use client'

import {
  type Achievement,
  CATEGORY_LABELS,
  ROLE_LABELS,
  deleteAchievement,
  groupByQuarter,
} from 'app/lib/tracker-store'

interface AchievementListProps {
  achievements: Achievement[]
  onUpdate: () => void
}

export function AchievementList({ achievements, onUpdate }: AchievementListProps) {
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

  const grouped = groupByQuarter(achievements)

  function handleDelete(id: string) {
    if (window.confirm('Delete this achievement?')) {
      deleteAchievement(id)
      onUpdate()
    }
  }

  return (
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
              <AchievementCard key={item.id} item={item} onDelete={handleDelete} />
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

function AchievementCard({
  item,
  onDelete,
}: {
  item: Achievement
  onDelete: (id: string) => void
}) {
  return (
    <div className="border border-neutral-200 dark:border-neutral-800 rounded-lg p-4 hover:border-neutral-300 dark:hover:border-neutral-700 transition-colors">
      <div className="flex justify-between items-start gap-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <h4 className="font-medium text-neutral-900 dark:text-neutral-100">
              {item.title}
            </h4>
            <span className="inline-block px-2 py-0.5 text-xs rounded-full bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200">
              {CATEGORY_LABELS[item.category]}
            </span>
          </div>
          <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-2">
            {item.description}
          </p>
          <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-neutral-500 dark:text-neutral-400">
            <span>{new Date(item.date).toLocaleDateString()}</span>
            <span>{ROLE_LABELS[item.role]}</span>
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
          </div>
          {item.tags.length > 0 && (
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
          onClick={() => onDelete(item.id)}
          className="text-neutral-400 hover:text-red-500 transition-colors text-sm shrink-0"
          title="Delete"
        >
          &times;
        </button>
      </div>
    </div>
  )
}
