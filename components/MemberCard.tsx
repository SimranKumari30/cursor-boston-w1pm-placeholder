"use client";

import { Member, getMissingFields, isComplete, getInitials, avatarColor } from "@/lib/data";

interface MemberCardProps {
  member: Member;
  onClick: () => void;
}

export default function MemberCard({ member, onClick }: MemberCardProps) {
  const missing = getMissingFields(member);
  const complete = isComplete(member);
  const competing = member.competeForWin === true && isComplete(member) && member.status !== "not_started";
  const initials = getInitials(member.name);
  const color = avatarColor(member.id);

  return (
    <div
      onClick={onClick}
      className={`rounded-xl p-3 cursor-pointer transition-all ${
        competing
          ? "bg-[#1a2a1a] border border-[#2a4a2a] hover:border-[#4ade80]/50"
          : "bg-[#1e1e24] border border-[#2e2e38] hover:border-[#4a4a58]"
      }`}
    >
      <div className="flex items-start gap-2">
        <div
          className="w-6 h-6 rounded-full flex items-center justify-center text-white text-[9px] font-semibold flex-shrink-0 mt-0.5"
          style={{ backgroundColor: color }}
        >
          {initials}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start gap-1.5">
            <span className="text-sm font-medium text-white leading-snug">{member.name}</span>
            {competing && <span className="w-1.5 h-1.5 rounded-full bg-green-400 flex-shrink-0 mt-1.5" />}
          </div>
          {member.submittedAt && member.status !== "not_started" && (
            <p className="text-[10px] text-gray-600 mt-0.5">
              {new Date(member.submittedAt).toLocaleString("en-US", {
                month: "short", day: "numeric",
                hour: "numeric", minute: "2-digit", hour12: true,
              })}
            </p>
          )}
        </div>
        {/* GitHub source link — only for active submissions */}
        {member.status !== "not_started" && (member.prUrl || member.submissionUrl) && (
          <a
            href={member.prUrl ?? member.submissionUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            title={member.prUrl ? "View PR on GitHub" : "View submission on GitHub"}
            className="flex-shrink-0 text-[10px] text-gray-600 hover:text-gray-300 transition-colors px-1.5 py-0.5 rounded border border-[#2e2e38] hover:border-[#4a4a58] font-mono"
          >
            GH
          </a>
        )}
      </div>

      {/* Missing field pills — only for active submissions */}
      {member.status !== "not_started" && missing.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mt-2">
          {missing.map((field) => (
            <span key={field} className="text-[10px] text-gray-500 bg-[#2a2a35] px-2 py-0.5 rounded-full">
              {field} missing
            </span>
          ))}
        </div>
      )}

      {/* Complete field links — only for active submissions */}
      {member.status !== "not_started" && complete && (
        <div className="flex gap-1.5 mt-2 flex-wrap">
          {member.repoUrl && (
            <a href={member.repoUrl} target="_blank" rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="text-[10px] text-green-400/80 bg-green-400/10 border border-green-400/20 px-2 py-0.5 rounded-full hover:bg-green-400/20 transition-colors">
              repo
            </a>
          )}
          {member.liveUrl && (
            <a href={member.liveUrl} target="_blank" rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="text-[10px] text-blue-400/80 bg-blue-400/10 border border-blue-400/20 px-2 py-0.5 rounded-full hover:bg-blue-400/20 transition-colors">
              live
            </a>
          )}
          {member.loomUrl && (
            <a href={member.loomUrl} target="_blank" rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="text-[10px] text-purple-400/80 bg-purple-400/10 border border-purple-400/20 px-2 py-0.5 rounded-full hover:bg-purple-400/20 transition-colors">
              loom
            </a>
          )}
        </div>
      )}
    </div>
  );
}
