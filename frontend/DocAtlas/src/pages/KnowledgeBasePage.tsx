import { useEffect, useState } from "react";

import { useAuth } from "@/providers/AuthProvider";
import { KnowledgeUploadPanel } from "@/components/knowledge-base/KnowledgeUploadPanel";
import { useUploadFiles } from "@/hooks/useUploadFiles";

export function KnowledgeBasePage() {
  const { user } = useAuth();
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [errorMessage, setErrorMessage] = useState("");

  const {
    mutate: uploadFiles,
    isPending: isUploadingFastApi,
    error: uploadError,
  } = useUploadFiles();

  useEffect(() => {
    if (!uploadError) {
      return;
    }
    setErrorMessage(uploadError.message || "Upload failed. Please try again.");
  }, [uploadError]);

  useEffect(() => {
    if (!user?.id) {
      setSelectedFiles([]);
      setErrorMessage("");
    }
  }, [user?.id]);

  async function handleUpload() {
    if (!user?.id || selectedFiles.length === 0) return;

    setErrorMessage("");
    uploadFiles(
      {
        ownerId: user.id,
        files: selectedFiles,
      },
      {
        onSuccess: () => {
          setSelectedFiles([]);
        },
      },
    );
  }

  return (
    <div className="flex h-full min-h-0 flex-col space-y-6">
      <section className="rounded-2xl border border-sky-100/80 bg-white/90 p-6 shadow-[0_22px_50px_rgba(30,64,175,0.1)] backdrop-blur-sm sm:p-7">
        <p className="inline-flex items-center rounded-full border border-sky-200 bg-sky-50 px-3 py-1 text-xs font-medium text-sky-900">
          Hospital AI Knowledge Platform
        </p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight text-sky-950">
          Upload new knowledge sources.
        </h1>
        <p className="mt-3 max-w-4xl text-sm leading-6 text-slate-600 sm:text-base">
          Add institutional files and DocAtlas will index them for grounded answers. Use the My Files page to search, paginate, filter by file type, and manage existing sources.
        </p>
      </section>

      <div className="min-h-0 flex-1"></div>
      <KnowledgeUploadPanel
        selectedFiles={selectedFiles}
        isUploading={isUploadingFastApi}
        errorMessage={errorMessage}
        onFilesChange={setSelectedFiles}
        onUpload={() => void handleUpload()}
      />
    </div>
  );
}
