import { apiClient } from "@/lib/api";
import type { KnowledgeSource } from "@/types/knowledgeSource";

export const DOCUMENTS_PAGE_SIZE = 5;
export type DocumentsPageCursor = number | null;

type BackendProfileResponse = {
  uploadedDocsCount?: number;
};

type BackendDocumentsResponse = {
  items: Array<{
    id: string;
    ownerId: string;
    hospitalName: string;
    type: "file" | "url";
    name: string;
    url: string;
    storagePath?: string;
    createdAt?: string | null;
    sizeBytes?: number;
  }>;
  total: number;
  page: number;
  page_size: number;
  has_next: boolean;
};

function mapKnowledgeSource(item: BackendDocumentsResponse["items"][number]): KnowledgeSource {
  return {
    id: item.id,
    ownerId: item.ownerId,
    hospitalName: item.hospitalName,
    type: item.type,
    name: item.name,
    url: item.url,
    storagePath: item.storagePath,
    createdAt: item.createdAt ? new Date(item.createdAt) : undefined,
    sizeBytes: item.sizeBytes,
  };
}

async function fetchDocuments(input: {
  page: number;
  pageSize?: number;
  search?: string;
}) {
  const response = await apiClient.get<BackendDocumentsResponse>("/api/documents", {
    params: {
      page: input.page,
      page_size: input.pageSize ?? DOCUMENTS_PAGE_SIZE,
      search: input.search ?? "",
    },
  });
  return response.data;
}

export async function getDocumentSourcesCount(_ownerId?: string): Promise<number> {
  const response = await apiClient.get<BackendProfileResponse>("/api/me");
  const count = response.data.uploadedDocsCount;
  return typeof count === "number" && count >= 0 ? count : 0;
}

export async function getAllDocumentSourcesByOwner(
  _ownerId?: string,
): Promise<KnowledgeSource[]> {
  const allSources: KnowledgeSource[] = [];
  let page = 1;
  let hasNext = true;

  while (hasNext) {
    const data = await fetchDocuments({ page, pageSize: 50 });
    allSources.push(...data.items.map(mapKnowledgeSource));
    hasNext = data.has_next;
    page += 1;
  }

  return allSources;
}

export async function getDocumentSourcesPage(input: {
  ownerId?: string;
  pageSize?: number;
  startAfterCursor?: DocumentsPageCursor;
}): Promise<{
  sources: KnowledgeSource[];
  hasMore: boolean;
  nextCursor: DocumentsPageCursor;
}> {
  const page = (input.startAfterCursor ?? 0) + 1;
  const data = await fetchDocuments({
    page,
    pageSize: input.pageSize ?? DOCUMENTS_PAGE_SIZE,
  });

  return {
    sources: data.items.map(mapKnowledgeSource),
    hasMore: data.has_next,
    nextCursor: data.has_next ? page : null,
  };
}

export async function deleteDocumentSource(input: { documentId: string }) {
  await apiClient.delete(`/api/delete-source/${input.documentId}`);
}
