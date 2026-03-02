// Types and utilities for the Career Tracker feature

import {
  collection,
  doc,
  getDocs,
  addDoc,
  deleteDoc,
  updateDoc,
  setDoc,
  getDoc,
  query,
  orderBy,
} from 'firebase/firestore'
import { getFirebaseDb } from './firebase'

function getDb() {
  const db = getFirebaseDb()
  if (!db) throw new Error('Firestore not initialized')
  return db
}

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

export type WinType = 'technical' | 'leadership' | 'mentoring' | 'process' | 'business' | 'learning' | 'general'

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
  // New flexible fields
  notes: string // free-form notes
  winType: WinType // what kind of win this is
  visibility: 'team' | 'org' | 'company' | 'external' // who saw/benefited
  effort: 'small' | 'medium' | 'large' | '' // rough effort level
  customFields: Record<string, string> // user-defined key-value pairs
}

export interface TrackerProfile {
  name: string
  role: Role
  team: string
  company: string
}

export const WIN_TYPE_LABELS: Record<WinType, string> = {
  technical: 'Technical Achievement',
  leadership: 'Leadership / Ownership',
  mentoring: 'Mentoring / Coaching',
  process: 'Process / Workflow',
  business: 'Business Impact',
  learning: 'Learning / Growth',
  general: 'General Win',
}

export const VISIBILITY_LABELS: Record<string, string> = {
  team: 'Team-level',
  org: 'Org-level',
  company: 'Company-wide',
  external: 'External / Industry',
}

export const EFFORT_LABELS: Record<string, string> = {
  small: 'Quick win (hours/days)',
  medium: 'Medium effort (weeks)',
  large: 'Major effort (months)',
}

// Achievement templates for quick entry
export interface AchievementTemplate {
  name: string
  winType: WinType
  category: Category
  placeholders: {
    title: string
    description: string
    impact: string
    metrics: string
    tags: string
  }
}

export const ACHIEVEMENT_TEMPLATES: AchievementTemplate[] = [
  {
    name: 'Shipped a Feature',
    winType: 'technical',
    category: 'feature',
    placeholders: {
      title: 'e.g. Built real-time notification system',
      description: 'What did you build? What was the technical approach?',
      impact: 'e.g. Improved user engagement by enabling instant updates',
      metrics: 'e.g. 30% increase in DAU, 2s average delivery time',
      tags: 'React, WebSocket, Redis',
    },
  },
  {
    name: 'Fixed a Critical Bug',
    winType: 'technical',
    category: 'bugfix',
    placeholders: {
      title: 'e.g. Resolved production memory leak',
      description: 'What was the issue? How did you diagnose and fix it?',
      impact: 'e.g. Prevented recurring outages affecting 10k users',
      metrics: 'e.g. Reduced crash rate from 5% to 0.1%',
      tags: 'debugging, Node.js, monitoring',
    },
  },
  {
    name: 'Led a Project',
    winType: 'leadership',
    category: 'leadership',
    placeholders: {
      title: 'e.g. Led migration to microservices',
      description: 'What did you lead? How did you coordinate the team?',
      impact: 'e.g. Successfully migrated 3 services with zero downtime',
      metrics: 'e.g. 5 engineers, 3 months, on time and budget',
      tags: 'project management, architecture, team lead',
    },
  },
  {
    name: 'Mentored Someone',
    winType: 'mentoring',
    category: 'mentoring',
    placeholders: {
      title: 'e.g. Onboarded and mentored new hire',
      description: 'Who did you help? What did you teach or support?',
      impact: 'e.g. New hire was productive within 2 weeks',
      metrics: '',
      tags: 'mentoring, onboarding, knowledge transfer',
    },
  },
  {
    name: 'Improved a Process',
    winType: 'process',
    category: 'process',
    placeholders: {
      title: 'e.g. Automated deployment pipeline',
      description: 'What process did you improve? What was wrong before?',
      impact: 'e.g. Reduced deployment time from 2 hours to 10 minutes',
      metrics: 'e.g. 90% time saved per release, 3x more releases per week',
      tags: 'CI/CD, automation, DevOps',
    },
  },
  {
    name: 'Learned Something New',
    winType: 'learning',
    category: 'learning',
    placeholders: {
      title: 'e.g. Completed AWS Solutions Architect certification',
      description: 'What did you learn? How are you applying it?',
      impact: 'e.g. Now leading cloud architecture decisions for the team',
      metrics: '',
      tags: 'AWS, certification, cloud',
    },
  },
  {
    name: 'Business / Product Impact',
    winType: 'business',
    category: 'initiative',
    placeholders: {
      title: 'e.g. Proposed and shipped pricing page A/B test',
      description: 'What was the business context? What did you do?',
      impact: 'e.g. Increased conversion rate leading to more signups',
      metrics: 'e.g. 15% uplift in conversion, $50k ARR impact',
      tags: 'product, growth, A/B testing',
    },
  },
  {
    name: 'Quick / Qualitative Win',
    winType: 'general',
    category: 'other',
    placeholders: {
      title: 'What happened?',
      description: 'Brief context (optional)',
      impact: '',
      metrics: '',
      tags: '',
    },
  },
]

