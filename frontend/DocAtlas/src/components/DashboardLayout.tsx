import { useState } from "react";
import { Outlet } from "react-router-dom";
import { Sidebar } from "../components/Sidebar";
import { Toaster } from "sonner";

export function DashboardLayout() {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  return (
    <div className="flex h-screen w-full overflow-hidden bg-[radial-gradient(ellipse_85%_70%_at_15%_0%,rgba(125,211,252,0.22)_0%,transparent_68%),radial-gradient(ellipse_75%_60%_at_100%_20%,rgba(59,130,246,0.16)_0%,transparent_70%)]">
      <div className="hidden md:flex">
        <Sidebar />
      </div>

      <main className="flex min-h-0 flex-1 flex-col overflow-y-auto overflow-x-hidden">
        <div className="mx-auto w-full max-w-6xl flex-1 p-6 sm:p-8">
          <div className="mb-4 flex items-center justify-between md:hidden">
            <button
              type="button"
              onClick={() => setIsDrawerOpen(true)}
              aria-label="Open dashboard navigation"
              className="inline-flex h-10 w-10 items-center justify-center rounded-md border border-sky-200 bg-white/80 text-sky-950 shadow-sm"
            >
              <svg
                viewBox="0 0 24 24"
                className="h-5 w-5"
                fill="none"
                aria-hidden="true"
              >
                <path
                  d="M4 7h16M4 12h16M4 17h16"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
            </button>
          </div>
          <Outlet />
        </div>
      </main>
      <Toaster richColors position="bottom-right" closeButton />

      <div
        className={[
          "fixed inset-0 z-40 bg-black/20 backdrop-blur-[1px] transition-opacity md:hidden",
          isDrawerOpen ? "opacity-100" : "pointer-events-none opacity-0",
        ].join(" ")}
        onClick={() => setIsDrawerOpen(false)}
        aria-hidden="true"
      />

      <aside
        className={[
          "fixed left-0 top-0 z-50 h-full w-72 max-w-[85vw] border-r border-sky-800/50 bg-gradient-to-b from-sky-950 via-sky-900 to-sky-900 shadow-[0_20px_60px_rgba(15,23,42,0.35)] transition-transform md:hidden",
          isDrawerOpen ? "translate-x-0" : "-translate-x-full",
        ].join(" ")}
        role="dialog"
        aria-modal="true"
        aria-label="Dashboard navigation"
      >
        <Sidebar
          isDrawer
          className="w-full px-4"
          onNavigate={() => setIsDrawerOpen(false)}
          onClose={() => setIsDrawerOpen(false)}
        />
      </aside>
    </div>
  );
}
