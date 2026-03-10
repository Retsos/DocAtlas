type KnowledgeFilesSearchProps = {
  value: string;
  onChange: (value: string) => void;
  totalCount: number;
  filteredCount: number;
  title?: string;
  placeholder?: string;
};

export function KnowledgeFilesSearch({
  value,
  onChange,
  totalCount,
  filteredCount,
  title = "Search files",
  placeholder = "Type a file name...",
}: KnowledgeFilesSearchProps) {
  const hasFiles = totalCount > 0 || value.trim().length > 0;

  return (
    <section className="rounded-xl border border-sky-100 bg-white/90 p-4 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm font-medium text-sky-950">{title}</p>
        <p className="text-xs text-slate-500">
          Showing {filteredCount} of {totalCount}
        </p>
      </div>

      <input
        type="search"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="mt-3 h-10 w-full rounded-md border border-sky-200 bg-white px-3 text-sm text-slate-700 outline-none transition focus:border-sky-400 focus:ring-2 focus:ring-sky-100"
        aria-label={title}
        disabled={!hasFiles}
      />
    </section>
  );
}