// Smart category suggestion based on keywords
export function suggestCategory(text: string): Category {
  const lower = text.toLowerCase()
  if (/\b(ship|build|feature|implement|develop|launch|release)\b/.test(lower)) return 'feature'
  if (/\b(fix|bug|debug|resolve|patch|hotfix|crash)\b/.test(lower)) return 'bugfix'
  if (/\b(optim|perf|speed|fast|latency|cache|scale)\b/.test(lower)) return 'optimization'
  if (/\b(lead|own|drove|manage|coordin|direct)\b/.test(lower)) return 'leadership'
  if (/\b(process|automat|pipeline|workflow|ci\/cd|devops)\b/.test(lower)) return 'process'
  if (/\b(mentor|teach|onboard|coach|train|pair)\b/.test(lower)) return 'mentoring'
  if (/\b(learn|cert|course|study|skill|grow)\b/.test(lower)) return 'learning'
  if (/\b(collab|cross.?team|partner|align|stakeholder)\b/.test(lower)) return 'collaboration'
  if (/\b(initiat|innovat|propos|experiment|prototype|hack)\b/.test(lower)) return 'initiative'
  return 'other'
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

// ---- Firestore helpers ----

const ACHIEVEMENTS_COLLECTION = 'achievements'
const PROFILE_DOC = 'profile'
const SETTINGS_COLLECTION = 'settings'

export async function getAchievements(): Promise<Achievement[]> {
  try {
    const database = getDb()
    const q = query(collection(database, ACHIEVEMENTS_COLLECTION), orderBy('date', 'desc'))
    const snapshot = await getDocs(q)
    return snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as Achievement))
  } catch (error) {
    console.error('Error fetching achievements:', error)
    return []
  }
}

export async function addAchievement(
  item: Omit<Achievement, 'id' | 'quarter'>
): Promise<Achievement> {
  const database = getDb()
  const date = new Date(item.date)
  const q = Math.ceil((date.getMonth() + 1) / 3)
  const quarter = `Q${q} ${date.getFullYear()}`

  const docRef = await addDoc(collection(database, ACHIEVEMENTS_COLLECTION), {
    ...item,
    quarter,
  })

  return { ...item, id: docRef.id, quarter }
}

export async function deleteAchievement(id: string): Promise<void> {
  const database = getDb()
  await deleteDoc(doc(database, ACHIEVEMENTS_COLLECTION, id))
}

export async function updateAchievement(updated: Achievement): Promise<void> {
  const database = getDb()
  const { id, ...data } = updated
  await updateDoc(doc(database, ACHIEVEMENTS_COLLECTION, id), data)
}

export async function getProfile(): Promise<TrackerProfile | null> {
  try {
    const database = getDb()
    const docSnap = await getDoc(doc(database, SETTINGS_COLLECTION, PROFILE_DOC))
    if (docSnap.exists()) {
      return docSnap.data() as TrackerProfile
    }
    return null
  } catch (error) {
    console.error('Error fetching profile:', error)
    return null
  }
}

export async function saveProfile(profile: TrackerProfile): Promise<void> {
  const database = getDb()
  await setDoc(doc(database, SETTINGS_COLLECTION, PROFILE_DOC), profile)
}

// ---- Grouping helpers ----

