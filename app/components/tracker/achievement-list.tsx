'use client'

import {
  type Achievement,
  CATEGORY_LABELS,
  ROLE_LABELS,
  CONFIDENCE_LABELS,
  deleteAchievement,
  groupByQuarter,
  calculateStrength,
} from 'app/lib/tracker-store'

interface AchievementListProps {
  achievements: Achievement[]
  onUpdate: () => void
  onEdit?: (achievement: Achievement) => void
}

export function AchievementList({ achievements, onUpdate, onEdit }: AchievementListProps) {
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
              <AchievementCard
                key={item.id}
                item={item}
                onDelete={handleDelete}
                onEdit={onEdit}
              />
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
  onEdit,
}: {
  item: Achievement
  onDelete: (id: string) => void
  onEdit?: (achievement: Achievement) => void
}) {
  const strength = calculateStrength(item)
  const strengthColor =
    strength.score >= 80
      ? 'bg-green-500'
      : strength.score >= 60
        ? 'bg-blue-500'
        : strength.score >= 40
          ? 'bg-yellow-500'
          : 'bg-neutral-400'
  const strengthTextColor =
    strength.score >= 80
      ? 'text-green-600 dark:text-green-400'
      : strength.score >= 60
        ? 'text-blue-600 dark:text-blue-400'
        : strength.score >= 40
          ? 'text-yellow-600 dark:text-yellow-400'
          : 'text-neutral-500'

  return (
    <div className="border border-neutral-200 dark:border-neutral-800 rounded-lg p-4 hover:border-neutral-300 dark:hover:border-neutral-700 transition-colors">
      <div className="flex justify-between items-start gap-2">
        <div className="flex-1 min-w-0">
          {/* Title + category badge */}
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <h4 className="font-medium text-neutral-900 dark:text-neutral-100">
              {item.title}
            </h4>
            <span className="inline-block px-2 py-0.5 text-xs rounded-full bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200">
              {CATEGORY_LABELS[item.category]}
            </span>
            {item.confidence && item.confidence !== 'medium' && (
              <span
                className={`inline-block px-2 py-0.5 text-xs rounded-full ${
                  item.confidence === 'high'
                    ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200'
                    : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400'
                }`}
              >
                {item.confidence} confidence
              </span>
            )}
          </div>

          {/* Description */}
          {item.description && (
            <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-2">
              {item.description}
            </p>
          )}

          {/* Metadata row */}
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

          {/* Collaborators */}
          {item.collaborators && item.collaborators.length > 0 && (
            <div className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
              With: {item.collaborators.join(', ')}
            </div>
          )}

          {/* Links */}
          {item.links && item.links.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-1">
              {item.links.map((link, i) => (
                <a
                  key={i}
                  href={link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-blue-600 dark:text-blue-400 hover:underline truncate max-w-[200px]"
                >
                  {link}
                </a>
              ))}
            </div>
          )}

          {/* Custom fields */}
          {item.customFields && item.customFields.length > 0 && (
            <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-neutral-500 mt-1">
              {item.customFields.map((cf, i) => (
                <span key={i}>
                  <strong>{cf.key}:</strong> {cf.value}
                </span>
              ))}
            </div>
          )}

          {/* Freeform notes */}
          {item.freeformNotes && (
            <p className="text-xs text-neutral-400 italic mt-1">
              {item.freeformNotes}
            </p>
          )}

          {/* Tags */}
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

          {/* Strength bar */}
          <div className="flex items-center gap-2 mt-2">
            <div className="w-16 bg-neutral-200 dark:bg-neutral-700 rounded-full h-1">
              <div
                className={`h-1 rounded-full ${strengthColor}`}
                style={{ width: `${strength.score}%` }}
              />
            </div>
            <span className={`text-xs ${strengthTextColor}`}>
              {strength.label}
            </span>
            {strength.suggestions.length > 0 && strength.score < 60 && (
              <span className="text-xs text-neutral-400">
                -- {strength.suggestions[0]}
              </span>
            )}
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex flex-col gap-1 shrink-0">
          {onEdit && (
            <button
              onClick={() => onEdit(item)}
              className="text-neutral-400 hover:text-blue-500 transition-colors text-xs"
              title="Edit"
            >
              Edit
            </button>
          )}
          <button
            onClick={() => onDelete(item.id)}
            className="text-neutral-400 hover:text-red-500 transition-colors text-xs"
            title="Delete"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  )
}
