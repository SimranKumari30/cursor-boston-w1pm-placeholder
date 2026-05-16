"use client";

import { useEffect, useState } from "react";
import { Member, WEEKS, avatarColor, getInitials } from "@/lib/data";

const STATUS_LABEL: Record<string, { label: string; color: string }> = {
  submitted:   { label: "Submitted",   color: "text-blue-400 bg-blue-400/10 border-blue-400/20" },
  pr_open:     { label: "PR Open",     color: "text-green-400 bg-green-400/10 border-green-400/20" },
  not_started: { label: "Not Started", color: "text-gray-500 bg-gray-500/10 border-gray-500/20" },
};

interface MemberRow {
  name: string;
  githubHandle: string;
  id: string;
  // best status across all weeks (pr_open > submitted > not_started)
  bestStatus: string;
  weeksActive: number;
}

function bestStatus(statuses: string[]): string {
  if (statuses.includes("pr_open"))     return "pr_open";
  if (statuses.includes("submitted"))   return "submitted";
  return "not_started";
}

export default function MembersView() {
  const [rows, setRows] = useState<MemberRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
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

      // Deduplicate by githubHandle, collect all statuses across weeks
      const byHandle = new Map<string, { member: Member; statuses: string[]; weeks: number }>();
      results.forEach((weekMembers) => {
        weekMembers.forEach((m) => {
          const key = m.githubHandle.toLowerCase();
          if (byHandle.has(key)) {
            const entry = byHandle.get(key)!;
            entry.statuses.push(m.status);
            entry.weeks += 1;
          } else {
            byHandle.set(key, { member: m, statuses: [m.status], weeks: 1 });
          }
        });
      });

      const sorted = Array.from(byHandle.values())
        .map(({ member, statuses, weeks }) => ({
          name: member.name,
          githubHandle: member.githubHandle,
          id: member.id,
          bestStatus: bestStatus(statuses),
          weeksActive: weeks,
        }))
        // sort: pr_open first, then submitted, then not_started; alpha within group
        .sort((a, b) => {
          const order = ["pr_open", "submitted", "not_started"];
          const diff = order.indexOf(a.bestStatus) - order.indexOf(b.bestStatus);
          return diff !== 0 ? diff : a.name.localeCompare(b.name);
        });

      setRows(sorted);
      setLoading(false);
    }

    fetchAll();
  }, []);

  if (loading) {
    return (
      <div className="flex-1 overflow-y-auto">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="flex items-center gap-4 px-4 py-3 border-b border-[#1e1e24]">
            <div className="w-8 h-8 rounded-full bg-[#1e1e28] animate-pulse flex-shrink-0" />
            <div className="flex-1 space-y-1.5">
              <div className="h-3 w-32 bg-[#1e1e28] rounded animate-pulse" />
              <div className="h-2.5 w-24 bg-[#1e1e28] rounded animate-pulse" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (rows.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <p className="text-sm text-gray-600">No members found.</p>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="px-4 py-3 border-b border-[#1e1e24] flex items-center justify-between">
        <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-widest">
          Cohort Members — {rows.length}
        </p>
        <p className="text-[11px] text-gray-600">
          {rows.filter(r => r.bestStatus !== "not_started").length} with submissions
        </p>
      </div>

      {rows.map((row) => {
        const initials = getInitials(row.name);
        const color    = avatarColor(row.id);
        const s        = STATUS_LABEL[row.bestStatus] ?? STATUS_LABEL.not_started;

        return (
          <div
            key={row.githubHandle}
            className="flex items-center gap-4 px-4 py-3 border-b border-[#1e1e24] hover:bg-[#16161c] transition-colors"
          >
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-semibold flex-shrink-0"
              style={{ backgroundColor: color }}
            >
              {initials}
            </div>

            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white">{row.name}</p>
              <a
                href={`https://github.com/${row.githubHandle}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-gray-500 hover:text-gray-300 transition-colors"
              >
                @{row.githubHandle}
              </a>
            </div>

            {row.weeksActive > 1 && (
              <span className="text-[10px] text-gray-600">{row.weeksActive}w</span>
            )}

            <span className={`text-[10px] font-medium border px-2 py-0.5 rounded-full ${s.color}`}>
              {s.label}
            </span>
          </div>
        );
      })}
    </div>
  );
}
