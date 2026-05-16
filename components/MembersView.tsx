"use client";

import { useEffect, useState } from "react";
import { Member, WEEKS, avatarColor, getInitials } from "@/lib/data";

interface MemberRow {
  name: string;
  githubHandle: string;
  id: string;
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
      const byHandle = new Map<string, { member: Member }>();
      results.forEach((weekMembers) => {
        weekMembers.forEach((m) => {
          const key = m.githubHandle.toLowerCase();
          if (!byHandle.has(key)) {
            byHandle.set(key, { member: m });
          }
        });
      });

      const sorted = Array.from(byHandle.values())
        .map(({ member }) => ({
          name: member.name,
          githubHandle: member.githubHandle,
          id: member.id,
        }))
        .sort((a, b) => a.name.localeCompare(b.name));

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
      </div>

      {rows.map((row) => {
        const initials = getInitials(row.name);
        const color    = avatarColor(row.id);

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
          </div>
        );
      })}
    </div>
  );
}
