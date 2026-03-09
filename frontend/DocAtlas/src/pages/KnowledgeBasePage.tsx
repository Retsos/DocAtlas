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

  const {
    sources,
    isLoading,
    isPageLoading,
    deletingId,
    errorMessage,
    currentPage,
    totalSources,
    totalPages,
    hasNextPage,
    setCurrentPage,
    setErrorMessage,
    deleteSource,
    resetPaginationAndRefresh,
  } = useKnowledgeBaseDocuments({ ownerId: user?.id });

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
        currentPage={currentPage}
        totalPages={totalPages}
        hasNextPage={hasNextPage}
        isLoading={isLoading}
        isPageLoading={isPageLoading}
        deletingId={deletingId}
        onDelete={deleteSource}
        onPreviousPage={() => setCurrentPage((page) => Math.max(page - 1, 0))}
        onNextPage={() => setCurrentPage((page) => page + 1)}
      />
    </div>
  );
}
