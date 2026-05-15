"use client";

import { useState } from "react";
import { MEMBERS, WEEKS } from "@/lib/data";
import Sidebar from "@/components/Sidebar";
import KanbanBoard from "@/components/KanbanBoard";
import VotingSidebar from "@/components/VotingSidebar";

const LIVE_WEEK = 1;

export default function Home() {
  const [activeWeek, setActiveWeek] = useState(1);
  const [activeNav, setActiveNav] = useState<"Board" | "Members" | "Leaderboard" | "Reminders">("Board");

  const week = WEEKS.find((w) => w.id === activeWeek)!;
  const members = MEMBERS.filter((m) => m.week === activeWeek);

  return (
    /* Outer shell: sidebar pinned left, everything else scrolls */
    <div className="flex h-screen bg-[#0d0d10] text-white">
      {/* Left sidebar — sticky, never scrolls away */}
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

      {/* Right pane: scrolls horizontally so kanban + voting are always reachable */}
      <div className="flex-1 flex flex-col overflow-x-auto overflow-y-hidden min-w-0">
        {/* Header — spans full width of scroll container */}
        <div
          className="flex items-center justify-between px-6 py-4 border-b border-[#1e1e24] flex-shrink-0"
          style={{ minWidth: "860px" }}
        >
          <div>
            <h1 className="text-lg font-bold text-white">{week.track}</h1>
            <p className="text-xs text-gray-500 mt-0.5">
              ~100 members · {week.deadline} deadline
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 bg-yellow-500/10 border border-yellow-500/20 text-yellow-400 text-xs font-medium px-3 py-1.5 rounded-lg">
              <span className="w-1.5 h-1.5 rounded-full bg-yellow-400 animate-pulse" />
              28h left
            </div>
            <button className="bg-white text-black text-sm font-medium px-4 py-1.5 rounded-lg hover:bg-gray-200 transition-colors">
              + Add submission
            </button>
          </div>
        </div>

        {/* Board + voting — laid out side-by-side, min-width forces scroll when narrow */}
        <div className="flex flex-1 overflow-y-hidden" style={{ minWidth: "860px" }}>
          {/* Kanban: fills remaining width, scrolls if needed */}
          <div className="flex-1 overflow-auto px-6 py-5">
            <KanbanBoard members={members} />
          </div>
          {/* Voting sidebar */}
          <div className="w-64 flex-shrink-0 px-5 py-5 border-l border-[#1e1e24] overflow-y-auto">
            <VotingSidebar members={members} week={week} />
          </div>
        </div>
      </div>
    </div>
  );
}
