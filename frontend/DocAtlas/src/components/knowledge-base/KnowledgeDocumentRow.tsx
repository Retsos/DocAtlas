import type { KnowledgeSource } from "@/types/knowledgeSource";
import { useEffect, useRef, useState } from "react";
import { Button } from "../ui/button";
import { ExternalLink, Loader2, Trash2 } from "lucide-react";

function formatDate(date?: Date) {
  if (!date) {
    return "Unknown date";
  }

  return new Intl.DateTimeFormat("en-US", {
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

export function DocumentRow({
  source,
  onDelete,
  isDeletingAll,
  onLocalDeletingChange,
}: {
  source: KnowledgeSource;
  onDelete: (s: KnowledgeSource) => Promise<void>;
  isDeletingAll?: boolean;
  onLocalDeletingChange: (id: string, deleting: boolean) => void;
}) {
  const [isDeleting, setIsDeleting] = useState(false);
  const mountedRef = useRef(true);

  useEffect(() => {
    return () => {
      mountedRef.current = false;
      onLocalDeletingChange(source.id, false);
    };
  }, []);

  async function handleDelete() {
    if (isDeleting) return;
    setIsDeleting(true);
    onLocalDeletingChange(source.id, true);
    try {
      await onDelete(source);
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (e) {
      // onDelete handles errors/toasts
    } finally {
      if (mountedRef.current) {
        setIsDeleting(false);
        onLocalDeletingChange(source.id, false);
      }
    }
  }

  const disabled = isDeleting || isDeletingAll;

  return (
    <article className="rounded-xl border border-sky-100 bg-white p-4 shadow-sm transition hover:border-sky-200 hover:shadow-md">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 space-y-2">
          <p className="break-all text-sm font-semibold text-slate-900">
            {source.name}
          </p>
          <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
            <span className="rounded-full border border-slate-200 bg-slate-50 px-2 py-0.5">
              Uploaded: {formatDate(source.createdAt)}
            </span>
            <span className="rounded-full border border-slate-200 bg-slate-50 px-2 py-0.5">
              Size: {formatSize(source.sizeBytes)}
            </span>
          </div>
          <a
            href={source.url}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1 text-xs font-medium text-sky-800 underline-offset-2 transition hover:text-sky-700 hover:underline"
          >
            Open source file
            <ExternalLink className="size-3.5" />
          </a>
        </div>

        <Button
          type="button"
          variant="outline"
          className="shrink-0 cursor-pointer border-red-200 bg-red-50/30 text-red-700 hover:bg-red-50 hover:text-red-800"
          onClick={() => void handleDelete()}
          disabled={disabled}
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
}
