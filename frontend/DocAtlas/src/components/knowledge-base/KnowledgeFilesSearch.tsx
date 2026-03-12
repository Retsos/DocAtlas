import type { DocumentTypeFilter } from "@/hooks/useKnowledgeBaseDocuments";

type KnowledgeFilesSearchProps = {
  value: string;
  onChange: (value: string) => void;
  fileTypeFilter: DocumentTypeFilter;
  onFileTypeFilterChange: (value: DocumentTypeFilter) => void;
  totalCount: number;
  filteredCount: number;
  title?: string;
  placeholder?: string;
};

const fileTypeOptions: Array<{ value: DocumentTypeFilter; label: string }> = [
  { value: "all", label: "All file types" },
  { value: "pdf", label: "PDF" },
  { value: "excel", label: "Excel" },
  { value: "word", label: "Word" },
  { value: "text", label: "Text" },
  { value: "other", label: "Other" },
];

export function KnowledgeFilesSearch({
  value,
  onChange,
  fileTypeFilter,
  onFileTypeFilterChange,
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

      <div className="mt-3 grid gap-3 sm:grid-cols-[1fr_220px]">
        <input
          type="search"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
          className="h-10 w-full rounded-md border border-sky-200 bg-white px-3 text-sm text-slate-700 outline-none transition focus:border-sky-400 focus:ring-2 focus:ring-sky-100"
          aria-label={title}
          disabled={!hasFiles}
        />

        <select
          value={fileTypeFilter}
          onChange={(event) =>
            onFileTypeFilterChange(event.target.value as DocumentTypeFilter)
          }
          className="h-10 w-full rounded-md border border-sky-200 bg-white px-3 text-sm text-slate-700 outline-none transition focus:border-sky-400 focus:ring-2 focus:ring-sky-100"
          aria-label="Filter files by type"
          disabled={!hasFiles}
        >
          {fileTypeOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>
    </section>
  );
}
