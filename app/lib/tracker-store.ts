// Types and utilities for the Career Tracker feature

export type Role = 'dev' | 'qa' | 'pm' | 'designer' | 'devops' | 'data' | 'other'

export type Category =
  | 'feature'
  | 'bugfix'
  | 'optimization'
  | 'leadership'
  | 'process'
  | 'mentoring'
  | 'learning'
  | 'collaboration'
  | 'initiative'
  | 'other'

export type Confidence = 'high' | 'medium' | 'low'

export interface CustomField {
  key: string
  value: string
}

export interface Achievement {
  id: string
  date: string // ISO date string
  title: string
  description: string
  category: Category
  role: Role
  impact: string
  metrics: string
  tags: string[]
  quarter: string // e.g. "Q1 2025"
  // -- New flexible fields --
  confidence: Confidence // how confident you are in the impact
  links: string[] // PR links, docs, tickets, etc.
  collaborators: string[] // people involved
  customFields: CustomField[] // arbitrary key-value pairs
  freeformNotes: string // unstructured notes, context, thoughts
  templateUsed: string // which template was used, if any
}

export interface TrackerProfile {
  name: string
  role: Role
  team: string
  company: string
}

export const ROLE_LABELS: Record<Role, string> = {
  dev: 'Software Developer / Engineer',
  qa: 'QA / Test Engineer',
  pm: 'Product / Project Manager',
  designer: 'UX / UI Designer',
  devops: 'DevOps / SRE',
  data: 'Data Engineer / Scientist',
  other: 'Other',
}

export const CATEGORY_LABELS: Record<Category, string> = {
  feature: 'Feature Delivery',
  bugfix: 'Bug Fix / Issue Resolution',
  optimization: 'Performance / Optimization',
  leadership: 'Leadership / Ownership',
  process: 'Process Improvement',
  mentoring: 'Mentoring / Knowledge Sharing',
  learning: 'Learning / Certification',
  collaboration: 'Cross-team Collaboration',
  initiative: 'Initiative / Innovation',
  other: 'Other',
}

export const CONFIDENCE_LABELS: Record<Confidence, string> = {
  high: 'High - clear, measurable outcome',
  medium: 'Medium - notable but hard to quantify',
  low: 'Low - contributed but impact unclear',
}

// ---- Achievement Templates ----

export interface AchievementTemplate {
  id: string
  name: string
  icon: string
  description: string
  defaults: Partial<Omit<Achievement, 'id' | 'quarter'>>
  prompts: {
    title: string
    description: string
    impact: string
    metrics: string
  }
}

