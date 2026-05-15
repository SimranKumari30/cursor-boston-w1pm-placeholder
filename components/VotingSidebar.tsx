"use client";

import { Member, Week, getInitials, AVATAR_COLORS } from "@/lib/data";

interface VotingSidebarProps {
  members: Member[];
  week: Week;
}

export default function VotingSidebar({ members, week }: VotingSidebarProps) {
  const submitted = members.filter((m) => m.status === "submitted" || m.status === "pr_open");
  const competing = members.filter((m) => m.competeForWin);
  const topVoters = [...members]
    .filter((m) => (m.votes ?? 0) > 0)
    .sort((a, b) => (b.votes ?? 0) - (a.votes ?? 0))
    .slice(0, 5);

  const maxVotes = topVoters[0]?.votes ?? 1;

  const medals = ["1", "2", "3", "4", "5"];

  return (
    <div className="w-64 flex-shrink-0 flex flex-col gap-5">
      {/* Friday vote header */}
      <div>
        <p className="text-sm font-semibold text-white">Friday vote</p>
        <p className="text-xs text-gray-500 mt-0.5">
          {week.votingTime} ·{" "}
          <a
            href={week.zoomUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-400 hover:underline"
          >
            Zoom link
          </a>
        </p>
      </div>

      {/* Stat pills */}
      <div className="flex gap-3">
        <div className="flex-1 bg-[#1e1e24] border border-[#2e2e38] rounded-xl p-3 text-center">
          <p className="text-2xl font-bold text-white">{submitted.length}</p>
          <p className="text-[10px] text-gray-500 mt-0.5">submitted</p>
        </div>
        <div className="flex-1 bg-[#1e1e24] border border-[#2e2e38] rounded-xl p-3 text-center">
          <p className="text-2xl font-bold text-white">{competing.length}</p>
          <p className="text-[10px] text-gray-500 mt-0.5">compete</p>
        </div>
      </div>

      {/* Top votes */}
      <div>
        <p className="text-[11px] font-semibold tracking-widest uppercase text-gray-500 mb-3">
          Top Votes
        </p>
        <div className="flex flex-col gap-2.5">
          {topVoters.map((member, i) => {
            const initials = getInitials(member.name);
            const color = AVATAR_COLORS[initials] ?? "#6B7280";
            const barWidth = Math.round(((member.votes ?? 0) / maxVotes) * 100);
            return (
              <div key={member.id} className="flex items-center gap-2.5">
                <span className="text-xs text-gray-600 w-4 text-right">{medals[i]}</span>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-medium text-white">{member.name}</span>
                    <span className="text-[10px] text-gray-500">{member.votes} votes</span>
                  </div>
                  <div className="h-1 bg-[#2a2a35] rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full"
                      style={{ width: `${barWidth}%`, backgroundColor: color }}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Join voting call */}
      <a
        href={week.zoomUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-auto flex items-center justify-center gap-2 border border-[#2e2e38] rounded-xl py-2.5 text-sm text-gray-300 hover:bg-[#2a2a35] transition-colors"
      >
        <span className="text-base">&#9654;</span>
        Join voting call
      </a>
    </div>
  );
}
