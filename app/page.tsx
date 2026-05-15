"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Member, WEEKS } from "@/lib/data";
import Sidebar, { NavItem } from "@/components/Sidebar";
import KanbanBoard from "@/components/KanbanBoard";
import MemberModal from "@/components/MemberModal";
import MembersView from "@/components/MembersView";
import TrackerView from "@/components/TrackerView";

const LIVE_WEEK = 1;
const POLL_INTERVAL_MS = 60_000; // re-fetch GitHub every 60 s

export default function Home() {
  const [activeWeek, setActiveWeek] = useState(1);
  const [activeNav, setActiveNav] = useState<NavItem>("Board");

  // GitHub-fetched members (source of truth for submitted / pr_open)
  const [ghMembers, setGhMembers] = useState<Member[]>([]);
  // Locally-added members (stored in localStorage)
  const [localMembers, setLocalMembers] = useState<Member[]>([]);

  const [loading, setLoading] = useState(false);
  const [lastFetched, setLastFetched] = useState<Date | null>(null);
  const [editTarget, setEditTarget] = useState<Member | null | "new">(null);

  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ── GitHub fetch ────────────────────────────────────────────────────────────
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

  // Fetch on week change + start poll
  useEffect(() => {
    fetchFromGitHub(activeWeek);
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => fetchFromGitHub(activeWeek), POLL_INTERVAL_MS);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [activeWeek, fetchFromGitHub]);

  // ── Local overrides (localStorage) ─────────────────────────────────────────
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

  // ── Merge: GitHub entries take precedence; locals fill the rest ─────────────
  const ghHandles = new Set(ghMembers.map((m) => m.githubHandle.toLowerCase()));
  const filteredLocal = localMembers.filter(
    (m) => m.week === activeWeek && !ghHandles.has(m.githubHandle.toLowerCase())
  );
  const members: Member[] = [...ghMembers.filter((m) => m.week === activeWeek), ...filteredLocal];

  const week = WEEKS.find((w) => w.id === activeWeek)!;
  const submitted = members.filter((m) => m.status === "submitted" || m.status === "pr_open").length;
  const notStarted = members.filter((m) => m.status === "not_started").length;

  // ── Save / delete (local only) ───────────────────────────────────────────────
  function handleSave(updated: Member) {
    const isGhEntry = ghHandles.has(updated.githubHandle.toLowerCase());
    if (!isGhEntry) {
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

  // ── Relative time helper ────────────────────────────────────────────────────
  function relTime(d: Date) {
    const s = Math.round((Date.now() - d.getTime()) / 1000);
    if (s < 5)  return "just now";
    if (s < 60) return `${s}s ago`;
    return `${Math.round(s / 60)}m ago`;
  }

  return (
    <div className="flex h-screen bg-[#0d0d10] text-white">
      {/* Left sidebar */}
      <div className="sticky left-0 z-10 flex-shrink-0">
        <Sidebar
          weeks={WEEKS}
          activeWeek={activeWeek}
          onWeekChange={setActiveWeek}
          activeNav={activeNav}
          onNavChange={setActiveNav}
          liveWeek={LIVE_WEEK}
        />
      </div>

      {/* Main */}
      <div className="flex-1 flex flex-col overflow-x-auto overflow-y-hidden min-w-0">
        {/* Header */}
        <div
          className="flex items-center justify-between px-6 py-4 border-b border-[#1e1e24] flex-shrink-0"
          style={{ minWidth: "680px" }}
        >
          <div>
            <h1 className="text-lg font-bold text-white">{week.track}</h1>
            <p className="text-xs text-gray-500 mt-0.5">
              ~100 members · {week.deadline} deadline
            </p>
          </div>

          <div className="flex items-center gap-4">
            {/* Live stats */}
            <div className="flex items-center gap-3 text-xs text-gray-500">
              <span><span className="text-white font-semibold">{submitted}</span> submitted</span>
              <span className="text-gray-700">·</span>
              <span><span className="text-white font-semibold">{notStarted}</span> not started</span>
              <span className="text-gray-700">·</span>
              <span><span className="text-white font-semibold">{members.length}</span> total</span>
            </div>

            {/* Refresh status + button */}
            <button
              onClick={() => fetchFromGitHub(activeWeek)}
              disabled={loading}
              className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-300 transition-colors disabled:opacity-50"
              title="Refresh from GitHub"
            >
              <svg
                className={`w-3 h-3 ${loading ? "animate-spin" : ""}`}
                viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2"
              >
                <path d="M13.5 2.5A6.5 6.5 0 1 1 4 3.5" strokeLinecap="round"/>
                <polyline points="4,1 4,4 7,4" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              {loading ? "syncing…" : lastFetched ? relTime(lastFetched) : "sync"}
            </button>

            <div className="flex items-center gap-1.5 bg-yellow-500/10 border border-yellow-500/20 text-yellow-400 text-xs font-medium px-3 py-1.5 rounded-lg">
              <span className="w-1.5 h-1.5 rounded-full bg-yellow-400 animate-pulse" />
              28h left
            </div>

            <button
              onClick={() => setEditTarget("new")}
              className="bg-white text-black text-sm font-medium px-4 py-1.5 rounded-lg hover:bg-gray-200 transition-colors"
            >
              + Add
            </button>
          </div>
        </div>

        {/* Board / Members / Tracker views */}
        {activeNav === "Board" && (
          <div className="flex-1 overflow-y-hidden px-6 py-5" style={{ minWidth: "680px" }}>
            <KanbanBoard members={members} onEdit={(m) => setEditTarget(m)} />
          </div>
        )}
        {activeNav === "Members" && <MembersView members={members} />}
        {activeNav === "Tracker" && <TrackerView />}
      </div>

      {/* Add / edit modal */}
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