export const ACHIEVEMENT_TEMPLATES: AchievementTemplate[] = [
  {
    id: 'feature-ship',
    name: 'Shipped a Feature',
    icon: '🚀',
    description: 'Delivered a new feature or product capability',
    defaults: { category: 'feature', confidence: 'high' },
    prompts: {
      title: 'e.g. Built real-time notification system',
      description: 'What was the feature? Who was it for? What was the scope?',
      impact: 'e.g. Enabled 10K users to get instant updates, reducing support tickets',
      metrics: 'e.g. 30% increase in user engagement, 500 DAU using feature',
    },
  },
  {
    id: 'bug-fix',
    name: 'Fixed a Critical Bug',
    icon: '🐛',
    description: 'Diagnosed and resolved a significant issue',
    defaults: { category: 'bugfix', confidence: 'high' },
    prompts: {
      title: 'e.g. Resolved memory leak in payment service',
      description: 'What was the bug? How did you find it? What was the fix?',
      impact: 'e.g. Prevented $50K/month in failed transactions',
      metrics: 'e.g. 99.9% uptime restored, 0 incidents in 3 months after fix',
    },
  },
  {
    id: 'led-project',
    name: 'Led a Project / Initiative',
    icon: '👑',
    description: 'Took ownership or led a team effort',
    defaults: { category: 'leadership', confidence: 'medium' },
    prompts: {
      title: 'e.g. Led migration to new CI/CD pipeline',
      description: 'What was the project? What was your role? Who was involved?',
      impact: 'e.g. Reduced deployment time from 2 hours to 15 minutes',
      metrics: 'e.g. 8x faster deploys, team of 5, completed 2 weeks early',
    },
  },
  {
    id: 'process-improvement',
    name: 'Improved a Process',
    icon: '⚙️',
    description: 'Made a workflow, tool, or process better',
    defaults: { category: 'process', confidence: 'medium' },
    prompts: {
      title: 'e.g. Automated weekly reporting with a dashboard',
      description: 'What process? What was wrong? What did you change?',
      impact: 'e.g. Saved 4 hours/week across the team',
      metrics: 'e.g. 80% time reduction, adopted by 3 teams',
    },
  },
  {
    id: 'mentored',
    name: 'Mentored / Helped Someone',
    icon: '🤝',
    description: 'Helped a colleague grow, onboarded someone, shared knowledge',
    defaults: { category: 'mentoring', confidence: 'low' },
    prompts: {
      title: 'e.g. Onboarded 2 new engineers to the payments team',
      description: 'Who did you help? What did you teach? How did you support them?',
      impact: 'e.g. New hires were productive within 2 weeks instead of 6',
      metrics: 'e.g. 2 engineers onboarded, created 5 onboarding docs',
    },
  },
  {
    id: 'learning',
    name: 'Learned / Certified',
    icon: '📚',
    description: 'Completed a course, got certified, learned a new skill',
    defaults: { category: 'learning', confidence: 'medium' },
    prompts: {
      title: 'e.g. Earned AWS Solutions Architect certification',
      description: 'What did you learn? How did you apply it?',
      impact: 'e.g. Applied cloud patterns to reduce infra costs by 20%',
      metrics: 'e.g. Certification earned, 3 projects using new skills',
    },
  },
  {
    id: 'collaboration',
    name: 'Cross-team Collaboration',
    icon: '🔗',
    description: 'Worked across teams or orgs to deliver something',
    defaults: { category: 'collaboration', confidence: 'medium' },
    prompts: {
      title: 'e.g. Co-designed API contract with mobile team',
      description: 'Which teams? What was the goal? What was your contribution?',
      impact: 'e.g. Unblocked mobile team, launched feature 1 month early',
      metrics: 'e.g. 3 teams aligned, shipped in 4 sprints',
    },
  },
  {
    id: 'quick-win',
    name: 'Quick Win / Small Contribution',
    icon: '✨',
    description: 'Something small but worth remembering',
    defaults: { category: 'other', confidence: 'low' },
    prompts: {
      title: 'e.g. Cleaned up tech debt in auth module',
      description: 'Just describe what you did -- details are optional',
      impact: '',
      metrics: '',
    },
  },
  {
    id: 'freeform',
    name: 'Just a Note',
    icon: '📝',
    description: 'Capture something loosely -- fill in details later',
    defaults: { category: 'other', confidence: 'low' },
    prompts: {
      title: 'A short summary of what happened',
      description: '',
      impact: '',
      metrics: '',
    },
  },
]

// ---- Smart Category Suggestion ----

const CATEGORY_KEYWORDS: Record<Category, string[]> = {
  feature: ['built', 'shipped', 'launched', 'implemented', 'created', 'developed', 'released', 'feature', 'product', 'designed'],
  bugfix: ['fixed', 'bug', 'resolved', 'debugged', 'patch', 'hotfix', 'incident', 'error', 'crash', 'issue', 'regression'],
  optimization: ['optimized', 'performance', 'reduced', 'improved', 'faster', 'speed', 'cache', 'latency', 'memory', 'scalab'],
  leadership: ['led', 'owned', 'managed', 'directed', 'drove', 'spearheaded', 'coordinated', 'organized', 'responsible'],
  process: ['process', 'workflow', 'automated', 'pipeline', 'ci/cd', 'tooling', 'standardized', 'documented', 'template'],
  mentoring: ['mentored', 'onboarded', 'taught', 'trained', 'coached', 'helped', 'guided', 'pair', 'knowledge'],
  learning: ['learned', 'certified', 'certification', 'course', 'studied', 'training', 'skill', 'workshop'],
  collaboration: ['collaborated', 'cross-team', 'cross-functional', 'partnered', 'aligned', 'stakeholder', 'coordination'],
  initiative: ['initiative', 'proposed', 'innovated', 'experimented', 'poc', 'prototype', 'hackathon', 'volunteer'],
  other: [],
}

