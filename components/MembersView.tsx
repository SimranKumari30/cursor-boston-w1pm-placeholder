"use client";

import { Member, avatarColor, getInitials } from "@/lib/data";

interface MembersViewProps {
  members: Member[];
}

const STATUS_LABEL: Record<string, { label: string; color: string }> = {
  submitted: { label: "Submitted", color: "text-blue-400 bg-blue-400/10 border-blue-400/20" },
  pr_open:   { label: "PR Open",   color: "text-green-400 bg-green-400/10 border-green-400/20" },
  not_started: { label: "Not Started", color: "text-gray-500 bg-gray-500/10 border-gray-500/20" },
};

export default function MembersView({ members }: MembersViewProps) {
  const active = members.filter((m) => m.status === "submitted" || m.status === "pr_open");
  const rest   = members.filter((m) => m.status === "not_started");

  function Row({ member }: { member: Member }) {
    const initials = getInitials(member.name);
    const color    = avatarColor(member.id);
    const s        = STATUS_LABEL[member.status] ?? STATUS_LABEL.not_started;

    return (
      <div className="flex items-center gap-4 px-4 py-3 border-b border-[#1e1e24] hover:bg-[#16161c] transition-colors">
        {/* Avatar */}
        <div
          className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-semibold flex-shrink-0"
          style={{ backgroundColor: color }}
        >
          {initials}
        </div>

        {/* Name + handle */}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-white">{member.name}</p>
          <a
            href={`https://github.com/${member.githubHandle}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-gray-500 hover:text-gray-300 transition-colors"
          >
            @{member.githubHandle}
          </a>
        </div>

        {/* Status badge */}
        <span className={`text-[10px] font-medium border px-2 py-0.5 rounded-full ${s.color}`}>
          {s.label}
        </span>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto">
      {/* Submitted + PR Open */}
      {active.length > 0 && (
        <section>
          <div className="px-4 py-3 border-b border-[#1e1e24]">
            <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-widest">
              Submitted &amp; PR Open — {active.length}
            </p>
          </div>
          {active.map((m) => <Row key={m.id} member={m} />)}
        </section>
      )}

      {/* Not started */}
      {rest.length > 0 && (
        <section>
          <div className="px-4 py-3 border-b border-[#1e1e24]">
            <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-widest">
              Not Started — {rest.length}
            </p>
          </div>
          {rest.map((m) => <Row key={m.id} member={m} />)}
        </section>
      )}

      {active.length === 0 && rest.length === 0 && (
        <div className="flex items-center justify-center h-48">
          <p className="text-sm text-gray-600">No members yet for this week.</p>
        </div>
      )}
    </div>
  );
}
