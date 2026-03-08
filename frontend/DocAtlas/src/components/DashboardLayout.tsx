import { Outlet } from "react-router-dom";

import { Sidebar } from "../components/Sidebar";

export function DashboardLayout() {
  return (
    <div className="flex min-h-screen bg-muted/20">
      <Sidebar />
      <main className="flex-1 p-6">
        <Outlet />
      </main>
    </div>
  );
}
