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
  votes?: number;
  competeForWin: boolean;
  week: number;
}

export interface Week {
  id: number;
  label: string;
  track: string;
  deadline: string;
  votingTime: string;
  zoomUrl: string;
}

export const WEEKS: Week[] = [
  { id: 1, label: "Week 1 · PM tool", track: "PM tool build", deadline: "Fri May 16 · 5pm EST", votingTime: "May 16 · 6pm EST", zoomUrl: "https://zoom.us/j/example" },
  { id: 2, label: "Week 2 · Comms", track: "Comms tool", deadline: "Fri May 23 · 5pm EST", votingTime: "May 23 · 6pm EST", zoomUrl: "https://zoom.us/j/example" },
  { id: 3, label: "Week 3 · Mkt", track: "Marketing tool", deadline: "Fri May 30 · 5pm EST", votingTime: "May 30 · 6pm EST", zoomUrl: "https://zoom.us/j/example" },
  { id: 4, label: "Week 4 · Edu", track: "Education tool", deadline: "Fri Jun 6 · 5pm EST", votingTime: "Jun 6 · 6pm EST", zoomUrl: "https://zoom.us/j/example" },
  { id: 5, label: "Week 5 · Startup", track: "Startup tool", deadline: "Fri Jun 13 · 5pm EST", votingTime: "Jun 13 · 6pm EST", zoomUrl: "https://zoom.us/j/example" },
  { id: 6, label: "Week 6 · OSS", track: "OSS tool", deadline: "Fri Jun 20 · 5pm EST", votingTime: "Jun 20 · 6pm EST", zoomUrl: "https://zoom.us/j/example" },
];

export const MEMBERS: Member[] = [
  { id: "1", name: "Simran Kumari", githubHandle: "SimranKumari30", pitch: "Work in progress — will update before 5pm EST.", repoUrl: "https://github.com/SimranKumari30/cursor-boston-w1pm-placeholder", liveUrl: undefined, loomUrl: undefined, status: "pr_open", votes: 11, competeForWin: false, week: 1 },
  { id: "2", name: "Sam Bell", githubHandle: "sambell", pitch: "A kanban board for dev teams that auto-syncs with GitHub PRs.", repoUrl: "https://github.com/sambell/shipboard", liveUrl: "https://shipboard.vercel.app", loomUrl: "https://loom.com/share/abc123", status: "submitted", votes: 14, competeForWin: true, week: 1 },
  { id: "3", name: "Maya Rodriguez", githubHandle: "mayarod", pitch: "Kanban for shipping at the speed of thought.", repoUrl: "https://github.com/mayarod/flowtrack", liveUrl: "https://flowtrack.vercel.app", loomUrl: undefined, status: "in_progress", votes: 8, competeForWin: true, week: 1 },
  { id: "4", name: "Tyler Nguyen", githubHandle: "tylern", pitch: "One-click PM with context switching.", repoUrl: "https://github.com/tylern/contextpm", liveUrl: undefined, loomUrl: undefined, status: "in_progress", votes: 6, competeForWin: true, week: 1 },
  { id: "5", name: "Dana Lee", githubHandle: "danalee", pitch: "Visual sprint planning with AI suggestions.", repoUrl: "https://github.com/danalee/sprintviz", liveUrl: "https://sprintviz.vercel.app", loomUrl: "https://loom.com/share/def456", status: "submitted", votes: 7, competeForWin: true, week: 1 },
  { id: "6", name: "Alex Kim", githubHandle: "alexkim", pitch: undefined, repoUrl: undefined, liveUrl: undefined, loomUrl: undefined, status: "not_started", votes: 0, competeForWin: false, week: 1 },
  { id: "7", name: "Jordan Park", githubHandle: "jordanp", pitch: undefined, repoUrl: undefined, liveUrl: undefined, loomUrl: undefined, status: "not_started", votes: 0, competeForWin: false, week: 1 },
  { id: "8", name: "Priya Sharma", githubHandle: "priyasharma", pitch: "Drag-and-drop task manager built for async teams.", repoUrl: "https://github.com/priyasharma/asyncboard", liveUrl: "https://asyncboard.vercel.app", loomUrl: "https://loom.com/share/ghi789", status: "submitted", votes: 5, competeForWin: true, week: 1 },
  { id: "9", name: "Ethan Brooks", githubHandle: "ethanb", pitch: "Minimal todo tracker with weekly review.", repoUrl: "https://github.com/ethanb/weeklytrack", liveUrl: undefined, loomUrl: undefined, status: "pr_open", votes: 3, competeForWin: false, week: 1 },
];

export const STATUS_LABELS: Record<Status, string> = {
  not_started: "NOT STARTED",
  in_progress: "IN PROGRESS",
  submitted: "SUBMITTED",
  pr_open: "PR OPEN",
};

export const STATUS_ORDER: Status[] = ["not_started", "in_progress", "submitted", "pr_open"];

export function getMissingFields(member: Member): string[] {
  const missing: string[] = [];
  if (!member.pitch) missing.push("pitch");
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

export const AVATAR_COLORS: Record<string, string> = {
  "SK": "#7C6FCD",
  "SB": "#4F8EF7",
  "MR": "#2ECC71",
  "TN": "#E67E22",
  "DL": "#9B59B6",
  "AK": "#95A5A6",
  "JP": "#95A5A6",
  "PS": "#E74C3C",
  "EB": "#1ABC9C",
};