export function suggestCategory(text: string): Category {
  const lower = text.toLowerCase()
  let bestCategory: Category = 'other'
  let bestScore = 0

  for (const [cat, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
    let score = 0
    for (const kw of keywords) {
      if (lower.includes(kw)) score++
    }
    if (score > bestScore) {
      bestScore = score
      bestCategory = cat as Category
    }
  }

  return bestCategory
}

// ---- Strength Score ----

export function calculateStrength(achievement: Achievement): {
  score: number // 0-100
  label: string
  suggestions: string[]
} {
  let score = 0
  const suggestions: string[] = []

  // Title (required, but length matters)
  if (achievement.title) {
    score += 10
    if (achievement.title.length > 20) score += 5
  }

  // Description
  if (achievement.description) {
    score += 15
    if (achievement.description.length > 50) score += 5
    if (achievement.description.length > 150) score += 5
  } else {
    suggestions.push('Add a description of what you did')
  }

  // Impact
  if (achievement.impact) {
    score += 15
    if (achievement.impact.length > 30) score += 5
  } else {
    suggestions.push('Describe the impact of your work')
  }

  // Metrics
  if (achievement.metrics) {
    score += 15
    if (/\d/.test(achievement.metrics)) score += 5 // has numbers
  } else {
    suggestions.push('Add metrics or numbers (even estimates help)')
  }

  // Tags
  if (achievement.tags.length > 0) {
    score += 5
    if (achievement.tags.length >= 3) score += 5
  } else {
    suggestions.push('Add tags for skills used')
  }

  // Collaborators
  if (achievement.collaborators && achievement.collaborators.length > 0) {
    score += 5
  } else {
    suggestions.push('Mention collaborators or stakeholders')
  }

  // Links
  if (achievement.links && achievement.links.length > 0) {
    score += 5
  }

  // Confidence
  if (achievement.confidence === 'high') score += 5
  else if (achievement.confidence === 'medium') score += 3

  // Cap at 100
  score = Math.min(score, 100)

  let label: string
  if (score >= 80) label = 'Strong'
  else if (score >= 60) label = 'Good'
  else if (score >= 40) label = 'Fair'
  else if (score >= 20) label = 'Basic'
  else label = 'Draft'

  return { score, label, suggestions }
}

// ---- LocalStorage helpers ----

const ACHIEVEMENTS_KEY = 'career-tracker-achievements'
const PROFILE_KEY = 'career-tracker-profile'

function migrateAchievement(a: any): Achievement {
  // Migrate old achievements that lack new fields
  return {
    ...a,
    confidence: a.confidence || 'medium',
    links: a.links || [],
    collaborators: a.collaborators || [],
    customFields: a.customFields || [],
    freeformNotes: a.freeformNotes || '',
    templateUsed: a.templateUsed || '',
  }
}

export function getAchievements(): Achievement[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = localStorage.getItem(ACHIEVEMENTS_KEY)
    const items = raw ? JSON.parse(raw) : []
    return items.map(migrateAchievement)
  } catch {
    return []
  }
}

export function saveAchievements(items: Achievement[]): void {
  if (typeof window === 'undefined') return
  localStorage.setItem(ACHIEVEMENTS_KEY, JSON.stringify(items))
}

export function addAchievement(item: Omit<Achievement, 'id' | 'quarter'>): Achievement {
  const achievements = getAchievements()
  const date = new Date(item.date)
  const q = Math.ceil((date.getMonth() + 1) / 3)
  const achievement: Achievement = {
    ...item,
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    quarter: `Q${q} ${date.getFullYear()}`,
  }
  achievements.push(achievement)
  saveAchievements(achievements)
  return achievement
}

export function deleteAchievement(id: string): void {
  const achievements = getAchievements().filter((a) => a.id !== id)
  saveAchievements(achievements)
}

export function updateAchievement(updated: Achievement): void {
  const achievements = getAchievements().map((a) => (a.id === updated.id ? updated : a))
  saveAchievements(achievements)
}

