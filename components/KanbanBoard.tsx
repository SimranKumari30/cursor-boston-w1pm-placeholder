"use client";

import { Member, Status, STATUS_LABELS, STATUS_ORDER } from "@/lib/data";
import MemberCard from "./MemberCard";

interface KanbanBoardProps {
  members: Member[];
}

const COLUMN_ACCENT: Record<Status, string> = {
  not_started: "text-gray-500",
  in_progress:  "text-yellow-400",
  submitted:    "text-blue-400",
  pr_open:      "text-green-400",
};

export default function KanbanBoard({ members }: KanbanBoardProps) {
  const grouped = STATUS_ORDER.reduce<Record<Status, Member[]>>(
    (acc, s) => ({ ...acc, [s]: members.filter((m) => m.status === s) }),
    {} as Record<Status, Member[]>
  );

  return (
    <div className="flex gap-4 pb-4 h-full">
      {STATUS_ORDER.map((status) => {
        const cards = grouped[status];
        return (
          <div key={status} className="flex-1 min-w-[220px] flex flex-col gap-3">
            <div className="flex items-center gap-2 px-1">
              <span className={`text-[11px] font-semibold tracking-widest uppercase ${COLUMN_ACCENT[status]}`}>
                {STATUS_LABELS[status]}
              </span>
              <span className="text-[11px] text-gray-600 font-medium">{cards.length}</span>
            </div>
            <div className="flex flex-col gap-2.5">
              {cards.map((member) => (
                <MemberCard key={member.id} member={member} />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
