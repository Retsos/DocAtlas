import { Outlet } from "react-router-dom";

import { Sidebar } from "../components/Sidebar";

export function DashboardLayout() {
  return (
    <div className="flex h-dvh min-h-0 overflow-hidden bg-[radial-gradient(ellipse_85%_70%_at_15%_0%,rgba(110,231,183,0.22)_0%,transparent_68%),radial-gradient(ellipse_75%_60%_at_100%_20%,rgba(16,185,129,0.18)_0%,transparent_70%)]">
      <Sidebar />
      <main className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden [scrollbar-gutter:stable]">
        <div className="mx-auto w-full max-w-6xl p-6 sm:p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
