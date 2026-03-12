import { Outlet } from "react-router-dom";
import { Sidebar } from "../components/Sidebar";

export function DashboardLayout() {
  return (
    <div className="flex h-screen w-full overflow-hidden bg-[radial-gradient(ellipse_85%_70%_at_15%_0%,rgba(125,211,252,0.22)_0%,transparent_68%),radial-gradient(ellipse_75%_60%_at_100%_20%,rgba(59,130,246,0.16)_0%,transparent_70%)]">
      <Sidebar />

      <main className="flex min-h-0 flex-1 flex-col overflow-y-auto overflow-x-hidden">
        <div className="mx-auto w-full max-w-6xl flex-1 p-6 sm:p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}