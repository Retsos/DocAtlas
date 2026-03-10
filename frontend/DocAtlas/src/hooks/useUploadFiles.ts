import { useMutation, useQueryClient } from "@tanstack/react-query";
import { FirebaseError } from "firebase/app";
import { apiClient, getApiErrorMessage } from "@/lib/api";
import { uploadStorageSources } from "@/services/storage-sources-service";

type UploadInput = {
  ownerId: string;
  hospitalName: string;
  files: File[];
};

type UploadFileApiResponse = {
  message: string;
  chunks_inserted: number;
};

export const useUploadFiles = () => {
  const queryClient = useQueryClient();

  return useMutation<UploadFileApiResponse[], Error, UploadInput>({
    mutationKey: ["upload-files"],
    mutationFn: async (input) => {
      try {
        const files = input.files;
        if (!files.length) {
          return [];
        }

        // Backend indexing requests (one per file).
        const fastApiUploads = files.map((file) => {
          const formData = new FormData();
          // Field name must match FastAPI endpoint signature: file: UploadFile
          formData.append("file", file);
          formData.append("tenant_id", input.ownerId);

          return apiClient
            .post<UploadFileApiResponse>("/api/upload-file", formData)
            .then((response) => response.data);
        });

        // Keep storage metadata and backend indexing in sync by running both flows together.
        const [, fastApiResults] = await Promise.all([
          uploadStorageSources(input),
          Promise.all(fastApiUploads),
        ]);

        return fastApiResults;
      } catch (error) {
        // Preserve FirebaseError type so UI can render provider-specific messages.
        if (error instanceof FirebaseError) {
          throw error;
        }
        const backendMessage = getApiErrorMessage(error);
        if (backendMessage) {
          throw new Error(`Backend upload failed: ${backendMessage}`);
        }
        throw error instanceof Error ? error : new Error("Upload failed.");
      }
    },
    onSuccess: () => {
      // Any UI list that depends on document data can refresh after upload.
      queryClient.invalidateQueries({ queryKey: ["documents"] });
    },
  });
};