export function getProfile(): TrackerProfile | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = localStorage.getItem(PROFILE_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

export function saveProfile(profile: TrackerProfile): void {
  if (typeof window === 'undefined') return
  localStorage.setItem(PROFILE_KEY, JSON.stringify(profile))
}

// ---- Grouping helpers ----

export function groupByQuarter(achievements: Achievement[]): Record<string, Achievement[]> {
  const groups: Record<string, Achievement[]> = {}
  for (const a of achievements) {
    if (!groups[a.quarter]) groups[a.quarter] = []
    groups[a.quarter].push(a)
  }
  const sorted: Record<string, Achievement[]> = {}
  Object.keys(groups)
    .sort((a, b) => {
      const [qa, ya] = a.replace('Q', '').split(' ')
      const [qb, yb] = b.replace('Q', '').split(' ')
      return Number(yb) - Number(ya) || Number(qb) - Number(qa)
    })
    .forEach((key) => {
      sorted[key] = groups[key].sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
      )
    })
  return sorted
}

export function groupByYear(achievements: Achievement[]): Record<string, Achievement[]> {
  const groups: Record<string, Achievement[]> = {}
  for (const a of achievements) {
    const year = new Date(a.date).getFullYear().toString()
    if (!groups[year]) groups[year] = []
    groups[year].push(a)
  }
  const sorted: Record<string, Achievement[]> = {}
  Object.keys(groups)
    .sort((a, b) => Number(b) - Number(a))
    .forEach((key) => {
      sorted[key] = groups[key].sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
      )
    })
  return sorted
}

// ---- Text generation helpers ----

export function generateQuarterlyReview(
  quarter: string,
  achievements: Achievement[],
  profile: TrackerProfile | null
): string {
  const name = profile?.name || 'Team Member'
  const role = profile?.role ? ROLE_LABELS[profile.role] : 'IT Professional'

  const byCat: Record<string, Achievement[]> = {}
  for (const a of achievements) {
    const cat = CATEGORY_LABELS[a.category] || a.category
    if (!byCat[cat]) byCat[cat] = []
    byCat[cat].push(a)
  }

  let review = `# ${quarter} Performance Review - ${name}\n`
  review += `**Role:** ${role}\n\n`
  review += `## Summary\n\n`
  review += `During ${quarter}, I delivered ${achievements.length} key contributions across ${Object.keys(byCat).length} areas. `

  const topCategories = Object.entries(byCat)
    .sort((a, b) => b[1].length - a[1].length)
    .slice(0, 3)
    .map(([cat]) => cat)
  review += `Primary focus areas included ${topCategories.join(', ')}.\n\n`

  review += `## Key Accomplishments\n\n`
  for (const [cat, items] of Object.entries(byCat)) {
    review += `### ${cat}\n\n`
    for (const item of items) {
      review += `**${item.title}**\n`
      if (item.description) review += `${item.description}\n`
      if (item.impact) review += `- **Impact:** ${item.impact}\n`
      if (item.metrics) review += `- **Metrics:** ${item.metrics}\n`
      if (item.collaborators && item.collaborators.length > 0) {
        review += `- **Collaborators:** ${item.collaborators.join(', ')}\n`
      }
      if (item.links && item.links.length > 0) {
        review += `- **References:** ${item.links.join(', ')}\n`
      }
      if (item.customFields && item.customFields.length > 0) {
        for (const cf of item.customFields) {
          review += `- **${cf.key}:** ${cf.value}\n`
        }
      }
      review += `\n`
    }
  }

  review += `## Impact Highlights\n\n`
  const withMetrics = achievements.filter((a) => a.metrics)
  if (withMetrics.length > 0) {
    for (const a of withMetrics) {
      review += `- ${a.title}: ${a.metrics}\n`
    }
  } else {
    review += `_Add metrics to your achievements for quantifiable impact highlights._\n`
  }

  // Collaboration summary
  const allCollaborators = Array.from(new Set(achievements.flatMap((a) => a.collaborators || []).filter(Boolean)))
  if (allCollaborators.length > 0) {
    review += `\n## Collaboration\n\n`
    review += `Worked with: ${allCollaborators.join(', ')}\n`
  }

  review += `\n## Areas of Growth\n\n`
  review += `_Consider adding notes about skills developed, challenges overcome, and areas for continued improvement._\n`

  return review
}

