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
  /** Direct link to the open GitHub PR (for pr_open entries) */
  prUrl?: string;
  /** Direct link to the submission JSON file on GitHub */
  submissionUrl?: string;
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
  { id: 2, label: "Week 2 · Comms",    track: "Comms tool",      deadline: "Fri May 22 · 5pm EST",  deadlineDate: "2026-05-22" },
  { id: 3, label: "Week 3 · Mkt",      track: "Marketing tool",  deadline: "Fri May 29 · 5pm EST",  deadlineDate: "2026-05-29" },
  { id: 4, label: "Week 4 · Edu",      track: "Education tool",  deadline: "Fri Jun  5 · 5pm EST",  deadlineDate: "2026-06-05" },
  { id: 5, label: "Week 5 · Startup",  track: "Startup tool",    deadline: "Fri Jun 12 · 5pm EST",  deadlineDate: "2026-06-12" },
  { id: 6, label: "Week 6 · OSS",      track: "OSS tool",        deadline: "Fri Jun 19 · 5pm EST",  deadlineDate: "2026-06-19" },
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


