import { useEffect, useMemo, useRef, useState } from "react";
import { FirebaseError } from "firebase/app";
// import { apiClient, getApiErrorMessage } from "@/lib/api";

import {
  DOCUMENTS_PAGE_SIZE,
  deleteDocumentSource,
  getDocumentSourcesCount,
  getDocumentSourcesPage,
  type DocumentsPageCursor,
} from "@/services/storage-sources-service";
import type { KnowledgeSource } from "@/types/knowledgeSource";
import { getAuth } from "firebase/auth/web-extension";

type UseKnowledgeBaseDocumentsInput = {
  ownerId?: string;
};

export function useKnowledgeBaseDocuments({
  ownerId,
}: UseKnowledgeBaseDocumentsInput) {
  const [sources, setSources] = useState<KnowledgeSource[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isPageLoading, setIsPageLoading] = useState(false);
  const [deletingId, setDeletingId] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [currentPage, setCurrentPage] = useState(0);
  const [totalSources, setTotalSources] = useState(0);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [pageCursors, setPageCursors] = useState<DocumentsPageCursor[]>([null]);
  const [refreshTick, setRefreshTick] = useState(0);
  const hasLoadedOnceRef = useRef(false);

  const totalPages = useMemo(
    () => Math.max(1, Math.ceil(totalSources / DOCUMENTS_PAGE_SIZE)),
    [totalSources],
  );

  function refreshDocuments() {
    setRefreshTick((tick) => tick + 1);
  }

  function resetPaginationAndRefresh() {
    setCurrentPage(0);
    setPageCursors([null]);
    refreshDocuments();
  }

  useEffect(() => {
    if (!ownerId) {
      setIsLoading(false);
      setSources([]);
      setTotalSources(0);
      setCurrentPage(0);
      setHasNextPage(false);
      setPageCursors([null]);
      setErrorMessage("");
      hasLoadedOnceRef.current = false;
      return;
    }
    const resolvedOwnerId = ownerId;

    const isInitialLoad = !hasLoadedOnceRef.current;
    if (isInitialLoad) {
      setIsLoading(true);
    } else {
      setIsPageLoading(true);
    }
    setErrorMessage("");

    let cancelled = false;

    async function loadDocumentsPage() {
      try {
        const cursor = pageCursors[currentPage] ?? null;
        const [pageResult, total] = await Promise.all([
          getDocumentSourcesPage({
            ownerId: resolvedOwnerId,
            pageSize: DOCUMENTS_PAGE_SIZE,
            startAfterCursor: cursor,
          }),
          getDocumentSourcesCount(resolvedOwnerId),
        ]);

        if (cancelled) {
          return;
        }

        setSources(pageResult.sources);
        setTotalSources(total);
        setHasNextPage(pageResult.hasMore);

        setPageCursors((prev) => {
          if (
            !pageResult.hasMore ||
            !pageResult.nextCursor ||
            prev[currentPage + 1]
          ) {
            return prev;
          }
          const next = [...prev];
          next[currentPage + 1] = pageResult.nextCursor;
          return next;
        });

        const maxPageIndex = Math.max(
          0,
          Math.ceil(total / DOCUMENTS_PAGE_SIZE) - 1,
        );
        if (currentPage > maxPageIndex) {
          setCurrentPage(maxPageIndex);
          return;
        }

        hasLoadedOnceRef.current = true;
        setIsLoading(false);
        setIsPageLoading(false);
      } catch (error) {
        if (cancelled) {
          return;
        }
        if (error instanceof FirebaseError) {
          setErrorMessage(error.message);
        } else {
          setErrorMessage("Failed to load files from documents collection.");
        }
        setIsLoading(false);
        setIsPageLoading(false);
      }
    }

    void loadDocumentsPage();

    return () => {
      cancelled = true;
    };
  }, [currentPage, ownerId, refreshTick]);

  async function deleteSource(source: KnowledgeSource) {
    if (!source.id) {
      return;
    }

    setDeletingId(source.id);
    setErrorMessage("");

    try {

      //set up authentication with jwt context for backend to verify admin permissions before deleting.
      const auth = getAuth();
      const user = auth.currentUser;
      if (!user) throw new Error("Not Allowed.");
      // const token = await user.getIdToken();
      
      // Delete from Firestore and Storage.
      await deleteDocumentSource({
        documentId: source.id,
        storagePath: source.storagePath,
      });
      
      //connect to backend to delete the indexed document as well to keep in sync with storage metadata.
      // await apiClient.delete(`/delete-file/${source.id}`, {
      //   headers: {
      //     "Authorization": `Bearer ${token}` 
      //   }
      // });

      if (sources.length === 1 && currentPage > 0) {
        setCurrentPage((page) => Math.max(page - 1, 0));
      } else {
        refreshDocuments();
      }
    } catch (error) {
      if (error instanceof FirebaseError) {
        setErrorMessage(error.message);
      } else {
        setErrorMessage("Delete failed. Please try again.");
      }
    } finally {
      setDeletingId("");
    }
  }

  return {
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
  };
}
