"use client";

import { Member, getMissingFields, isComplete, getInitials, avatarColor } from "@/lib/data";

interface MemberCardProps {
  member: Member;
  onClick: () => void;
}

export default function MemberCard({ member, onClick }: MemberCardProps) {
  const missing = getMissingFields(member);
  const complete = isComplete(member);
  const initials = getInitials(member.name);
  const color = avatarColor(member.id);

  return (
    <div
      onClick={onClick}
      className={`rounded-xl p-3 cursor-pointer transition-all ${
        complete
          ? "bg-[#1a2a1a] border border-[#2a4a2a] hover:border-[#4ade80]/50"
          : "bg-[#1e1e24] border border-[#2e2e38] hover:border-[#4a4a58]"
      }`}
    >
      <div className="flex items-start gap-3">
        <div
          className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-semibold flex-shrink-0"
          style={{ backgroundColor: color }}
        >
          {initials}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-white truncate">{member.name}</span>
            {complete && <span className="w-2 h-2 rounded-full bg-green-400 flex-shrink-0" />}
          </div>
          {member.pitch ? (
            <p className="text-xs text-gray-400 mt-0.5 line-clamp-2">{member.pitch}</p>
          ) : (
            <p className="text-xs text-gray-600 mt-0.5 italic">No pitch yet</p>
          )}
        </div>
        {/* GitHub source link */}
        {(member.prUrl || member.submissionUrl) && (
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

      {/* Missing field pills */}
      {missing.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mt-2.5">
          {missing.map((field) => (
            <span key={field} className="text-[10px] text-gray-500 bg-[#2a2a35] px-2 py-0.5 rounded-full">
              {field} missing
            </span>
          ))}
        </div>
      )}

      {/* Complete — show clickable field links */}
      {complete && (
        <div className="flex gap-1.5 mt-2.5 flex-wrap">
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
