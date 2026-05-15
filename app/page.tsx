"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Member, WEEKS, weekState } from "@/lib/data";
import Sidebar, { NavItem } from "@/components/Sidebar";
import WeekBar from "@/components/WeekBar";
import KanbanBoard from "@/components/KanbanBoard";
import MemberModal from "@/components/MemberModal";
import MembersView from "@/components/MembersView";
import TrackerView from "@/components/TrackerView";

const LIVE_WEEK = 1;
const POLL_INTERVAL_MS = 60_000;

export default function Home() {
  const [activeWeek, setActiveWeek] = useState(LIVE_WEEK);
  const [activeNav, setActiveNav] = useState<NavItem>("Board");
  const [ghMembers, setGhMembers] = useState<Member[]>([]);
  const [localMembers, setLocalMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(false);
  const [lastFetched, setLastFetched] = useState<Date | null>(null);
  const [editTarget, setEditTarget] = useState<Member | null | "new">(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ── GitHub fetch ─────────────────────────────────────────────────────────────
  const fetchFromGitHub = useCallback(async (week: number) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/submissions?week=${week}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setGhMembers((data.members as Member[]) ?? []);
      setLastFetched(new Date());
    } catch (err) {
      console.warn("[ShipTrack] GitHub fetch failed:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchFromGitHub(activeWeek);
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => fetchFromGitHub(activeWeek), POLL_INTERVAL_MS);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [activeWeek, fetchFromGitHub]);

  // ── Local members (localStorage) ─────────────────────────────────────────────
  useEffect(() => {
    try {
      const raw = localStorage.getItem("shiptrack_local");
      if (raw) setLocalMembers(JSON.parse(raw));
    } catch { /* ignore */ }
  }, []);

  function persistLocal(members: Member[]) {
    setLocalMembers(members);
    localStorage.setItem("shiptrack_local", JSON.stringify(members));
  }

  // ── Derived state ─────────────────────────────────────────────────────────────
  const ghHandles = new Set(ghMembers.map((m) => m.githubHandle.toLowerCase()));
  const filteredLocal = localMembers.filter(
    (m) => m.week === activeWeek && !ghHandles.has(m.githubHandle.toLowerCase())
  );
  const members: Member[] = [...ghMembers.filter((m) => m.week === activeWeek), ...filteredLocal];

  const week      = WEEKS.find((w) => w.id === activeWeek)!;
  const wState    = weekState(week, LIVE_WEEK);
  const submitted = members.filter((m) => m.status === "submitted" || m.status === "pr_open").length;

  // Deadline countdown (only for live week)
  function hoursLeft(): number | null {
    if (wState !== "live") return null;
    const deadline = new Date(`${week.deadlineDate}T17:00:00-05:00`);
    const diff = Math.max(0, deadline.getTime() - Date.now());
    return Math.round(diff / 3_600_000);
  }
  const hrs = hoursLeft();

  // ── Week change: switch to Board view automatically ───────────────────────────
  function handleWeekChange(id: number) {
    setActiveWeek(id);
    setActiveNav("Board");
  }

  // ── Save / delete ─────────────────────────────────────────────────────────────
  function handleSave(updated: Member) {
    if (!ghHandles.has(updated.githubHandle.toLowerCase())) {
      const next = localMembers.some((m) => m.id === updated.id)
        ? localMembers.map((m) => (m.id === updated.id ? updated : m))
        : [...localMembers, { ...updated, week: activeWeek }];
      persistLocal(next);
    }
    setEditTarget(null);
  }

  function handleDelete(id: string) {
    persistLocal(localMembers.filter((m) => m.id !== id));
  }

  function relTime(d: Date) {
    const s = Math.round((Date.now() - d.getTime()) / 1000);
    if (s < 5)  return "just now";
    if (s < 60) return `${s}s ago`;
    return `${Math.round(s / 60)}m ago`;
  }

  return (
    <div className="flex h-screen bg-[#0d0d10] text-white">
      <div className="sticky left-0 z-10 flex-shrink-0">
        <Sidebar activeNav={activeNav} onNavChange={setActiveNav} />
      </div>

      <div className="flex-1 flex flex-col overflow-x-auto overflow-y-hidden min-w-0">
        {/* ── Header ─────────────────────────────────────────────────────────── */}
        <div
          className="flex items-center justify-between px-6 py-4 border-b border-[#1e1e24] flex-shrink-0"
          style={{ minWidth: "680px" }}
        >
          <div className="flex items-center gap-3">
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-bold text-white">{week.track}</h1>
                {/* Week state badge */}
                {wState === "live" && (
                  <span className="text-[9px] bg-red-500/20 text-red-400 border border-red-500/30 px-2 py-0.5 rounded font-semibold tracking-wide">
                    live
                  </span>
                )}
                {wState === "past" && (
                  <span className="text-[9px] bg-gray-500/10 text-gray-600 border border-gray-700 px-2 py-0.5 rounded font-semibold tracking-wide">
                    closed
                  </span>
                )}
                {wState === "upcoming" && (
                  <span className="text-[9px] bg-blue-500/10 text-blue-600 border border-blue-900 px-2 py-0.5 rounded font-semibold tracking-wide">
                    upcoming
                  </span>
                )}
              </div>
              <p className="text-xs text-gray-500 mt-0.5">
                Week {week.id} of {WEEKS.length} · {week.deadline} deadline
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Stats — only meaningful when there's data */}
            {members.length > 0 && (
              <div className="flex items-center gap-3 text-xs text-gray-500">
                <span><span className="text-white font-semibold">{submitted}</span> submitted</span>
                <span className="text-gray-700">·</span>
                <span><span className="text-white font-semibold">{members.length}</span> total</span>
              </div>
            )}

            {/* Refresh */}
            <button
              onClick={() => fetchFromGitHub(activeWeek)}
              disabled={loading}
              className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-300 transition-colors disabled:opacity-50"
              title="Refresh from GitHub"
            >
              <svg className={`w-3 h-3 ${loading ? "animate-spin" : ""}`} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M13.5 2.5A6.5 6.5 0 1 1 4 3.5" strokeLinecap="round"/>
                <polyline points="4,1 4,4 7,4" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              {loading ? "syncing…" : lastFetched ? relTime(lastFetched) : "sync"}
            </button>

            {/* Countdown badge — live week only */}
            {hrs !== null && (
              <div className={`flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg border ${
                hrs <= 6
                  ? "bg-red-500/10 border-red-500/20 text-red-400"
                  : "bg-yellow-500/10 border-yellow-500/20 text-yellow-400"
              }`}>
                <span className={`w-1.5 h-1.5 rounded-full animate-pulse ${hrs <= 6 ? "bg-red-400" : "bg-yellow-400"}`} />
                {hrs}h left
              </div>
            )}

            {/* Add button — available on all weeks */}
            <button
              onClick={() => setEditTarget("new")}
              className="bg-white text-black text-sm font-medium px-4 py-1.5 rounded-lg hover:bg-gray-200 transition-colors"
            >
              + Add
            </button>
          </div>
        </div>

        {/* ── Week tabs ──────────────────────────────────────────────────────── */}
        <WeekBar
          weeks={WEEKS}
          activeWeek={activeWeek}
          onWeekChange={handleWeekChange}
          liveWeek={LIVE_WEEK}
        />

        {/* ── Views ──────────────────────────────────────────────────────────── */}
        {activeNav === "Board" && (
          <div className="flex-1 overflow-y-hidden px-6 py-5" style={{ minWidth: "680px" }}>
            {loading && members.length === 0 ? (
              /* Loading skeleton */
              <div className="flex gap-4 h-full">
                {[0,1,2].map((i) => (
                  <div key={i} className="flex-1 min-w-[200px]">
                    <div className="h-3 w-24 bg-[#1e1e28] rounded mb-4" />
                    {[0,1].map((j) => (
                      <div key={j} className="bg-[#1e1e24] border border-[#2e2e38] rounded-xl p-3 mb-2.5 h-20 animate-pulse" />
                    ))}
                  </div>
                ))}
              </div>
            ) : !loading && members.length === 0 ? (
              /* Empty state */
              <div className="flex flex-col items-center justify-center h-full gap-3 text-center">
                <p className="text-gray-500 text-sm font-medium">
                  {wState === "upcoming"
                    ? "No submissions yet — this week hasn't started."
                    : wState === "past"
                    ? "No submissions were recorded for this week."
                    : "No submissions yet."}
                </p>
                <p className="text-gray-700 text-xs">
                  {wState === "upcoming"
                    ? `Opens after Week ${LIVE_WEEK} closes.`
                    : "Check back after the deadline."}
                </p>
              </div>
            ) : (
              <KanbanBoard members={members} onEdit={(m) => setEditTarget(m)} />
            )}
          </div>
        )}
        {activeNav === "Members" && <MembersView members={members} />}
        {activeNav === "Tracker" && <TrackerView />}
      </div>

      {editTarget !== null && (
        <MemberModal
          member={editTarget === "new" ? null : editTarget}
          onSave={handleSave}
          onDelete={handleDelete}
          onClose={() => setEditTarget(null)}
          readOnly={
            editTarget !== "new" &&
            editTarget !== null &&
            ghHandles.has((editTarget as Member).githubHandle.toLowerCase())
          }
        />
      )}
    </div>
  );
}
