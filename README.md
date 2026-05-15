# ShipTrack

A real-time PM tool for tracking weekly project submissions across a 6-week cohort program. Built for Cursor Boston Cohort 1.

## What it does

ShipTrack gives cohort organizers a live kanban view of who's shipping what each week. Submission data is **auto-populated from the upstream GitHub repo** — no manual entry needed. Each card shows the member's name, pitch, field links, and which required fields are still missing.

**Board columns**
| Column | Meaning |
|---|---|
| Not Started | No submission activity yet |
| Submitted | PR merged into the submission branch |
| PR Open | Pull request open, under review |

**Card states**
- Gray pills = missing fields (pitch, repo, live URL, loom)
- Green border = all required fields filled in

## Features

- **Live GitHub sync** — auto-fetches JSON files from `rogerSuperBuilderAlpha/cursor-boston` submission branches; merged files appear as Submitted, open PRs appear as PR Open
- **Real names** — resolves GitHub display names for PR stubs via the GitHub user API
- **3-column kanban** per week, with live member counts in the header
- **Click any card** to view details; GitHub-sourced cards are read-only
- **+ Add** button for manually tracking members not yet in GitHub
- **6-week switcher** — each week maps to its own upstream branch and submissions path
- **Auto-refresh** every 60 seconds; manual refresh button with spinner in the header
- **Local additions** persisted to `localStorage` and merged with GitHub data

## Running locally

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

Optionally set a GitHub token to raise the API rate limit (60 → 5000 req/hr):

```bash
# .env.local
GITHUB_TOKEN=ghp_your_token_here
```

## Tech stack

- [Next.js 16](https://nextjs.org/) (App Router, server-side API route)
- [Tailwind CSS v4](https://tailwindcss.com/)
- TypeScript
- GitHub REST API (public, no auth required for public repos)
- `localStorage` for local-only additions

## Project structure

```
app/
  page.tsx                 # Root page — state, layout, modal wiring
  layout.tsx               # HTML shell
  globals.css              # Base styles
  api/submissions/
    route.ts               # Server route: fetches GitHub branch files + open PRs
components/
  Sidebar.tsx              # Left nav + week switcher
  KanbanBoard.tsx          # 3-column board
  MemberCard.tsx           # Individual submission card
  MemberModal.tsx          # View / add modal
lib/
  data.ts                  # Types, week→branch config, seed data, localStorage helpers
```

## Upstream config

Each week maps to a branch and submissions path in `lib/data.ts`:

```ts
WEEK_CONFIG = {
  1: { branch: "c1w1pm-submission",      submissionsPath: "content/summer-cohort/c1/w1-pm/submissions" },
  2: { branch: "c1w2comms-submission",   submissionsPath: "content/summer-cohort/c1/w2-comms/submissions" },
  // ...
}
```

## Roadmap

- [ ] Drag-and-drop between columns
- [ ] Per-week deadline countdown
- [ ] Export submissions as CSV
- [ ] Optional GitHub token via env for higher rate limits
