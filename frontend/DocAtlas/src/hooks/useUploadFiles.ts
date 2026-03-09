import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";

import { uploadStorageSources } from "@/services/storage-sources-service";

type UploadInput = {
  ownerId: string;
  hospitalName: string;
  files: File[];
};

export const useUploadFiles = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: UploadInput) => {
      const files = input.files;
      if (!files.length) {
        return [];
      }

      const fastApiUploads = files.map((file) => {
        const formData = new FormData();
        formData.append("file", file); // Must match the backend 'file' parameter name

        return axios.post("http://localhost:8000/upload-file", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      });

      const [, fastApiResults] = await Promise.all([
        uploadStorageSources(input),
        Promise.all(fastApiUploads),
      ]);

      return fastApiResults;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["documents"] });
    },
  });
};