export function generateYearlyReview(
  year: string,
  achievements: Achievement[],
  profile: TrackerProfile | null
): string {
  const name = profile?.name || 'Team Member'
  const role = profile?.role ? ROLE_LABELS[profile.role] : 'IT Professional'

  const quarterGroups = groupByQuarter(achievements)
  const byCat: Record<string, Achievement[]> = {}
  for (const a of achievements) {
    const cat = CATEGORY_LABELS[a.category] || a.category
    if (!byCat[cat]) byCat[cat] = []
    byCat[cat].push(a)
  }

  let review = `# ${year} Annual Performance Review - ${name}\n`
  review += `**Role:** ${role}\n\n`

  review += `## Executive Summary\n\n`
  review += `In ${year}, I made ${achievements.length} documented contributions across ${Object.keys(byCat).length} categories and ${Object.keys(quarterGroups).length} quarters. `

  const topCategories = Object.entries(byCat)
    .sort((a, b) => b[1].length - a[1].length)
    .slice(0, 3)
    .map(([cat]) => cat)
  review += `Key strengths demonstrated in ${topCategories.join(', ')}.\n\n`

  // Strength distribution
  const strengthCounts = { Strong: 0, Good: 0, Fair: 0, Basic: 0, Draft: 0 }
  for (const a of achievements) {
    const { label } = calculateStrength(a)
    strengthCounts[label as keyof typeof strengthCounts]++
  }
  review += `**Entry quality:** ${strengthCounts.Strong} strong, ${strengthCounts.Good} good, ${strengthCounts.Fair} fair, ${strengthCounts.Basic + strengthCounts.Draft} need detail\n\n`

  review += `## Quarterly Breakdown\n\n`
  for (const [q, items] of Object.entries(quarterGroups)) {
    if (!q.includes(year)) continue
    review += `### ${q} (${items.length} contributions)\n\n`
    for (const item of items) {
      review += `- **${item.title}**: ${item.description ? item.description.slice(0, 120) : '(no description)'}${item.description && item.description.length > 120 ? '...' : ''}\n`
    }
    review += `\n`
  }

  review += `## Top Achievements\n\n`
  const sorted = [...achievements].sort((a, b) => {
    return calculateStrength(b).score - calculateStrength(a).score
  })
  for (const item of sorted.slice(0, 5)) {
    review += `### ${item.title}\n`
    if (item.description) review += `${item.description}\n`
    if (item.impact) review += `- **Impact:** ${item.impact}\n`
    if (item.metrics) review += `- **Metrics:** ${item.metrics}\n`
    if (item.collaborators && item.collaborators.length > 0) {
      review += `- **Collaborators:** ${item.collaborators.join(', ')}\n`
    }
    if (item.customFields && item.customFields.length > 0) {
      for (const cf of item.customFields) {
        review += `- **${cf.key}:** ${cf.value}\n`
      }
    }
    review += `\n`
  }

  review += `## Negotiation Talking Points\n\n`
  review += `Use these data points when discussing compensation, promotion, or role expansion:\n\n`
  review += `- **Volume:** ${achievements.length} documented contributions in ${year}\n`
  review += `- **Breadth:** Work spanning ${Object.keys(byCat).length} different categories\n`
  review += `- **Consistency:** Active contributions across ${Object.keys(quarterGroups).filter((q) => q.includes(year)).length} quarters\n`

  const highConfidence = achievements.filter((a) => a.confidence === 'high')
  if (highConfidence.length > 0) {
    review += `- **High-confidence wins:** ${highConfidence.length} achievements with clear, measurable outcomes\n`
  }

  const metricsItems = achievements.filter((a) => a.metrics)
  if (metricsItems.length > 0) {
    review += `- **Quantified impact:**\n`
    for (const a of metricsItems) {
      review += `  - ${a.title}: ${a.metrics}\n`
    }
  }

  const allCollaborators = Array.from(new Set(achievements.flatMap((a) => a.collaborators || []).filter(Boolean)))
  if (allCollaborators.length > 0) {
    review += `- **Cross-functional reach:** Collaborated with ${allCollaborators.length} individuals/teams\n`
  }

  review += `\n## Skills & Competencies Demonstrated\n\n`
  const allTags = Array.from(new Set(achievements.flatMap((a) => a.tags).filter(Boolean)))
  if (allTags.length > 0) {
    review += allTags.map((t) => `\`${t}\``).join(', ') + '\n'
  } else {
    review += `_Add tags to your achievements to auto-generate a skills summary._\n`
  }

  return review
}

