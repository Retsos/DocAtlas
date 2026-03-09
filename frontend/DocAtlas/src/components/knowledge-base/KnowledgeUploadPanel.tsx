import { FileUp, Loader2, Sparkles, X } from "lucide-react";

import { Button } from "@/components/ui/button";

type KnowledgeUploadPanelProps = {
  selectedFiles: File[];
  isUploading: boolean;
  errorMessage: string;
  onFilesChange: (files: File[]) => void;
  onUpload: () => void;
};

function mergeUniqueFiles(existingFiles: File[], incomingFiles: File[]) {
  const uniqueByIdentity = new Map<string, File>();

  [...existingFiles, ...incomingFiles].forEach((file) => {
    // Browser File objects have no stable id, so we derive one.
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
            Each upload is saved in Storage and indexed in Firestore documents.
          </p>
        </div>
      </div>

      {selectedFiles.length > 0 && (
        <div className="rounded-xl border border-emerald-100 bg-emerald-50/40 p-4">
          <p className="mb-2 text-sm font-medium text-slate-900">Selected files</p>
          <ul className="max-h-44 space-y-2 overflow-y-auto pr-1">
            {selectedFiles.map((file) => {
              const fileId = `${file.name}-${file.size}-${file.lastModified}`;

              return (
                <li
                  key={fileId}
                  className="flex items-center justify-between gap-2 rounded-md bg-white px-3 py-2 text-xs text-slate-700"
                >
                  <span className="truncate pr-2" title={file.name}>
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
                        onFilesChange(
                          selectedFiles.filter(
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
            const incomingFiles = Array.from(event.target.files ?? []);
            onFilesChange(mergeUniqueFiles(selectedFiles, incomingFiles));
            // Allow selecting the same file again in a following picker action.
            event.currentTarget.value = "";
          }}
          className="sr-only"
        />

        <Button
          type="button"
          size="lg"
          className="h-12 w-full cursor-pointer bg-emerald-950 text-base text-emerald-50 hover:bg-emerald-900"
          onClick={onUpload}
          disabled={!hasPendingFiles || isUploading}
        >
          {isUploading ? (
            <span className="inline-flex items-center gap-2">
              <Loader2 className="size-4 animate-spin" />
              Uploading to Storage + FastAPI...
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
