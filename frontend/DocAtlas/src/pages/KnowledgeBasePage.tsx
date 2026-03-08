import { useEffect, useMemo, useState } from "react";
import { FirebaseError } from "firebase/app";
import {
  ChevronLeft,
  ChevronRight,
  FileUp,
  Loader2,
  Sparkles,
  Trash2,
} from "lucide-react";

import { useAuth } from "@/providers/AuthProvider";
import { Button } from "@/components/ui/button";
import {
  DOCUMENTS_PAGE_SIZE,
  deleteDocumentSource,
  getDocumentSourcesCount,
  getDocumentSourcesPage,
  type DocumentsPageCursor,
  uploadStorageSources,
} from "@/services/storage-sources-service";
import type { KnowledgeSource } from "@/types/knowledgeSource";

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

export function KnowledgeBasePage() {
  const { user } = useAuth();
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [sources, setSources] = useState<KnowledgeSource[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [deletingId, setDeletingId] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [currentPage, setCurrentPage] = useState(0);
  const [totalSources, setTotalSources] = useState(0);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [pageCursors, setPageCursors] = useState<DocumentsPageCursor[]>([null]);
  const [refreshTick, setRefreshTick] = useState(0);

  const hasPendingFiles = useMemo(
    () => selectedFiles.length > 0,
    [selectedFiles.length],
  );
  const totalPages = Math.max(1, Math.ceil(totalSources / DOCUMENTS_PAGE_SIZE));

  useEffect(() => {
    if (!user?.id) {
      setIsLoading(false);
      setSources([]);
      setTotalSources(0);
      setCurrentPage(0);
      setHasNextPage(false);
      setPageCursors([null]);
      return;
    }
    const ownerId = user.id;

    setIsLoading(true);
    setErrorMessage("");

    let cancelled = false;

    async function loadDocumentsPage() {
      try {
        const cursor = pageCursors[currentPage] ?? null;
        const [pageResult, total] = await Promise.all([
          getDocumentSourcesPage({
            ownerId,
            pageSize: DOCUMENTS_PAGE_SIZE,
            startAfterCursor: cursor,
          }),
          getDocumentSourcesCount(ownerId),
        ]);

        if (cancelled) {
          return;
        }

        setSources(pageResult.sources);
        setTotalSources(total);
        setHasNextPage(pageResult.hasMore);

        setPageCursors((prev) => {
          if (!pageResult.hasMore || !pageResult.nextCursor || prev[currentPage + 1]) {
            return prev;
          }
          const next = [...prev];
          next[currentPage + 1] = pageResult.nextCursor;
          return next;
        });

        const maxPageIndex = Math.max(0, Math.ceil(total / DOCUMENTS_PAGE_SIZE) - 1);
        if (currentPage > maxPageIndex) {
          setCurrentPage(maxPageIndex);
          return;
        }

        setIsLoading(false);
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
      }
    }

    void loadDocumentsPage();

    return () => {
      cancelled = true;
    };
  }, [currentPage, refreshTick, user?.id]);

  async function handleUpload() {
    if (!user?.id || !hasPendingFiles) {
      return;
    }

    setIsUploading(true);
    setErrorMessage("");

    try {
      await uploadStorageSources({
        ownerId: user.id,
        hospitalName: user.hospitalName,
        files: selectedFiles,
      });
      setSelectedFiles([]);
      setCurrentPage(0);
      setPageCursors([null]);
      setRefreshTick((tick) => tick + 1);
    } catch (error) {
      if (error instanceof FirebaseError) {
        setErrorMessage(error.message);
      } else {
        setErrorMessage("Upload failed. Please try again.");
      }
    } finally {
      setIsUploading(false);
    }
  }

  async function handleDelete(source: KnowledgeSource) {
    if (!source.id) {
      return;
    }

    setDeletingId(source.id);
    setErrorMessage("");

    try {
      await deleteDocumentSource({
        documentId: source.id,
        storagePath: source.storagePath,
      });

      if (sources.length === 1 && currentPage > 0) {
        setCurrentPage((page) => Math.max(page - 1, 0));
      } else {
        setRefreshTick((tick) => tick + 1);
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

  return (
    <div className="space-y-8">
      <section className="rounded-2xl border border-emerald-100 bg-white p-8 shadow-sm">
        <div className="mb-6 flex items-start justify-between gap-4">
          <div className="space-y-2">
            <p className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs text-emerald-900">
              <Sparkles className="size-3.5" />
              Chatbot Data Studio
            </p>
            <h1 className="text-3xl font-semibold tracking-tight text-slate-900">
              Knowledge Base
            </h1>
            <p className="text-sm text-slate-600">
              Each upload is saved in Storage and indexed in Firestore
              documents.
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <label
            htmlFor="file-upload"
            className="flex min-h-72 cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-emerald-200 bg-emerald-50/40 p-8 text-center transition hover:bg-emerald-50"
          >
            <FileUp className="mb-4 size-10 text-emerald-900/70" />
            <p className="text-lg font-medium text-slate-900">
              Drop files here or click to upload
            </p>
            <p className="mt-1 text-sm text-slate-600">
              PDF, DOCX, XLSX, TXT and other internal hospital docs
            </p>
            <p className="mt-4 text-xs text-slate-500">
              {selectedFiles.length > 0
                ? `${selectedFiles.length} file(s) selected`
                : "No files selected yet"}
            </p>
          </label>
          <input
            id="file-upload"
            type="file"
            multiple
            onChange={(event) => {
              const nextFiles = Array.from(event.target.files ?? []);
              setSelectedFiles(nextFiles);
            }}
            className="sr-only"
          />

          <Button
            type="button"
            size="lg"
            className="h-12 w-full cursor-pointer bg-emerald-950 text-base text-emerald-50 hover:bg-emerald-900"
            onClick={handleUpload}
            disabled={!hasPendingFiles || isUploading}
          >
            {isUploading ? (
              <span className="inline-flex items-center gap-2">
                <Loader2 className="size-4 animate-spin" />
                Uploading to Storage...
              </span>
            ) : (
              "Upload Files"
            )}
          </Button>

          {errorMessage && (
            <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              {errorMessage}
            </p>
          )}
        </div>
      </section>

      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-slate-900">Your Documents</h2>
          <p className="text-xs text-slate-500">{totalSources} total</p>
        </div>

        {isLoading ? (
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
                        <p className="text-sm font-semibold text-slate-900">{source.name}</p>
                        <p className="text-xs text-slate-500">
                          Uploaded: {formatDate(source.createdAt)} | Size: {" "}
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
                        onClick={() => void handleDelete(source)}
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
                  onClick={() => setCurrentPage((page) => Math.max(page - 1, 0))}
                  disabled={isLoading || currentPage === 0}
                >
                  <ChevronLeft className="mr-1 size-4" />
                  Previous
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="cursor-pointer"
                  onClick={() => setCurrentPage((page) => page + 1)}
                  disabled={isLoading || !hasNextPage}
                >
                  Next
                  <ChevronRight className="ml-1 size-4" />
                </Button>
              </div>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
