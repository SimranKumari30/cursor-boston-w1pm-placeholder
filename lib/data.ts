export type Status = "not_started" | "in_progress" | "submitted" | "pr_open";

export interface Member {
  id: string;
  name: string;
  githubHandle: string;
  pitch?: string;
  repoUrl?: string;
  liveUrl?: string;
  loomUrl?: string;
  status: Status;
  week: number;
}

export interface Week {
  id: number;
  label: string;
  track: string;
  deadline: string;
  deadlineDate: string; // ISO date string for comparison e.g. "2026-05-16"
}

export type WeekState = "past" | "live" | "upcoming";

export function weekState(week: Week, liveWeekId: number): WeekState {
  if (week.id < liveWeekId) return "past";
  if (week.id === liveWeekId) return "live";
  return "upcoming";
}

export interface WeekConfig {
  branch: string;
  submissionsPath: string;
}

export const WEEK_CONFIG: Record<number, WeekConfig> = {
  1: { branch: "c1w1pm-submission",      submissionsPath: "content/summer-cohort/c1/w1-pm/submissions" },
  2: { branch: "c1w2comms-submission",   submissionsPath: "content/summer-cohort/c1/w2-comms/submissions" },
  3: { branch: "c1w3mkt-submission",     submissionsPath: "content/summer-cohort/c1/w3-mkt/submissions" },
  4: { branch: "c1w4edu-submission",     submissionsPath: "content/summer-cohort/c1/w4-edu/submissions" },
  5: { branch: "c1w5startup-submission", submissionsPath: "content/summer-cohort/c1/w5-startup/submissions" },
  6: { branch: "c1w6oss-submission",     submissionsPath: "content/summer-cohort/c1/w6-oss/submissions" },
};

export const UPSTREAM_REPO = "rogerSuperBuilderAlpha/cursor-boston";

export const WEEKS: Week[] = [
  { id: 1, label: "Week 1 · PM tool",  track: "PM tool build",   deadline: "Fri May 15 · 5pm EST",  deadlineDate: "2026-05-15" },
  { id: 2, label: "Week 2 · Comms",    track: "Comms tool",      deadline: "Fri May 23 · 5pm EST",  deadlineDate: "2026-05-23" },
  { id: 3, label: "Week 3 · Mkt",      track: "Marketing tool",  deadline: "Fri May 30 · 5pm EST",  deadlineDate: "2026-05-30" },
  { id: 4, label: "Week 4 · Edu",      track: "Education tool",  deadline: "Fri Jun  6 · 5pm EST",  deadlineDate: "2026-06-06" },
  { id: 5, label: "Week 5 · Startup",  track: "Startup tool",    deadline: "Fri Jun 13 · 5pm EST",  deadlineDate: "2026-06-13" },
  { id: 6, label: "Week 6 · OSS",      track: "OSS tool",        deadline: "Fri Jun 20 · 5pm EST",  deadlineDate: "2026-06-20" },
];

export const SEED_MEMBERS: Member[] = [
  { id: "1", name: "Person 1",  githubHandle: "person1",  pitch: "A kanban board that auto-syncs with GitHub PRs.",         repoUrl: "https://github.com/person1/repo",  liveUrl: "https://person1.vercel.app", loomUrl: "https://loom.com/share/abc1", status: "submitted",   week: 1 },
  { id: "2", name: "Person 2",  githubHandle: "person2",  pitch: "Kanban for shipping at the speed of thought.",            repoUrl: "https://github.com/person2/repo",  liveUrl: "https://person2.vercel.app", loomUrl: undefined,                    status: "in_progress", week: 1 },
  { id: "3", name: "Person 3",  githubHandle: "person3",  pitch: "One-click PM with seamless context switching.",           repoUrl: "https://github.com/person3/repo",  liveUrl: undefined,                    loomUrl: undefined,                    status: "in_progress", week: 1 },
  { id: "4", name: "Person 4",  githubHandle: "person4",  pitch: "Visual sprint planner with AI suggestions.",              repoUrl: "https://github.com/person4/repo",  liveUrl: "https://person4.vercel.app", loomUrl: "https://loom.com/share/abc4", status: "submitted",   week: 1 },
  { id: "5", name: "Person 5",  githubHandle: "person5",  pitch: "Drag-and-drop task manager built for async teams.",       repoUrl: "https://github.com/person5/repo",  liveUrl: "https://person5.vercel.app", loomUrl: "https://loom.com/share/abc5", status: "submitted",   week: 1 },
  { id: "6", name: "Person 6",  githubHandle: "person6",  pitch: undefined,                                                 repoUrl: undefined,                          liveUrl: undefined,                    loomUrl: undefined,                    status: "not_started", week: 1 },
  { id: "7", name: "Person 7",  githubHandle: "person7",  pitch: undefined,                                                 repoUrl: undefined,                          liveUrl: undefined,                    loomUrl: undefined,                    status: "not_started", week: 1 },
  { id: "8", name: "Person 8",  githubHandle: "person8",  pitch: "Minimal weekly review tracker.",                          repoUrl: "https://github.com/person8/repo",  liveUrl: undefined,                    loomUrl: undefined,                    status: "pr_open",     week: 1 },
  { id: "9", name: "Person 9",  githubHandle: "person9",  pitch: "Focus timer integrated with your task list.",             repoUrl: "https://github.com/person9/repo",  liveUrl: undefined,                    loomUrl: undefined,                    status: "pr_open",     week: 1 },
];

export const STATUS_LABELS: Record<Status, string> = {
  not_started: "NOT STARTED",
  in_progress:  "IN PROGRESS",
  submitted:    "SUBMITTED",
  pr_open:      "PR OPEN",
};

export const STATUS_ORDER: Status[] = ["not_started", "submitted", "pr_open"];

export function getMissingFields(member: Member): string[] {
  const missing: string[] = [];
  if (!member.pitch)   missing.push("pitch");
  if (!member.repoUrl) missing.push("repo");
  if (!member.liveUrl) missing.push("live URL");
  if (!member.loomUrl) missing.push("loom");
  return missing;
}

export function isComplete(member: Member): boolean {
  return getMissingFields(member).length === 0;
}

export function getInitials(name: string): string {
  return name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);
}

const PALETTE = [
  "#7C6FCD", "#4F8EF7", "#2ECC71", "#E67E22",
  "#9B59B6", "#1ABC9C", "#E74C3C", "#3498DB", "#F39C12",
];

export function avatarColor(id: string): string {
  const idx = parseInt(id, 10) % PALETTE.length;
  return PALETTE[isNaN(idx) ? 0 : idx];
}

const STORAGE_KEY = "shiptrack_members";

export function loadMembers(): Member[] {
  if (typeof window === "undefined") return SEED_MEMBERS;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw) as Member[];
  } catch { /* ignore */ }
  return SEED_MEMBERS;
}

export function saveMembers(members: Member[]): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(members));
}
