import { Clock3, FileClock } from "lucide-react";

const LogsPage = () => {
  return (
    <section className="space-y-6">
      <header className="rounded-2xl border border-emerald-100 bg-white/90 p-6 shadow-[0_20px_45px_rgba(6,78,59,0.08)]">
        <p className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-900">
          <Clock3 className="size-3.5" />
          Observability
        </p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight text-emerald-950">
          Activity Logs
        </h1>
        <p className="mt-2 text-sm text-slate-600">
          Track uploads, deletions, indexing operations, and assistant usage events in one place.
        </p>
      </header>

      <div className="rounded-xl border border-emerald-100 bg-white p-8 text-center shadow-sm">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-50 text-emerald-700">
          <FileClock className="size-6" />
        </div>
        <h2 className="mt-4 text-xl font-semibold text-slate-900">
          Logs dashboard is coming soon
        </h2>
        <p className="mx-auto mt-2 max-w-xl text-sm text-slate-600">
          This section will include searchable event history, filterable timelines, and export-ready audit trails for your DocAtlas workspace.
        </p>
      </div>
    </section>
  );
};

export default LogsPage;
