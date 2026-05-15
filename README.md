# ShipTrack

A real-time PM tool for tracking weekly project submissions across a 6-week cohort program.

## What it does

ShipTrack gives cohort organizers a live kanban view of who's shipping what each week. Each person's card shows their pitch, links to their repo/live URL/loom, and which fields are still missing — so you can tell at a glance who needs a nudge.

**Board columns**
| Column | Meaning |
|---|---|
| Not Started | No submission started |
| In Progress | Working on it |
| Submitted | PR merged / live |
| PR Open | Pull request open, under review |

**Card states**
- Gray pills = missing fields (pitch, repo, live URL, loom)
- Green border = all fields filled in

## Features

- **4-column kanban** per week, with live member counts
- **Click any card** to edit — update name, pitch, URLs, status
- **Add submission** button to add new members on the fly
- **Delete** a submission from the edit modal
- **6-week switcher** in the sidebar — each week is independent
- **Persisted locally** — all changes saved to `localStorage`, survive page refreshes
- **Live header stats** — submitted / in progress / total counts update instantly

## Running locally

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Tech stack

- [Next.js 16](https://nextjs.org/) (App Router)
- [Tailwind CSS v4](https://tailwindcss.com/)
- TypeScript
- `localStorage` for real-time persistence (no backend required)

## Project structure

```
app/
  page.tsx          # Root page — state, layout, modal wiring
  layout.tsx        # HTML shell
  globals.css       # Base styles
components/
  Sidebar.tsx       # Left nav + week switcher
  KanbanBoard.tsx   # 4-column board
  MemberCard.tsx    # Individual submission card
  MemberModal.tsx   # Add / edit modal
lib/
  data.ts           # Types, seed data, localStorage helpers
```

## Roadmap

- [ ] Drag-and-drop between columns
- [ ] Per-week deadline countdown
- [ ] Export submissions as CSV
- [ ] Backend sync (Supabase / PlanetScale)
