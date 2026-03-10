import type { Dispatch, SetStateAction } from "react";
import { FileUp, Loader2, Sparkles, X } from "lucide-react";

import { Button } from "@/components/ui/button";

type KnowledgeUploadPanelProps = {
  selectedFiles: File[];
  isUploading: boolean;
  errorMessage: string;
  onFilesChange: Dispatch<SetStateAction<File[]>>;
  onUpload: () => void;
};

function mergeUniqueFiles(existingFiles: File[], incomingFiles: File[]) {
  const uniqueByIdentity = new Map<string, File>();

  [...existingFiles, ...incomingFiles].forEach((file) => {
    const identity = `${file.name}-${file.size}-${file.lastModified}`;
    uniqueByIdentity.set(identity, file);
  });

  return Array.from(uniqueByIdentity.values());
}

function formatFileSize(sizeBytes: number) {
  const kb = sizeBytes / 1024;
  if (kb < 1024) {
    return `${kb.toFixed(1)} KB`;
  }

  return `${(kb / 1024).toFixed(1)} MB`;
}

export function KnowledgeUploadPanel({
  selectedFiles,
  isUploading,
  errorMessage,
  onFilesChange,
  onUpload,
}: KnowledgeUploadPanelProps) {
  const hasPendingFiles = selectedFiles.length > 0;

  return (
    <section className="flex h-[45rem] flex-col overflow-hidden rounded-2xl border border-emerald-100/80 bg-white/95 p-6 shadow-[0_20px_50px_rgba(6,78,59,0.08)] sm:p-8">

      <div className="mb-4 flex shrink-0 items-start justify-between gap-4">
        <div className="space-y-2">
          <p className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-900">
            <Sparkles className="size-3.5" />
            Chatbot Data Studio
          </p>
          <h2 className="text-2xl font-semibold tracking-tight text-emerald-950">
            Upload Knowledge Sources
          </h2>
          <p className="text-sm text-slate-600">
            Add your institutional files and DocAtlas will index them for retrieval and source-cited responses.
          </p>
        </div>
      </div>

      

      <div className="flex-1 min-h-0 overflow-y-auto space-y-8 pr-2 [scrollbar-gutter:stable]">
        {selectedFiles.length > 0 && (
          <div className="rounded-xl border border-emerald-100 bg-emerald-50/40 p-4">
            <p className="mb-2 text-sm font-medium text-slate-900">
              Selected files
            </p>
            <ul className="space-y-2">
              {selectedFiles.map((file) => {
                const fileId = `${file.name}-${file.size}-${file.lastModified}`;
                return (
                  <li
                    key={fileId}
                    className="flex items-center justify-between gap-2 rounded-md border border-emerald-100 bg-white px-3 py-2 text-xs text-slate-700"
                  >
                    <span className="min-w-0 flex-1 truncate pr-2" title={file.name}>
                      {file.name}
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="shrink-0 text-slate-500">
                        {formatFileSize(file.size)}
                      </span>
                      <button
                        type="button"
                        className="cursor-pointer rounded-sm p-0.5 text-slate-400 transition hover:bg-red-50 hover:text-red-600"
                        onClick={() => {
                          onFilesChange((currentFiles) =>
                            currentFiles.filter(
                              (selected) =>
                                !(
                                  selected.name === file.name &&
                                  selected.size === file.size &&
                                  selected.lastModified === file.lastModified
                                ),
                            ),
                          );
                        }}
                        aria-label={`Remove ${file.name}`}
                      >
                        <X className="size-3.5" />
                      </button>
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>
        )}

        <label
          htmlFor="file-upload"
          className="flex min-h-64 cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-emerald-200 bg-[linear-gradient(145deg,rgba(236,253,245,0.75),rgba(255,255,255,0.95))] p-8 text-center transition hover:border-emerald-300 hover:bg-emerald-50/70"
        >
          <FileUp className="mb-4 size-10 text-emerald-900/70" />
          <p className="text-lg font-medium text-slate-900">
            Drop files here or click to upload
          </p>
          <p className="mt-1 text-sm text-slate-600">
            PDF, DOCX, XLSX, TXT and internal healthcare operations documents
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
            const incomingFiles = Array.from(event.target.files ?? []);
            onFilesChange((currentFiles) =>
              mergeUniqueFiles(currentFiles, incomingFiles),
            );
            event.currentTarget.value = "";
          }}
          className="sr-only"
        />
      </div>

      <div className=" shrink-0 space-y-4 pt-2">
        <Button
          type="button"
          size="lg"
          className="h-12 w-full cursor-pointer bg-emerald-950 text-base text-emerald-50 shadow-[0_10px_30px_rgba(4,120,87,0.28)] transition hover:-translate-y-0.5 hover:bg-emerald-900"
          onClick={onUpload}
          disabled={!hasPendingFiles || isUploading}
        >
          {isUploading ? (
            <span className="inline-flex items-center gap-2">
              <Loader2 className="size-4 animate-spin" />
              Uploading and indexing files...
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
  );
}
