"use client";

import { Week, weekState } from "@/lib/data";

interface WeekBarProps {
  weeks: Week[];
  activeWeek: number;
  onWeekChange: (id: number) => void;
  liveWeek: number;
}

export default function WeekBar({ weeks, activeWeek, onWeekChange, liveWeek }: WeekBarProps) {
  return (
    <div className="flex items-center justify-center gap-1 px-6 py-2 border-b border-[#1e1e24] overflow-x-auto flex-shrink-0">
      {weeks.map((week) => {
        const state    = weekState(week, liveWeek);
        const isActive = activeWeek === week.id;
        const blocked  = state === "upcoming";

        return (
          <button
            key={week.id}
            onClick={() => !blocked && onWeekChange(week.id)}
            disabled={blocked}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs whitespace-nowrap flex-shrink-0 transition-colors ${
              blocked
                ? "text-gray-700 cursor-not-allowed"
                : isActive
                ? "bg-[#2a2a38] text-white font-medium cursor-pointer"
                : "text-gray-400 hover:text-white hover:bg-[#1e1e28] cursor-pointer"
            }`}
          >
            {week.label}
            {state === "live" && (
              <span className="text-[8px] bg-red-500/20 text-red-400 border border-red-500/30 px-1.5 py-0.5 rounded font-semibold tracking-wide">
                live
              </span>
            )}
            {state === "past" && (
              <span className="text-[8px] text-gray-600">done</span>
            )}
            {state === "upcoming" && (
              <span className="text-[8px] text-gray-700">soon</span>
            )}
          </button>
        );
      })}
    </div>
  );
}