export function generateInterviewAnswer(achievement: Achievement): string {
  let answer = `## STAR Answer: ${achievement.title}\n\n`

  answer += `### Situation\n`
  const desc = achievement.description || achievement.title
  answer += `In my role as ${ROLE_LABELS[achievement.role]}, I encountered a situation where ${desc.toLowerCase().startsWith('i ') ? desc : 'I needed to ' + desc.toLowerCase()}\n`
  if (achievement.freeformNotes) {
    answer += `\n_Additional context: ${achievement.freeformNotes}_\n`
  }
  answer += `\n`

  answer += `### Task\n`
  answer += `My responsibility was to ${achievement.title.toLowerCase()}. This fell under ${CATEGORY_LABELS[achievement.category].toLowerCase()} and required focused effort to deliver results.\n`
  if (achievement.collaborators && achievement.collaborators.length > 0) {
    answer += `I worked alongside ${achievement.collaborators.join(', ')} on this effort.\n`
  }
  answer += `\n`

  answer += `### Action\n`
  if (achievement.description) {
    answer += `${achievement.description}\n`
  }
  if (achievement.tags.length > 0) {
    answer += `\nKey skills applied: ${achievement.tags.join(', ')}\n`
  }
  if (achievement.customFields && achievement.customFields.length > 0) {
    for (const cf of achievement.customFields) {
      answer += `- ${cf.key}: ${cf.value}\n`
    }
  }
  answer += `\n`

  answer += `### Result\n`
  if (achievement.impact) {
    answer += `${achievement.impact}\n`
  }
  if (achievement.metrics) {
    answer += `Measurable outcome: ${achievement.metrics}\n`
  }
  if (achievement.links && achievement.links.length > 0) {
    answer += `\nReferences: ${achievement.links.join(', ')}\n`
  }
  if (!achievement.impact && !achievement.metrics) {
    answer += `_Add impact and metrics to this achievement for a stronger STAR answer._\n`
  }

  return answer
}

export function generateInterviewQuestions(achievements: Achievement[], role: Role): string[] {
  const baseQuestions: Record<string, string[]> = {
    feature: [
      'Tell me about a complex feature you delivered end to end.',
      'Describe a time you had to make trade-offs in a feature design.',
    ],
    bugfix: [
      'Tell me about a critical bug you diagnosed and fixed.',
      'Describe your debugging process for a difficult issue.',
    ],
    optimization: [
      'Tell me about a time you improved system performance.',
      'How do you identify and prioritize optimization opportunities?',
    ],
    leadership: [
      'Describe a time you took ownership of a project.',
      'Tell me about a time you led a team through a challenge.',
    ],
    process: [
      'How have you improved your team\'s development process?',
      'Tell me about a workflow improvement you introduced.',
    ],
    mentoring: [
      'Tell me about a time you helped a colleague grow.',
      'How do you approach knowledge sharing in your team?',
    ],
    collaboration: [
      'Describe a time you worked across teams to deliver a result.',
      'Tell me about a challenging cross-functional project.',
    ],
    initiative: [
      'Tell me about a time you went beyond your job description.',
      'Describe an innovative solution you proposed.',
    ],
  }

  const categories = Array.from(new Set(achievements.map((a) => a.category)))
  const questions: string[] = []

  for (const cat of categories) {
    const catQuestions = baseQuestions[cat]
    if (catQuestions) {
      questions.push(...catQuestions)
    }
  }

  const roleQuestions: Partial<Record<Role, string[]>> = {
    dev: [
      'How do you approach code reviews?',
      'Describe your experience with system design.',
    ],
    qa: [
      'How do you decide what to test?',
      'Tell me about a time your testing caught a critical issue.',
    ],
    pm: [
      'How do you prioritize competing demands?',
      'Describe how you measure product success.',
    ],
    devops: [
      'How do you approach incident response?',
      'Tell me about a deployment pipeline you improved.',
    ],
  }

  if (roleQuestions[role]) {
    questions.push(...roleQuestions[role]!)
  }

  return Array.from(new Set(questions))
}

export function exportToMarkdown(content: string, filename: string): void {
  if (typeof window === 'undefined') return
  const blob = new Blob([content], { type: 'text/markdown' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}
