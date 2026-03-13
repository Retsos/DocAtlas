import { useEffect, useMemo, useRef, useState } from "react";
import { apiClient } from "@/lib/api";
import { toast } from "sonner";
import {
  DOCUMENTS_PAGE_SIZE,
  getAllDocumentSourcesByOwner,
  getDocumentSourcesCount,
  getDocumentSourcesPage,
  type DocumentsPageCursor,
} from "@/services/storage-sources-service";
import type { KnowledgeSource } from "@/types/knowledgeSource";

export type DocumentTypeFilter = "all" | "pdf" | "excel" | "word" | "text" | "other";

type UseKnowledgeBaseDocumentsInput = {
  ownerId?: string;
  searchTerm?: string;
  fileTypeFilter?: DocumentTypeFilter;
};

function getDocumentTypeFilter(source: KnowledgeSource): Exclude<DocumentTypeFilter, "all"> {
  const extension = source.name.toLowerCase().split(".").pop() ?? "";

  if (extension === "pdf") {
    return "pdf";
  }

  if (["xls", "xlsx", "xlsm", "csv"].includes(extension)) {
    return "excel";
  }

  if (["doc", "docx"].includes(extension)) {
    return "word";
  }

  if (["txt", "md", "rtf"].includes(extension)) {
    return "text";
  }

  return "other";
}

export function useKnowledgeBaseDocuments({
  ownerId,
  searchTerm = "",
  fileTypeFilter = "all",
}: UseKnowledgeBaseDocumentsInput) {
  const [sources, setSources] = useState<KnowledgeSource[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isPageLoading, setIsPageLoading] = useState(false);
  const [deletingId, setDeletingId] = useState("");
  const [isDeletingAll, setIsDeletingAll] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [currentPage, setCurrentPage] = useState(0);
  const [totalSources, setTotalSources] = useState(0);
  const [totalAvailableSources, setTotalAvailableSources] = useState(0);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [pageCursors, setPageCursors] = useState<DocumentsPageCursor[]>([null]);
  const [refreshTick, setRefreshTick] = useState(0);
  const hasLoadedOnceRef = useRef(false);
  const previousOwnerIdRef = useRef<string | undefined>(ownerId);
  const normalizedSearchTerm = searchTerm.trim().toLowerCase();
  const isQueryActive =
    normalizedSearchTerm.length > 0 || fileTypeFilter !== "all";

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
    if (previousOwnerIdRef.current === ownerId) {
      return;
    }

    previousOwnerIdRef.current = ownerId;
    hasLoadedOnceRef.current = false;
    setSources([]);
    setTotalSources(0);
    setTotalAvailableSources(0);
    setHasNextPage(false);
    setCurrentPage(0);
    setPageCursors([null]);
    setErrorMessage("");
    setIsPageLoading(false);
    setIsLoading(Boolean(ownerId));
  }, [ownerId]);

  useEffect(() => {
    const maxPageIndex = Math.max(0, Math.ceil(totalSources / DOCUMENTS_PAGE_SIZE) - 1);
    if (currentPage > maxPageIndex) {
      setCurrentPage(maxPageIndex);
    }
  }, [currentPage, totalSources]);

  useEffect(() => {
    if (!ownerId) {
      setIsLoading(false);
      setIsPageLoading(false);
      setSources([]);
      setTotalSources(0);
      setTotalAvailableSources(0);
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
      setIsPageLoading(false);
    } else {
      setIsPageLoading(true);
      // Prevent stale rows from showing while the next page/filter is loading.
      setSources([]);
    }
    setErrorMessage("");

    let cancelled = false;

    async function loadDocumentsPage() {
      try {
        if (isQueryActive) {
          const allSources = await getAllDocumentSourcesByOwner(resolvedOwnerId);
          if (cancelled) {
            return;
          }

          const filteredSources = allSources.filter((source) => {
            const matchesName = source.name
              .toLowerCase()
              .includes(normalizedSearchTerm);
            const matchesType =
              fileTypeFilter === "all"
                ? true
                : getDocumentTypeFilter(source) === fileTypeFilter;

            return matchesName && matchesType;
          });

          const maxPageIndex = Math.max(
            0,
            Math.ceil(filteredSources.length / DOCUMENTS_PAGE_SIZE) - 1,
          );
          const safePageIndex = Math.min(currentPage, maxPageIndex);
          const startIndex = safePageIndex * DOCUMENTS_PAGE_SIZE;
          const endIndex = startIndex + DOCUMENTS_PAGE_SIZE;

          setSources(filteredSources.slice(startIndex, endIndex));
          setTotalSources(filteredSources.length);
          setTotalAvailableSources(allSources.length);
          setHasNextPage(endIndex < filteredSources.length);
          hasLoadedOnceRef.current = true;
          setIsLoading(false);
          setIsPageLoading(false);
          return;
        }

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
        setTotalAvailableSources(total);
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

        hasLoadedOnceRef.current = true;
        setIsLoading(false);
        setIsPageLoading(false);
      } catch (error) {
        if (cancelled) {
          return;
        }
        setErrorMessage("Failed to load files from backend.");
        setIsLoading(false);
        setIsPageLoading(false);
      }
    }

    void loadDocumentsPage();

    return () => {
      cancelled = true;
    };
  }, [
    currentPage,
    isQueryActive,
    normalizedSearchTerm,
    fileTypeFilter,
    ownerId,
    refreshTick,
  ]);

  async function deleteSource(source: KnowledgeSource) {
    if (!source.id) {
      return;
    }

    setDeletingId(source.id);
    setErrorMessage("");

    try {
      // Backend orchestrates canonical source delete.
      await apiClient.delete(`/api/delete-source/${source.id}`);

      toast.success(`${source.name} deleted successfully`);

      if (sources.length === 1 && currentPage > 0) {
        setCurrentPage((page) => Math.max(page - 1, 0));
      } else {
        refreshDocuments();
      }
    } catch (error) {
      setErrorMessage("Delete failed. Please try again.");

      toast.error(`Failed to delete ${source.name}`);
    } finally {
      setDeletingId("");
    }
  }

  async function deleteAllSources() {
    if (!ownerId) {
      return;
    }

    setIsDeletingAll(true);
    setErrorMessage("");

    try {
      // Backend orchestrates bulk bucket and canonical source wipe
      await apiClient.delete('/api/delete-all-sources', {
        params: { ownerId },
      });

      toast.success("All documents cleared successfully");

      // The previous dev already wrote this perfect reset function! 
      resetPaginationAndRefresh();
    } catch (error) {
      setErrorMessage("Bulk delete failed. Please try again.");

      toast.error("Failed to delete all documents");  
    } finally {
      setIsDeletingAll(false);
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
    totalAvailableSources,
    totalPages,
    hasNextPage,
    isQueryActive,
    setCurrentPage,
    setErrorMessage,
    deleteSource,
    resetPaginationAndRefresh,
    isDeletingAll,
    deleteAllSources,
  };
}
