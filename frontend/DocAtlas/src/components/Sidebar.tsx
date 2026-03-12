import { NavLink } from "react-router-dom";
import { Files, LayoutDashboard, Logs, Settings } from "lucide-react";

import { useAuth } from "@/providers/AuthProvider";
import { Button } from "@/components/ui/button";
import docAtlasLogoWithTitle from "@/assets/DocAtlasLogoWithTitle.png";

const navItems = [
  {
    to: "/dashboard",
    label: "Knowledge Base",
    description: "Upload new institutional sources.",
    icon: LayoutDashboard,
    end: true,
  },
  {
    to: "/dashboard/my-files",
    label: "My Files",
    description: "Search, filter, paginate and manage uploaded files.",
    icon: Files,
    end: false,
  },
  {
    to: "/instructions",
    label: "Widget Setup",
    description: "Install the DocAtlas widget on your website securely.",
    icon: Settings,
    end: false,
  },
  {
    to: "/logs",
    label: "Activity Logs",
    description: "Review operational events and upcoming audit records.",
    icon: Logs,
    end: false,
  },
];

export function Sidebar() {
  const { user, logout } = useAuth();

  return (
    <aside className="flex h-full min-h-0 w-20 shrink-0 flex-col overflow-hidden border-r border-sky-800/50 bg-gradient-to-b from-sky-950 via-sky-900 to-sky-900 px-2 pb-4 pt-2 text-sky-50 md:w-72 md:px-4">
      <div className="mb-5 rounded-xl bg-white/5 backdrop-blur-sm">
        <img
          src={docAtlasLogoWithTitle}
          alt="DocAtlas"
          className="h-14 w-full object-contain object-left md:h-30"
        />
      </div>

      <div className="mb-6 hidden rounded-xl border border-white/10 bg-white/5 p-3 md:block">
        <p className="text-sm font-semibold tracking-wide text-sky-50/95">
          Admin Workspace
        </p>
        <p className="mt-1 text-xs leading-5 text-sky-100/80">
          Institution-grounded knowledge operations and assistant controls.
        </p>
        <p className="mt-3 text-[11px] font-medium uppercase tracking-[0.12em] text-sky-200/70">
          {user?.hospitalName ?? "Hospital"}
        </p>
      </div>

      <nav className="min-h-0 flex-1 space-y-2 overflow-y-auto">
        {navItems.map(({ to, label, description, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              [
                "group flex items-center justify-center gap-3 rounded-xl border px-2 py-3 text-sm transition-all md:items-start md:justify-start md:px-3",
                isActive
                  ? "border-white/20 bg-white/15 text-white shadow-[0_12px_28px_rgba(0,0,0,0.16)]"
                  : "border-white/10 text-sky-50/85 hover:border-white/20 hover:bg-white/10 hover:text-white",
              ].join(" ")
            }
          >
            <Icon className="size-4 shrink-0 md:mt-0.5" />
            <div className="hidden md:block">
              <p className="font-medium">{label}</p>
              <p className="mt-0.5 text-xs leading-4 text-sky-100/70 group-hover:text-sky-50/90">
                {description}
              </p>
            </div>
          </NavLink>
        ))}
      </nav>

      <div className="mt-4 rounded-xl border border-white/10 bg-white/5 p-2 md:p-3">
        <p className="mb-3 hidden text-xs text-sky-100/80 md:block">
          {user?.email}
        </p>
        <Button
          variant="outline"
          className="h-10 w-full border-white/15 bg-white/10 px-2 text-xs text-sky-50 transition hover:border-white/30 hover:bg-white/20 hover:text-white md:px-3 md:text-sm"
          onClick={logout}
        >
          <span className="md:hidden">Out</span>
          <span className="hidden md:inline">Sign out</span>
        </Button>
      </div>
    </aside>
  );
}