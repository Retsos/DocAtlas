import { useEffect, useState } from "react";
import { FirebaseError } from "firebase/app";

import { useAuth } from "@/providers/AuthProvider";
import { KnowledgeDocumentsSection } from "@/components/knowledge-base/KnowledgeDocumentsSection";
import { KnowledgeUploadPanel } from "@/components/knowledge-base/KnowledgeUploadPanel";
import { useKnowledgeBaseDocuments } from "@/hooks/useKnowledgeBaseDocuments";
import { useUploadFiles } from "@/hooks/useUploadFiles";

export function KnowledgeBasePage() {
  const { user } = useAuth();
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [uploadedSearchTerm, setUploadedSearchTerm] = useState("");

  const {
    sources,
    isLoading,
    isPageLoading,
    deletingId,
    errorMessage,
    currentPage,
    totalSources,
    totalAvailableSources,
    totalPages,
    hasNextPage,
    isSearchActive,
    setCurrentPage,
    setErrorMessage,
    deleteSource,
    resetPaginationAndRefresh,
  } = useKnowledgeBaseDocuments({
    ownerId: user?.id,
    searchTerm: uploadedSearchTerm,
  });

  const {
    mutate: uploadFiles,
    isPending: isUploadingFastApi,
    error: uploadError,
  } = useUploadFiles();

  useEffect(() => {
    if (!uploadError) {
      return;
    }

    if (uploadError instanceof FirebaseError) {
      setErrorMessage(uploadError.message);
      return;
    }

    setErrorMessage("Upload failed. Please try again.");
  }, [uploadError]);

  useEffect(() => {
    if (!user?.id) {
      setSelectedFiles([]);
      setUploadedSearchTerm("");
      setErrorMessage("");
    }
  }, [user?.id, setErrorMessage]);

  async function handleUpload() {
    if (!user?.id || selectedFiles.length === 0) return;

    // Trigger TanStack Query mutation:
    // - Uploads files to Firebase Storage/Firestore
    // - Calls FastAPI /upload-file for indexing in backend
    setErrorMessage("");
    uploadFiles(
      {
        ownerId: user.id,
        hospitalName: user.hospitalName || "Default",
        files: selectedFiles,
      },
      {
        onSuccess: () => {
          // Keep UI state in sync after a successful mutation.
          setSelectedFiles([]);
          resetPaginationAndRefresh();
        },
        // Errors are exposed via `uploadError` from the mutation hook.
      },
    );
  }

  return (
    <div className="space-y-8">
      <section className="rounded-2xl border border-emerald-100/80 bg-white/90 p-6 shadow-[0_22px_50px_rgba(6,78,59,0.08)] backdrop-blur-sm sm:p-7">
        <p className="inline-flex items-center rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-900">
          Hospital AI Knowledge Platform
        </p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight text-emerald-950">
          Bring every hospital document into one reliable AI assistant.
        </h1>
        <p className="mt-3 max-w-4xl text-sm leading-6 text-slate-600 sm:text-base">
          DocAtlas organizes your internal files, protocols and links so staff gets instant, cited answers grounded in your own institution data.
        </p>
        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          <div className="rounded-xl border border-emerald-100 bg-emerald-50/50 p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-emerald-900/80">
              Core workflow
            </p>
            <p className="mt-1 text-sm text-slate-700">
              Document ingestion, vector search, and grounded RAG responses with source references.
            </p>
          </div>
          <div className="rounded-xl border border-emerald-100 bg-emerald-50/50 p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-emerald-900/80">
              Today
            </p>
            <p className="mt-1 text-sm text-slate-700">
              {totalAvailableSources} indexed {totalAvailableSources === 1 ? "document" : "documents"} available for your assistant.
            </p>
          </div>
        </div>
      </section>

      <KnowledgeUploadPanel
        selectedFiles={selectedFiles}
        isUploading={isUploadingFastApi}
        errorMessage={errorMessage}
        onFilesChange={setSelectedFiles}
        onUpload={() => void handleUpload()}
      />

      <KnowledgeDocumentsSection
        sources={sources}
        totalSources={totalSources}
        totalAvailableSources={totalAvailableSources}
        currentPage={currentPage}
        totalPages={totalPages}
        hasNextPage={hasNextPage}
        isLoading={isLoading}
        isPageLoading={isPageLoading}
        isSearchActive={isSearchActive}
        searchTerm={uploadedSearchTerm}
        onSearchChange={setUploadedSearchTerm}
        deletingId={deletingId}
        onDelete={deleteSource}
        onPreviousPage={() => setCurrentPage((page) => Math.max(page - 1, 0))}
        onNextPage={() => setCurrentPage((page) => page + 1)}
      />
    </div>
  );
}
