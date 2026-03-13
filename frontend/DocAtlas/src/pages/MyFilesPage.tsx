import { useEffect, useState } from "react";

import { KnowledgeDocumentsSection } from "@/components/knowledge-base/KnowledgeDocumentsSection";
import {
  type DocumentTypeFilter,
  useKnowledgeBaseDocuments,
} from "@/hooks/useKnowledgeBaseDocuments";
import { useAuth } from "@/providers/AuthProvider";

export function MyFilesPage() {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [fileTypeFilter, setFileTypeFilter] = useState<DocumentTypeFilter>("all");

  const {
    sources,
    isLoading,
    isPageLoading,
    deletingId,
    currentPage,
    totalSources,
    totalAvailableSources,
    totalPages,
    hasNextPage,
    isQueryActive,
    setCurrentPage,
    deleteSource,
    isDeletingAll,
    deleteAllSources,
  } = useKnowledgeBaseDocuments({
    ownerId: user?.id,
    searchTerm,
    fileTypeFilter,
  });

  useEffect(() => {
    setCurrentPage(0);
  }, [searchTerm, fileTypeFilter, setCurrentPage]);

  return (
    <div className="space-y-8">
      <section className="rounded-2xl border border-sky-100/80 bg-white/90 p-6 shadow-[0_22px_50px_rgba(30,64,175,0.1)] backdrop-blur-sm sm:p-7">
        <p className="inline-flex items-center rounded-full border border-sky-200 bg-sky-50 px-3 py-1 text-xs font-medium text-sky-900">
          Files Library
        </p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight text-sky-950">
          Browse and manage all indexed files.
        </h1>
        <p className="mt-3 max-w-4xl text-sm leading-6 text-slate-600 sm:text-base">
          Use search, pagination, and file type filters to quickly find PDFs, Excel sheets, and other uploaded sources.
        </p>
      </section>

      <KnowledgeDocumentsSection
        sources={sources}
        totalSources={totalSources}
        totalAvailableSources={totalAvailableSources}
        currentPage={currentPage}
        totalPages={totalPages}
        hasNextPage={hasNextPage}
        isLoading={isLoading}
        isPageLoading={isPageLoading}
        isQueryActive={isQueryActive}
        searchTerm={searchTerm}
        fileTypeFilter={fileTypeFilter}
        onSearchChange={setSearchTerm}
        onFileTypeFilterChange={setFileTypeFilter}
        deletingId={deletingId}
        onDelete={deleteSource}
        onPreviousPage={() => setCurrentPage((page) => Math.max(page - 1, 0))}
        onNextPage={() => setCurrentPage((page) => page + 1)}
        isDeletingAll={isDeletingAll}
        onDeleteAll={deleteAllSources}
      />
    </div>
  );
}