export function groupByQuarter(achievements: Achievement[]): Record<string, Achievement[]> {
  const groups: Record<string, Achievement[]> = {}
  for (const a of achievements) {
    if (!groups[a.quarter]) groups[a.quarter] = []
    groups[a.quarter].push(a)
  }
  // Sort quarters descending
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
      review += `${item.description}\n`
      if (item.impact) review += `- **Impact:** ${item.impact}\n`
      if (item.metrics) review += `- **Metrics:** ${item.metrics}\n`
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

  review += `## Quarterly Breakdown\n\n`
  for (const [q, items] of Object.entries(quarterGroups)) {
    if (!q.includes(year)) continue
    review += `### ${q} (${items.length} contributions)\n\n`
    for (const item of items) {
      review += `- **${item.title}**: ${item.description.slice(0, 120)}${item.description.length > 120 ? '...' : ''}\n`
    }
    review += `\n`
  }

  review += `## Top Achievements\n\n`
  const sorted = [...achievements].sort((a, b) => {
    const scoreA = (a.metrics ? 2 : 0) + (a.impact ? 1 : 0)
    const scoreB = (b.metrics ? 2 : 0) + (b.impact ? 1 : 0)
    return scoreB - scoreA
  })
  for (const item of sorted.slice(0, 5)) {
    review += `### ${item.title}\n`
    review += `${item.description}\n`
    if (item.impact) review += `- **Impact:** ${item.impact}\n`
    if (item.metrics) review += `- **Metrics:** ${item.metrics}\n`
    review += `\n`
  }

  review += `## Negotiation Talking Points\n\n`
  review += `Use these data points when discussing compensation, promotion, or role expansion:\n\n`
  review += `- **Volume:** ${achievements.length} documented contributions in ${year}\n`
  review += `- **Breadth:** Work spanning ${Object.keys(byCat).length} different categories\n`
  review += `- **Consistency:** Active contributions across ${Object.keys(quarterGroups).filter((q) => q.includes(year)).length} quarters\n`

  const metricsItems = achievements.filter((a) => a.metrics)
  if (metricsItems.length > 0) {
    review += `- **Quantified impact:**\n`
    for (const a of metricsItems) {
      review += `  - ${a.title}: ${a.metrics}\n`
    }
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
  answer += `In my role as ${ROLE_LABELS[achievement.role]}, I encountered a situation where ${achievement.description.toLowerCase().startsWith('i ') ? achievement.description : 'I needed to ' + achievement.description.toLowerCase()}\n\n`

  answer += `### Task\n`
  answer += `My responsibility was to ${achievement.title.toLowerCase()}. This fell under ${CATEGORY_LABELS[achievement.category].toLowerCase()} and required focused effort to deliver results.\n\n`

  answer += `### Action\n`
  answer += `${achievement.description}\n`
  if (achievement.tags.length > 0) {
    answer += `\nKey skills applied: ${achievement.tags.join(', ')}\n`
  }
  answer += `\n`

  answer += `### Result\n`
  if (achievement.impact) {
    answer += `${achievement.impact}\n`
  }
  if (achievement.metrics) {
    answer += `Measurable outcome: ${achievement.metrics}\n`
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

// ---- Resume bullet generator ----

export function generateResumeBullets(achievements: Achievement[], profile: TrackerProfile | null): string {
  const role = profile?.role ? ROLE_LABELS[profile.role] : 'IT Professional'
  let output = `# Resume Bullets\n`
  output += `**Role:** ${role}\n\n`

  for (const a of achievements) {
    // Action verb + what + result format
    let bullet = `- ${a.title}`
    if (a.metrics) {
      bullet += ` (${a.metrics})`
    } else if (a.impact) {
      bullet += ` - ${a.impact}`
    }
    output += bullet + '\n'
  }

  output += `\n## Detailed Bullets\n\n`
  for (const a of achievements) {
    output += `**${a.title}**\n`
    if (a.description) output += `${a.description}\n`
    if (a.impact) output += `Impact: ${a.impact}\n`
    if (a.metrics) output += `Metrics: ${a.metrics}\n`
    if (a.tags.length > 0) output += `Technologies: ${a.tags.join(', ')}\n`
    output += `\n`
  }

  const allTags = Array.from(new Set(achievements.flatMap((a) => a.tags).filter(Boolean)))
  if (allTags.length > 0) {
    output += `## Skills Summary\n\n`
    output += allTags.join(' | ') + '\n'
  }

  return output
}

// ---- Promotion case builder ----

export function generatePromotionCase(
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

  const byVisibility: Record<string, Achievement[]> = {}
  for (const a of achievements) {
    const v = a.visibility || 'team'
    if (!byVisibility[v]) byVisibility[v] = []
    byVisibility[v].push(a)
  }

  let doc = `# Promotion Case - ${name}\n`
  doc += `**Current Role:** ${role}\n\n`

  doc += `## Executive Summary\n\n`
  doc += `${name} has made ${achievements.length} documented contributions demonstrating readiness for the next level. `
  doc += `Work spans ${Object.keys(byCat).length} areas with impact at `
  const visLevels = Object.keys(byVisibility).map((v) => VISIBILITY_LABELS[v] || v)
  doc += `${visLevels.join(', ')} visibility.\n\n`

  doc += `## Evidence of Next-Level Performance\n\n`

  // Leadership evidence
  const leadershipItems = achievements.filter(
    (a) => a.winType === 'leadership' || a.category === 'leadership' || a.category === 'mentoring'
  )
  if (leadershipItems.length > 0) {
    doc += `### Leadership & Influence\n\n`
    for (const item of leadershipItems) {
      doc += `- **${item.title}**: ${item.description || ''}\n`
      if (item.impact) doc += `  - Impact: ${item.impact}\n`
    }
    doc += `\n`
  }

  // Technical depth
  const techItems = achievements.filter(
    (a) => a.winType === 'technical' || a.category === 'feature' || a.category === 'optimization'
  )
  if (techItems.length > 0) {
    doc += `### Technical Excellence\n\n`
    for (const item of techItems) {
      doc += `- **${item.title}**: ${item.description || ''}\n`
      if (item.metrics) doc += `  - Metrics: ${item.metrics}\n`
    }
    doc += `\n`
  }

  // Business impact
  const bizItems = achievements.filter((a) => a.winType === 'business')
  if (bizItems.length > 0) {
    doc += `### Business Impact\n\n`
    for (const item of bizItems) {
      doc += `- **${item.title}**: ${item.impact || item.description || ''}\n`
      if (item.metrics) doc += `  - Metrics: ${item.metrics}\n`
    }
    doc += `\n`
  }

  // Scope & visibility
  doc += `## Scope of Impact\n\n`
  for (const [vis, items] of Object.entries(byVisibility)) {
    doc += `- **${VISIBILITY_LABELS[vis] || vis}:** ${items.length} contributions\n`
  }

  // Effort distribution
  const byEffort: Record<string, number> = {}
  for (const a of achievements) {
    const e = a.effort || 'unknown'
    byEffort[e] = (byEffort[e] || 0) + 1
  }
  const largeEffort = byEffort['large'] || 0
  if (largeEffort > 0) {
    doc += `\n- **${largeEffort} major initiative(s)** spanning months of effort\n`
  }

  doc += `\n## Key Metrics\n\n`
  const metricsItems = achievements.filter((a) => a.metrics)
  if (metricsItems.length > 0) {
    for (const a of metricsItems) {
      doc += `- ${a.title}: ${a.metrics}\n`
    }
  } else {
    doc += `_Add metrics to achievements to strengthen this section._\n`
  }

  doc += `\n## Skills & Growth Areas\n\n`
  const allTags = Array.from(new Set(achievements.flatMap((a) => a.tags).filter(Boolean)))
  if (allTags.length > 0) {
    doc += allTags.map((t) => `\`${t}\``).join(', ') + '\n'
  }

  return doc
}

// ---- Search / filter helpers ----

export function filterAchievements(
  achievements: Achievement[],
  filters: {
    search?: string
    category?: Category | ''
    winType?: WinType | ''
    quarter?: string
    tags?: string[]
  }
): Achievement[] {
  let results = achievements

  if (filters.search) {
    const q = filters.search.toLowerCase()
    results = results.filter(
      (a) =>
        a.title.toLowerCase().includes(q) ||
        a.description.toLowerCase().includes(q) ||
        a.impact.toLowerCase().includes(q) ||
        (a.notes || '').toLowerCase().includes(q) ||
        a.tags.some((t) => t.toLowerCase().includes(q))
    )
  }

  if (filters.category) {
    results = results.filter((a) => a.category === filters.category)
  }

  if (filters.winType) {
    results = results.filter((a) => a.winType === filters.winType)
  }

  if (filters.quarter) {
    results = results.filter((a) => a.quarter === filters.quarter)
  }

  if (filters.tags && filters.tags.length > 0) {
    results = results.filter((a) =>
      filters.tags!.some((t) => a.tags.includes(t))
    )
  }

  return results
}

export function getAllTags(achievements: Achievement[]): string[] {
  return Array.from(new Set(achievements.flatMap((a) => a.tags).filter(Boolean))).sort()
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
