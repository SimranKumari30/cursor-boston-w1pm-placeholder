"use client";

import { useEffect, useState } from "react";
import { Member, Status, STATUS_LABELS, STATUS_ORDER } from "@/lib/data";

interface MemberModalProps {
  member: Member | null;   // null = "add new"
  onSave: (member: Member) => void;
  onDelete?: (id: string) => void;
  onClose: () => void;
}

const EMPTY: Omit<Member, "id" | "week"> = {
  name: "",
  githubHandle: "",
  pitch: "",
  repoUrl: "",
  liveUrl: "",
  loomUrl: "",
  status: "not_started",
};

function field(
  label: string,
  value: string,
  onChange: (v: string) => void,
  placeholder?: string
) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-[11px] text-gray-500 font-medium uppercase tracking-wider">{label}</label>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="bg-[#1a1a22] border border-[#2e2e3a] rounded-lg px-3 py-2 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-[#4a4a60] transition-colors"
      />
    </div>
  );
}

export default function MemberModal({ member, onSave, onDelete, onClose }: MemberModalProps) {
  const isNew = !member;
  const [form, setForm] = useState<Omit<Member, "id" | "week">>(
    member
      ? { name: member.name, githubHandle: member.githubHandle, pitch: member.pitch ?? "",
          repoUrl: member.repoUrl ?? "", liveUrl: member.liveUrl ?? "", loomUrl: member.loomUrl ?? "",
          status: member.status }
      : EMPTY
  );

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  function set(key: keyof typeof form) {
    return (v: string) => setForm((f) => ({ ...f, [key]: v }));
  }

  function handleSave() {
    if (!form.name.trim()) return;
    onSave({
      id: member?.id ?? String(Date.now()),
      week: member?.week ?? 1,
      ...form,
      pitch:   form.pitch   || undefined,
      repoUrl: form.repoUrl || undefined,
      liveUrl: form.liveUrl || undefined,
      loomUrl: form.loomUrl || undefined,
    });
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="bg-[#141418] border border-[#2e2e3a] rounded-2xl w-full max-w-md mx-4 p-6 flex flex-col gap-5">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold text-white">
            {isNew ? "Add submission" : "Edit submission"}
          </h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-300 text-xl leading-none">×</button>
        </div>

        {/* Fields */}
        <div className="flex flex-col gap-3">
          {field("Name", form.name, set("name"), "Person N")}
          {field("GitHub handle", form.githubHandle, set("githubHandle"), "username")}
          {field("Pitch", form.pitch ?? "", set("pitch"), "One-line description of your project")}
          {field("Repo URL", form.repoUrl ?? "", set("repoUrl"), "https://github.com/…")}
          {field("Live URL", form.liveUrl ?? "", set("liveUrl"), "https://…")}
          {field("Loom URL", form.loomUrl ?? "", set("loomUrl"), "https://loom.com/share/…")}

          {/* Status select */}
          <div className="flex flex-col gap-1">
            <label className="text-[11px] text-gray-500 font-medium uppercase tracking-wider">Status</label>
            <select
              value={form.status}
              onChange={(e) => setForm((f) => ({ ...f, status: e.target.value as Status }))}
              className="bg-[#1a1a22] border border-[#2e2e3a] rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#4a4a60] transition-colors"
            >
              {STATUS_ORDER.map((s) => (
                <option key={s} value={s}>{STATUS_LABELS[s]}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between pt-1">
          {!isNew && onDelete ? (
            <button
              onClick={() => { onDelete(member!.id); onClose(); }}
              className="text-xs text-red-400/70 hover:text-red-400 transition-colors"
            >
              Delete
            </button>
          ) : <span />}
          <div className="flex gap-2">
            <button onClick={onClose} className="px-4 py-1.5 rounded-lg text-sm text-gray-400 hover:text-gray-200 transition-colors">
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={!form.name.trim()}
              className="px-4 py-1.5 rounded-lg text-sm bg-white text-black font-medium hover:bg-gray-200 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Save
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
