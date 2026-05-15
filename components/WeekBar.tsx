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
    <div className="flex items-center gap-1 px-6 py-2 border-b border-[#1e1e24] overflow-x-auto flex-shrink-0">
      {weeks.map((week) => {
        const state    = weekState(week, liveWeek);
        const isActive = activeWeek === week.id;

        return (
          <button
            key={week.id}
            onClick={() => onWeekChange(week.id)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs whitespace-nowrap transition-colors flex-shrink-0 ${
              isActive
                ? "bg-[#2a2a38] text-white font-medium"
                : state === "live"
                ? "text-gray-400 hover:text-white hover:bg-[#1e1e28]"
                : "text-gray-600 hover:text-gray-400 hover:bg-[#1e1e28]"
            }`}
          >
            {week.label}
            {state === "live" && (
              <span className="text-[8px] bg-red-500/20 text-red-400 border border-red-500/30 px-1.5 py-0.5 rounded font-semibold tracking-wide">
                live
              </span>
            )}
            {state === "past" && (
              <span className="text-[8px] text-gray-700">done</span>
            )}
          </button>
        );
      })}
    </div>
  );
}
