"use client";

import { Week, weekState } from "@/lib/data";

export type NavItem = "Board" | "Members" | "Tracker";

interface SidebarProps {
  weeks: Week[];
  activeWeek: number;
  onWeekChange: (week: number) => void;
  activeNav: NavItem;
  onNavChange: (nav: NavItem) => void;
  liveWeek: number;
}

const NAV_ITEMS: { id: NavItem; icon: string }[] = [
  { id: "Board",   icon: "⊞" },
  { id: "Members", icon: "⊟" },
  { id: "Tracker", icon: "⊠" },
];

export default function Sidebar({
  weeks, activeWeek, onWeekChange, activeNav, onNavChange, liveWeek,
}: SidebarProps) {
  return (
    <div className="w-56 flex-shrink-0 flex flex-col bg-[#111114] border-r border-[#1e1e24] h-full">
      {/* Brand */}
      <div className="px-4 py-5 border-b border-[#1e1e24]">
        <p className="text-base font-bold text-white">ShipTrack</p>
        <p className="text-[11px] text-gray-500 mt-0.5">Cursor Boston · Cohort 1</p>
      </div>

      {/* Nav */}
      <div className="px-2 py-3 border-b border-[#1e1e24]">
        {NAV_ITEMS.map(({ id, icon }) => (
          <button
            key={id}
            onClick={() => onNavChange(id)}
            className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors ${
              activeNav === id
                ? "bg-[#2a2a38] text-white font-medium"
                : "text-gray-500 hover:text-gray-300 hover:bg-[#1e1e28]"
            }`}
          >
            <span className="text-base leading-none">{icon}</span>
            {id}
          </button>
        ))}
      </div>

      {/* Week switcher */}
      <div className="px-2 py-3 flex-1 overflow-y-auto">
        <p className="text-[10px] text-gray-600 font-semibold uppercase tracking-widest px-3 mb-2">
          Weeks
        </p>
        {weeks.map((week) => {
          const state   = weekState(week, liveWeek);
          const isActive = activeWeek === week.id;

          const baseText =
            isActive
              ? "text-white font-medium"
              : state === "past"
              ? "text-gray-600 hover:text-gray-400"
              : state === "upcoming"
              ? "text-gray-600 hover:text-gray-400"
              : "text-gray-400 hover:text-gray-200";

          return (
            <button
              key={week.id}
              onClick={() => onWeekChange(week.id)}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-colors ${baseText} ${
                isActive ? "bg-[#2a2a38]" : "hover:bg-[#1e1e28]"
              }`}
            >
              <span className="truncate">{week.label}</span>
              {state === "live" && (
                <span className="ml-1.5 text-[9px] bg-red-500/20 text-red-400 border border-red-500/30 px-1.5 py-0.5 rounded font-semibold tracking-wide flex-shrink-0">
                  live
                </span>
              )}
              {state === "past" && (
                <span className="ml-1.5 text-[9px] text-gray-700 flex-shrink-0">done</span>
              )}
              {state === "upcoming" && (
                <span className="ml-1.5 text-[9px] text-gray-700 flex-shrink-0">soon</span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
