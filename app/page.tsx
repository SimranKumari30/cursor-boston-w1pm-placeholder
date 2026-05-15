"use client";

import { useEffect, useState } from "react";
import { Member, WEEKS, loadMembers, saveMembers } from "@/lib/data";
import Sidebar from "@/components/Sidebar";
import KanbanBoard from "@/components/KanbanBoard";
import MemberModal from "@/components/MemberModal";

const LIVE_WEEK = 1;

export default function Home() {
  const [activeWeek, setActiveWeek] = useState(1);
  const [activeNav, setActiveNav] = useState<"Board" | "Members" | "Leaderboard" | "Reminders">("Board");
  const [members, setMembers] = useState<Member[]>([]);
  const [editTarget, setEditTarget] = useState<Member | null | "new">(null);

  // Hydrate from localStorage once on mount
  useEffect(() => {
    setMembers(loadMembers());
  }, []);

  // Persist any change
  useEffect(() => {
    if (members.length > 0) saveMembers(members);
  }, [members]);

  const week = WEEKS.find((w) => w.id === activeWeek)!;
  const weekMembers = members.filter((m) => m.week === activeWeek);

  const submitted  = weekMembers.filter((m) => m.status === "submitted" || m.status === "pr_open").length;
  const inProgress = weekMembers.filter((m) => m.status === "in_progress").length;

  function handleSave(updated: Member) {
    setMembers((prev) => {
      const exists = prev.some((m) => m.id === updated.id);
      return exists
        ? prev.map((m) => (m.id === updated.id ? updated : m))
        : [...prev, { ...updated, week: activeWeek }];
    });
    setEditTarget(null);
  }

  function handleDelete(id: string) {
    setMembers((prev) => prev.filter((m) => m.id !== id));
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

      {/* Main — scrolls horizontally so all columns are reachable */}
      <div className="flex-1 flex flex-col overflow-x-auto overflow-y-hidden min-w-0">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#1e1e24] flex-shrink-0" style={{ minWidth: "680px" }}>
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
              <span><span className="text-white font-semibold">{inProgress}</span> in progress</span>
              <span className="text-gray-700">·</span>
              <span><span className="text-white font-semibold">{weekMembers.length}</span> total</span>
            </div>
            <div className="flex items-center gap-1.5 bg-yellow-500/10 border border-yellow-500/20 text-yellow-400 text-xs font-medium px-3 py-1.5 rounded-lg">
              <span className="w-1.5 h-1.5 rounded-full bg-yellow-400 animate-pulse" />
              28h left
            </div>
            <button
              onClick={() => setEditTarget("new")}
              className="bg-white text-black text-sm font-medium px-4 py-1.5 rounded-lg hover:bg-gray-200 transition-colors"
            >
              + Add submission
            </button>
          </div>
        </div>

        {/* Kanban — full width, scrolls vertically per-column */}
        <div className="flex-1 overflow-y-hidden px-6 py-5" style={{ minWidth: "680px" }}>
          <KanbanBoard
            members={weekMembers}
            onEdit={(m) => setEditTarget(m)}
          />
        </div>
      </div>

      {/* Add / edit modal */}
      {editTarget !== null && (
        <MemberModal
          member={editTarget === "new" ? null : editTarget}
          onSave={handleSave}
          onDelete={handleDelete}
          onClose={() => setEditTarget(null)}
        />
      )}
    </div>
  );
}
