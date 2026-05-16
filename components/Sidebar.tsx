"use client";

export type NavItem = "Board" | "Members" | "Tracker";

interface SidebarProps {
  activeNav: NavItem;
  onNavChange: (nav: NavItem) => void;
}

const NAV_ITEMS: { id: NavItem; icon: string }[] = [
  { id: "Board",   icon: "⊞" },
  { id: "Tracker", icon: "⊠" },
  { id: "Members", icon: "⊟" },
];

export default function Sidebar({ activeNav, onNavChange }: SidebarProps) {
  return (
    <div className="w-56 flex-shrink-0 flex flex-col bg-[#111114] border-r border-[#1e1e24] h-full">
      {/* Brand */}
      <div className="px-4 py-5 border-b border-[#1e1e24]">
        <p className="text-base font-bold text-white">ShipTrack</p>
        <p className="text-[11px] text-gray-500 mt-0.5">Cursor Boston · Cohort 1</p>
      </div>

      {/* Nav */}
      <div className="px-2 py-3 border-b border-[#1e1e24]">
        {NAV_ITEMS.map(({ id, icon }) => (
          <button
            key={id}
            onClick={() => onNavChange(id)}
            className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors ${
              activeNav === id
                ? "bg-[#2a2a38] text-white font-medium"
                : "text-gray-500 hover:text-gray-300 hover:bg-[#1e1e28]"
            }`}
          >
            <span className="text-base leading-none">{icon}</span>
            {id}
          </button>
        ))}
      </div>

    </div>
  );
}
