import {
  ChevronLeft,
  ChevronRight, Loader2,
  Trash2
} from "lucide-react";
import { useCallback, useState } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { KnowledgeFilesSearch } from "@/components/knowledge-base/KnowledgeFilesSearch";
import type { DocumentTypeFilter } from "@/hooks/useKnowledgeBaseDocuments";
import type { KnowledgeSource } from "@/types/knowledgeSource";
import { DocumentRow } from "./KnowledgeDocumentRow";

type KnowledgeDocumentsSectionProps = {
  sources: KnowledgeSource[];
  totalSources: number;
  totalAvailableSources: number;
  currentPage: number;
  totalPages: number;
  hasNextPage: boolean;
  isLoading: boolean;
  isPageLoading: boolean;
  isQueryActive: boolean;
  searchTerm: string;
  fileTypeFilter: DocumentTypeFilter;
  onSearchChange: (value: string) => void;
  onFileTypeFilterChange: (value: DocumentTypeFilter) => void;
  onDelete: (source: KnowledgeSource) => Promise<void>;
  onPreviousPage: () => void;
  onNextPage: () => void;
  isDeletingAll?: boolean;
  onDeleteAll?: () => Promise<void>;
};



export function KnowledgeDocumentsSection({
  sources,
  totalSources,
  totalAvailableSources,
  currentPage,
  totalPages,
  hasNextPage,
  isLoading,
  isPageLoading,
  isQueryActive,
  searchTerm,
  fileTypeFilter,
  onSearchChange,
  onFileTypeFilterChange,
  onDelete,
  onPreviousPage,
  onNextPage,
  isDeletingAll,
  onDeleteAll,
}: KnowledgeDocumentsSectionProps) {
  const [localDeletingIds, setLocalDeletingIds] = useState<string[]>([]);

  const onLocalDeletingChange = useCallback((id: string, deleting: boolean) => {
    setLocalDeletingIds((prev) => {
      const next = new Set(prev);
      if (deleting) next.add(id);
      else next.delete(id);
      return Array.from(next);
    });
  }, []);

  // Rely on per-row cleanup to remove ids from the registry when rows unmount.

  return (
    <section className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight text-sky-950">
            My Files
          </h2>
          <p className="mt-1 text-sm text-slate-600">
            Search, filter, and manage uploaded files used by your DocAtlas
            assistant.
          </p>
        </div>
        <p className="rounded-full border border-sky-200 bg-sky-50 px-3 py-1 text-xs font-medium text-sky-900">
          {isQueryActive ? `${totalSources} results` : `${totalSources} total`}
        </p>
      </div>

      <KnowledgeFilesSearch
        value={searchTerm}
        onChange={onSearchChange}
        fileTypeFilter={fileTypeFilter}
        onFileTypeFilterChange={onFileTypeFilterChange}
        totalCount={totalAvailableSources}
        filteredCount={sources.length}
        title="Search uploaded documents"
        placeholder="Search by uploaded file name..."
      />

      {isLoading && sources.length === 0 ? (
        <div className="flex items-center justify-center gap-2 rounded-xl border border-sky-100 bg-white p-8 text-sm text-slate-600">
          <Loader2 className="size-4 animate-spin" />
          Loading indexed documents...
        </div>
      ) : isPageLoading ? (
        <div className="flex items-center justify-center gap-2 rounded-xl border border-sky-100 bg-white p-8 text-sm text-slate-600">
          <Loader2 className="size-4 animate-spin" />
          Loading files...
        </div>
      ) : sources.length === 0 && isQueryActive ? (
        <div className="rounded-xl border border-sky-100 bg-white p-6 text-sm text-slate-600">
          No uploaded documents match your current search/filter.
        </div>
      ) : sources.length === 0 ? (
        <div className="rounded-xl border border-sky-100 bg-white p-6 text-sm text-slate-600">
          No files uploaded yet.
        </div>
      ) : (
        <div className="space-y-4">
          {onDeleteAll && (
            <div className="flex justify-end">
              <AlertDialog>
                <AlertDialogTrigger
                  render={
                    <Button
                      type="button"
                      variant="outline"
                      className="cursor-pointer border-red-200 bg-red-50/30 text-red-700 hover:bg-red-50 hover:text-red-800"
                      disabled={
                        isDeletingAll ||
                        isLoading ||
                        isPageLoading ||
                        localDeletingIds.length > 0
                      }
                    />
                  }
                >
                  {isDeletingAll ? (
                    <span className="inline-flex items-center gap-2">
                      <Loader2 className="size-4 animate-spin" />
                      Deleting...
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-2">
                      <Trash2 className="size-4" />
                      {isQueryActive
                        ? `Delete ${sources.length} Results`
                        : "Delete All Files"}
                    </span>
                  )}
                </AlertDialogTrigger>
                <AlertDialogContent className="border-red-100">
                  <AlertDialogHeader>
                    <AlertDialogTitle className="text-red-700">
                      Are you absolutely sure?
                    </AlertDialogTitle>
                    <AlertDialogDescription className="text-slate-600">
                      This action cannot be undone. This will permanently delete{" "}
                      <strong>
                        all {totalAvailableSources} uploaded files
                      </strong>{" "}
                      from your DocAtlas assistant and remove their data from
                      our servers.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel className="border-slate-200 hover:bg-slate-50">
                      Cancel
                    </AlertDialogCancel>
                    <AlertDialogAction
                      onClick={() => {
                        onDeleteAll();
                      }}
                      className="bg-red-600 text-white hover:bg-red-700"
                    >
                      Yes, delete everything
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          )}
          <div className="grid gap-3">
            {sources.map((source) => (
              <DocumentRow
                key={source.id}
                source={source}
                onDelete={onDelete}
                isDeletingAll={isDeletingAll}
                onLocalDeletingChange={onLocalDeletingChange}
              />
            ))}
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-sky-100 bg-white px-4 py-3 text-sm">
            <p className="text-slate-600">
              Page {Math.min(currentPage + 1, totalPages)} of {totalPages}
            </p>
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                className="cursor-pointer border-sky-200 hover:border-sky-300 hover:bg-sky-50"
                onClick={onPreviousPage}
                disabled={isLoading || isPageLoading || currentPage === 0}
              >
                <ChevronLeft className="mr-1 size-4" />
                Previous
              </Button>
              <Button
                type="button"
                variant="outline"
                className="cursor-pointer border-sky-200 hover:border-sky-300 hover:bg-sky-50"
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
