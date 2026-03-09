import { ChevronLeft, ChevronRight, Loader2, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import type { KnowledgeSource } from "@/types/knowledgeSource";

type KnowledgeDocumentsSectionProps = {
  sources: KnowledgeSource[];
  totalSources: number;
  currentPage: number;
  totalPages: number;
  hasNextPage: boolean;
  isLoading: boolean;
  isPageLoading: boolean;
  deletingId: string;
  onDelete: (source: KnowledgeSource) => Promise<void>;
  onPreviousPage: () => void;
  onNextPage: () => void;
};

function formatDate(date?: Date) {
  if (!date) {
    return "Unknown date";
  }

  return new Intl.DateTimeFormat("el-GR", {
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
  currentPage,
  totalPages,
  hasNextPage,
  isLoading,
  isPageLoading,
  deletingId,
  onDelete,
  onPreviousPage,
  onNextPage,
}: KnowledgeDocumentsSectionProps) {
  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-slate-900">Your Documents</h2>
        <p className="text-xs text-slate-500">{totalSources} total</p>
      </div>

      {isLoading && sources.length === 0 ? (
        <div className="flex items-center justify-center gap-2 rounded-xl border border-emerald-100 bg-white p-8 text-sm text-slate-600">
          <Loader2 className="size-4 animate-spin" />
          Loading your documents...
        </div>
      ) : sources.length === 0 ? (
        <div className="rounded-xl border border-emerald-100 bg-white p-6 text-sm text-slate-600">
          No files yet. Upload from the panel above.
        </div>
      ) : (
        <div className="space-y-4">
          <div className="grid gap-3">
            {sources.map((source) => {
              const isDeleting = deletingId === source.id;

              return (
                <article
                  key={source.id}
                  className="rounded-xl border border-emerald-100 bg-white p-4 shadow-sm"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1">
                      <p className="text-sm font-semibold text-slate-900">
                        {source.name}
                      </p>
                      <p className="text-xs text-slate-500">
                        Uploaded: {formatDate(source.createdAt)} | Size:{" "}
                        {formatSize(source.sizeBytes)}
                      </p>
                      <a
                        href={source.url}
                        target="_blank"
                        rel="noreferrer"
                        className="text-xs text-emerald-800 underline underline-offset-2"
                      >
                        Open file URL
                      </a>
                    </div>

                    <Button
                      type="button"
                      variant="outline"
                      className="cursor-pointer border-red-200 text-red-700 hover:bg-red-50 hover:text-red-800"
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

          <div className="flex items-center justify-between rounded-xl border border-emerald-100 bg-white px-4 py-3 text-sm">
            <p className="text-slate-600">
              Page {Math.min(currentPage + 1, totalPages)} of {totalPages}
            </p>
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                className="cursor-pointer"
                onClick={onPreviousPage}
                disabled={isLoading || isPageLoading || currentPage === 0}
              >
                <ChevronLeft className="mr-1 size-4" />
                Previous
              </Button>
              <Button
                type="button"
                variant="outline"
                className="cursor-pointer"
                onClick={onNextPage}
                disabled={isLoading || isPageLoading || !hasNextPage}
              >
                {isPageLoading ? "Loading..." : "Next"}
                <ChevronRight className="ml-1 size-4" />
              </Button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
