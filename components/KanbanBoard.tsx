"use client";

import { Member, Status, STATUS_LABELS, STATUS_ORDER } from "@/lib/data";
import MemberCard from "./MemberCard";

interface KanbanBoardProps {
  members: Member[];
  onEdit: (member: Member) => void;
  loading?: boolean;
}

const COLUMN_ACCENT: Record<Status, string> = {
  not_started: "text-gray-500",
  in_progress:  "text-yellow-400",
  submitted:    "text-blue-400",
  pr_open:      "text-green-400",
};

export default function KanbanBoard({ members, onEdit, loading }: KanbanBoardProps) {
  const grouped = STATUS_ORDER.reduce<Record<Status, Member[]>>(
    (acc, s) => ({ ...acc, [s]: members.filter((m) => m.status === s) }),
    {} as Record<Status, Member[]>
  );

  // Sort: not_started alphabetically; pr_open/submitted by submittedAt then alpha
  function sortCards(cards: Member[], status: Status): Member[] {
    if (status === "not_started") {
      return [...cards].sort((a, b) => a.name.localeCompare(b.name));
    }
    return [...cards].sort((a, b) => {
      if (a.submittedAt && b.submittedAt) return a.submittedAt.localeCompare(b.submittedAt);
      if (a.submittedAt) return -1;
      if (b.submittedAt) return 1;
      return a.name.localeCompare(b.name);
    });
  }

  return (
    <div className="flex gap-3 h-full overflow-x-auto p-3 rounded-2xl border border-[#2e2e38]">
      {STATUS_ORDER.map((status) => {
        const cards = grouped[status];
        return (
          <div key={status} className="flex-1 min-w-[200px] min-h-0 flex flex-col gap-3 border border-[#2e2e38] rounded-xl p-3">
            <div className="flex items-center gap-2 flex-shrink-0">
              <span className={`text-[11px] font-semibold tracking-widest uppercase ${COLUMN_ACCENT[status]}`}>
                {STATUS_LABELS[status]}
              </span>
              {loading && members.length === 0 ? (
                <span className="w-3 h-2 bg-[#2a2a38] rounded animate-pulse" />
              ) : (
                <span className="text-[11px] text-gray-600 font-medium">{cards.length}</span>
              )}
            </div>
            <div className="flex flex-col gap-2.5 overflow-y-auto flex-1 min-h-0 pb-2 pr-1">
              {sortCards(cards, status).map((member) => (
                <MemberCard key={member.id} member={member} onClick={() => onEdit(member)} />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
