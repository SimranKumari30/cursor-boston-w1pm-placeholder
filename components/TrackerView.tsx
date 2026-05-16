"use client";

import { useEffect, useState } from "react";
import { Member, WEEKS, weekState, avatarColor, getInitials } from "@/lib/data";

type CellStatus = "submitted" | "pr_open" | "not_started" | "no_submission" | null;

interface MatrixRow {
  name: string;
  githubHandle: string;
  cells: CellStatus[];  // one per week (index 0 = week 1)
}

const CELL_CONFIG: Record<string, { label: string; bg: string; text: string }> = {
  submitted:      { label: "Submitted",     bg: "bg-blue-400/10",  text: "text-blue-400" },
  pr_open:        { label: "PR Open",       bg: "bg-green-400/10", text: "text-green-400" },
  not_started:    { label: "Not Started",   bg: "bg-[#1e1e24]",    text: "text-gray-600" },
  no_submission:  { label: "No Submission", bg: "bg-[#1a1a1e]",    text: "text-gray-700" },
};

export default function TrackerView() {
  const [allMembers, setAllMembers] = useState<Member[][]>(
    Array.from({ length: WEEKS.length }, () => [])
  );
  const [loading, setLoading] = useState(true);
  const [lastFetched, setLastFetched] = useState<Date | null>(null);

  async function fetchAll() {
    setLoading(true);
    const results = await Promise.all(
      WEEKS.map((w) =>
        fetch(`/api/submissions?week=${w.id}`)
          .then((r) => r.ok ? r.json() : { members: [] })
          .then((d) => (d.members as Member[]) ?? [])
          .catch(() => [] as Member[])
      )
    );
    setAllMembers(results);
    setLastFetched(new Date());
    setLoading(false);
  }

  useEffect(() => { fetchAll(); }, []);

  // Build matrix: collect all unique members across ALL weeks, ordered by first appearance
  const handleOrder: string[] = [];
  const handleToInfo: Record<string, { name: string; githubHandle: string }> = {};

  allMembers.forEach((weekMembers) => {
    weekMembers.forEach((m) => {
      const key = m.githubHandle.toLowerCase();
      if (!handleToInfo[key]) {
        handleOrder.push(key);
        handleToInfo[key] = { name: m.name, githubHandle: m.githubHandle };
      }
    });
  });

  // Compute which weeks are past or live (member "should have" submitted)
  const now = new Date();
  const activeWeekIds = new Set(
    WEEKS.filter((w) => {
      const deadline = new Date(`${w.deadlineDate}T17:00:00-05:00`);
      return now >= new Date(deadline.getTime() - w.id * 0) ; // all non-upcoming
    }).map((w) => w.id)
  );
  // Simpler: a week is "active" if it's not upcoming
  const liveWeekId = (() => {
    for (const w of WEEKS) {
      if (new Date(`${w.deadlineDate}T17:00:00-05:00`) >= now) return w.id;
    }
    return WEEKS[WEEKS.length - 1].id;
  })();

  const matrix: MatrixRow[] = handleOrder.map((key) => ({
    ...handleToInfo[key],
    cells: WEEKS.map((week, i) => {
      const found = allMembers[i]?.find(
        (m) => m.githubHandle.toLowerCase() === key
      );
      if (found) return found.status as CellStatus;
      const wState = weekState(week, liveWeekId);
      if (wState === "upcoming") return null;
      if (wState === "past") return "no_submission" as CellStatus;
      return "not_started" as CellStatus; // live week
    }),
  }));

  const totalSubmitted = allMembers.flat().filter(
    (m) => m.status === "submitted" || m.status === "pr_open"
  ).length;

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Header row */}
      <div className="flex items-center justify-between px-6 py-3 border-b border-[#1e1e24] flex-shrink-0">
        <p className="text-[11px] text-gray-500 uppercase tracking-widest font-semibold">
          Member × Week Matrix
        </p>
        <div className="flex items-center gap-4">
          <span className="text-xs text-gray-500">
            <span className="text-white font-semibold">{totalSubmitted}</span> total submissions
          </span>
          <button
            onClick={fetchAll}
            disabled={loading}
            className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-300 transition-colors disabled:opacity-50"
          >
            <svg className={`w-3 h-3 ${loading ? "animate-spin" : ""}`} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M13.5 2.5A6.5 6.5 0 1 1 4 3.5" strokeLinecap="round"/>
              <polyline points="4,1 4,4 7,4" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            {loading ? "Loading…" : lastFetched ? "Refresh" : "Sync"}
          </button>
        </div>
      </div>

      {/* Scrollable table */}
      <div className="flex-1 overflow-auto">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="sticky top-0 z-10 bg-[#0d0d10]">
              {/* Member column */}
              <th className="text-left px-6 py-3 text-[11px] font-semibold text-gray-500 uppercase tracking-widest border-b border-[#1e1e24] w-56 min-w-[224px]">
                Member
              </th>
              {WEEKS.map((week) => (
                <th
                  key={week.id}
                  className="px-4 py-3 text-[11px] font-semibold text-gray-500 uppercase tracking-widest border-b border-[#1e1e24] text-center whitespace-nowrap"
                >
                  {week.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading && matrix.length === 0 ? (
              <tr>
                <td colSpan={WEEKS.length + 1} className="px-6 py-12 text-center text-gray-600 text-sm">
                  Loading submissions from GitHub…
                </td>
              </tr>
            ) : matrix.length === 0 ? (
              <tr>
                <td colSpan={WEEKS.length + 1} className="px-6 py-12 text-center text-gray-600 text-sm">
                  No submissions found.
                </td>
              </tr>
            ) : (
              matrix.map((row) => {
                const initials = getInitials(row.name);
                const color    = avatarColor(row.githubHandle);
                return (
                  <tr key={row.githubHandle} className="border-b border-[#1e1e24] hover:bg-[#13131a] transition-colors">
                    {/* Member cell */}
                    <td className="px-6 py-3">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-7 h-7 rounded-full flex items-center justify-center text-white text-[10px] font-semibold flex-shrink-0"
                          style={{ backgroundColor: color }}
                        >
                          {initials}
                        </div>
                        <div>
                          <p className="text-sm text-white font-medium leading-tight">{row.name}</p>
                          <p className="text-[10px] text-gray-600">@{row.githubHandle}</p>
                        </div>
                      </div>
                    </td>

                    {/* Status cells */}
                    {row.cells.map((status, wi) => {
                      const cfg = status ? CELL_CONFIG[status] : null;
                      return (
                        <td key={wi} className="px-4 py-3 text-center">
                          {cfg ? (
                            <span className={`inline-block text-[10px] font-medium px-2 py-0.5 rounded-full ${cfg.bg} ${cfg.text}`}>
                              {cfg.label}
                            </span>
                          ) : (
                            <span className="text-gray-800 text-xs">—</span>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
