# Career Tracker

A web app for IT professionals to track achievements, generate performance review write-ups, and prepare for interviews.

## Features

- **Achievement Logging** - Record milestones with date, role, category, impact, metrics, and tags
- **Quarterly & Yearly Reviews** - Auto-generate polished review summaries with negotiation talking points
- **Interview Prep** - Generate STAR (Situation, Task, Action, Result) answers from your achievements
- **Role-Based** - Works for Developers, QAs, PMs, Designers, DevOps, Data Engineers, and more
- **Export** - Copy to clipboard or download as Markdown
- **Client-Side** - All data stored in browser localStorage, no backend needed

## Pages

- `/` - Main dashboard: profile setup, add achievements, stats, timeline
- `/review` - Generate quarterly or yearly performance review write-ups
- `/interview` - STAR-method interview answers and role-based question bank

## Tech Stack

- [Next.js](https://nextjs.org/) (App Router)
- [Tailwind CSS](https://tailwindcss.com/) v4
- TypeScript
- localStorage for persistence

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to use the Career Tracker.

## How to Use

1. **Set your profile** - Click "Set Profile" to enter your name, role, team, and company
2. **Log achievements** - Click "+ Add Achievement" and fill in the details
3. **Generate reviews** - Go to `/review`, select a quarter or year, and generate your write-up
4. **Prep for interviews** - Go to `/interview`, select an achievement, and get a STAR answer
5. **Export** - Copy or download generated content as Markdown
