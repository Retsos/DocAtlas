import { ChevronLeft, ChevronRight, ExternalLink, Loader2, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { KnowledgeFilesSearch } from "@/components/knowledge-base/KnowledgeFilesSearch";
import type { KnowledgeSource } from "@/types/knowledgeSource";

type KnowledgeDocumentsSectionProps = {
  sources: KnowledgeSource[];
  totalSources: number;
  totalAvailableSources: number;
  currentPage: number;
  totalPages: number;
  hasNextPage: boolean;
  isLoading: boolean;
  isPageLoading: boolean;
  isSearchActive: boolean;
  searchTerm: string;
  onSearchChange: (value: string) => void;
  deletingId: string;
  onDelete: (source: KnowledgeSource) => Promise<void>;
  onPreviousPage: () => void;
  onNextPage: () => void;
};

function formatDate(date?: Date) {
  if (!date) {
    return "Unknown date";
  }

  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

function formatSize(sizeBytes?: number) {
  if (!sizeBytes) {
    return "-";
  }

  const kb = sizeBytes / 1024;
  if (kb < 1024) {
    return `${kb.toFixed(1)} KB`;
  }

  return `${(kb / 1024).toFixed(1)} MB`;
}

export function KnowledgeDocumentsSection({
  sources,
  totalSources,
  totalAvailableSources,
  currentPage,
  totalPages,
  hasNextPage,
  isLoading,
  isPageLoading,
  isSearchActive,
  searchTerm,
  onSearchChange,
  deletingId,
  onDelete,
  onPreviousPage,
  onNextPage,
}: KnowledgeDocumentsSectionProps) {
  return (
    <section className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight text-emerald-950">
            Indexed Documents
          </h2>
          <p className="mt-1 text-sm text-slate-600">
            Manage all uploaded files used by your DocAtlas assistant.
          </p>
        </div>
        <p className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-900">
          {isSearchActive ? `${totalSources} results` : `${totalSources} total`}
        </p>
      </div>

      <KnowledgeFilesSearch
        value={searchTerm}
        onChange={onSearchChange}
        totalCount={totalAvailableSources}
        filteredCount={sources.length}
        title="Search uploaded documents"
        placeholder="Search by uploaded file name..."
      />

      {isLoading && sources.length === 0 ? (
        <div className="flex items-center justify-center gap-2 rounded-xl border border-emerald-100 bg-white p-8 text-sm text-slate-600">
          <Loader2 className="size-4 animate-spin" />
          Loading indexed documents...
        </div>
      ) : sources.length === 0 && isSearchActive ? (
        <div className="rounded-xl border border-emerald-100 bg-white p-6 text-sm text-slate-600">
          No uploaded documents match "{searchTerm}".
        </div>
      ) : sources.length === 0 ? (
        <div className="rounded-xl border border-emerald-100 bg-white p-6 text-sm text-slate-600">
          No files uploaded yet. Use the panel above to add your first source.
        </div>
      ) : (
        <div className="space-y-4">
          <div className="grid gap-3">
            {sources.map((source) => {
              const isDeleting = deletingId === source.id;

              return (
                <article
                  key={source.id}
                  className="rounded-xl border border-emerald-100 bg-white p-4 shadow-sm transition hover:border-emerald-200 hover:shadow-md"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 space-y-2">
                      <p className="break-all text-sm font-semibold text-slate-900">
                        {source.name}
                      </p>
                      <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
                        <span className="rounded-full border border-slate-200 bg-slate-50 px-2 py-0.5">
                          Uploaded: {formatDate(source.createdAt)}
                        </span>
                        <span className="rounded-full border border-slate-200 bg-slate-50 px-2 py-0.5">
                          Size: {formatSize(source.sizeBytes)}
                        </span>
                      </div>
                      <a
                        href={source.url}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 text-xs font-medium text-emerald-800 underline-offset-2 transition hover:text-emerald-700 hover:underline"
                      >
                        Open source file
                        <ExternalLink className="size-3.5" />
                      </a>
                    </div>

                    <Button
                      type="button"
                      variant="outline"
                      className="shrink-0 cursor-pointer border-red-200 bg-red-50/30 text-red-700 hover:bg-red-50 hover:text-red-800"
                      onClick={() => void onDelete(source)}
                      disabled={isDeleting}
                    >
                      {isDeleting ? (
                        <span className="inline-flex items-center gap-2">
                          <Loader2 className="size-4 animate-spin" />
                          Deleting...
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-2">
                          <Trash2 className="size-4" />
                          Delete
                        </span>
                      )}
                    </Button>
                  </div>
                </article>
              );
            })}
          </div>

          {!isSearchActive && (
            <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-emerald-100 bg-white px-4 py-3 text-sm">
              <p className="text-slate-600">
                Page {Math.min(currentPage + 1, totalPages)} of {totalPages}
              </p>
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  className="cursor-pointer border-emerald-200 hover:border-emerald-300 hover:bg-emerald-50"
                  onClick={onPreviousPage}
                  disabled={isLoading || isPageLoading || currentPage === 0}
                >
                  <ChevronLeft className="mr-1 size-4" />
                  Previous
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="cursor-pointer border-emerald-200 hover:border-emerald-300 hover:bg-emerald-50"
                  onClick={onNextPage}
                  disabled={isLoading || isPageLoading || !hasNextPage}
                >
                  {isPageLoading ? "Loading..." : "Next"}
                  <ChevronRight className="ml-1 size-4" />
                </Button>
              </div>
            </div>
          )}
        </div>
      )}
    </section>
  );
}
