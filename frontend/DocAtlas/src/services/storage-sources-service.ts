import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  documentId,
  getCountFromServer,
  getDocs,
  limit,
  orderBy,
  query,
  serverTimestamp,
  startAfter,
  where,
  type DocumentData,
  type QueryDocumentSnapshot,
} from "firebase/firestore";
import { FirebaseError } from "firebase/app";
import {
  deleteObject,
  getDownloadURL,
  ref,
  uploadBytes,
} from "firebase/storage";

import { db, storage } from "@/lib/firebase";
import type { KnowledgeSource } from "@/types/knowledgeSource";

const DOCUMENTS_COLLECTION = "documents";
export const DOCUMENTS_PAGE_SIZE = 5;
export type DocumentsPageCursor = QueryDocumentSnapshot<DocumentData> | null;

// Keep every user's files isolated in a dedicated storage "room".
function buildUserFolder(ownerId: string) {
  return `knowledge-sources/${ownerId}`;
}

function sanitizeFileName(fileName: string) {
  return fileName.replace(/\s+/g, "_");
}

function mapDocumentSnapshot(
  docSnapshot: QueryDocumentSnapshot<DocumentData>,
): KnowledgeSource {
  const data = docSnapshot.data();

  return {
    id: docSnapshot.id,
    ownerId: typeof data.ownerId === "string" ? data.ownerId : "",
    hospitalName: typeof data.hospitalName === "string" ? data.hospitalName : "",
    type: data.type === "url" ? "url" : "file",
    name: typeof data.name === "string" ? data.name : "Untitled",
    url: typeof data.url === "string" ? data.url : "",
    storagePath:
      typeof data.storagePath === "string" ? data.storagePath : undefined,
    createdAt: data.createdAt?.toDate?.(),
    sizeBytes: typeof data.sizeBytes === "number" ? data.sizeBytes : undefined,
  };
}

export async function uploadStorageSources(input: {
  ownerId: string;
  hospitalName: string;
  files: File[];
}) {
  await Promise.all(
    input.files.map(async (file) => {
      const safeName = sanitizeFileName(file.name);
      const fileRef = ref(
        storage,
        `${buildUserFolder(input.ownerId)}/${Date.now()}-${safeName}`,
      );

      // 1) Upload the binary file to Cloud Storage.
      await uploadBytes(fileRef, file, {
        contentType: file.type || undefined,
      });

      // 2) Persist source metadata in Firestore so the UI can query by owner.
      const downloadUrl = await getDownloadURL(fileRef);

      await addDoc(collection(db, DOCUMENTS_COLLECTION), {
        ownerId: input.ownerId,
        hospitalName: input.hospitalName,
        type: "file",
        name: file.name,
        url: downloadUrl,
        storagePath: fileRef.fullPath,
        sizeBytes: file.size,
        createdAt: serverTimestamp(),
      });
    }),
  );
}

export async function getDocumentSourcesCount(ownerId: string): Promise<number> {
  const countQuery = query(
    collection(db, DOCUMENTS_COLLECTION),
    where("ownerId", "==", ownerId),
  );
  const snapshot = await getCountFromServer(countQuery);
  return snapshot.data().count;
}

export async function getAllDocumentSourcesByOwner(ownerId: string): Promise<KnowledgeSource[]> {
  const primaryQuery = query(
    collection(db, DOCUMENTS_COLLECTION),
    where("ownerId", "==", ownerId),
    orderBy("createdAt", "desc"),
    orderBy(documentId(), "desc"),
  );

  let snapshot;
  try {
    snapshot = await getDocs(primaryQuery);
  } catch (error) {
    if (!(error instanceof FirebaseError) || error.code !== "failed-precondition") {
      throw error;
    }

    const fallbackQuery = query(
      collection(db, DOCUMENTS_COLLECTION),
      where("ownerId", "==", ownerId),
    );

    snapshot = await getDocs(fallbackQuery);
  }

  return snapshot.docs
    .map(mapDocumentSnapshot)
    .sort(
      (a, b) =>
        (b.createdAt?.getTime?.() ?? 0) - (a.createdAt?.getTime?.() ?? 0),
    );
}

export async function getDocumentSourcesPage(input: {
  ownerId: string;
  pageSize?: number;
  startAfterCursor?: DocumentsPageCursor;
}): Promise<{
  sources: KnowledgeSource[];
  hasMore: boolean;
  nextCursor: DocumentsPageCursor;
}> {
  const pageSize = input.pageSize ?? DOCUMENTS_PAGE_SIZE;
  const pageLimit = pageSize + 1;

  const baseQuery = query(
    collection(db, DOCUMENTS_COLLECTION),
    where("ownerId", "==", input.ownerId),
    orderBy("createdAt", "desc"),
    orderBy(documentId(), "desc"),
  );

  const pageQuery = input.startAfterCursor
    ? query(baseQuery, startAfter(input.startAfterCursor), limit(pageLimit))
    : query(baseQuery, limit(pageLimit));

  let snapshot;
  try {
    snapshot = await getDocs(pageQuery);
  } catch (error) {
    // Fallback for projects without the composite index required by ownerId + createdAt ordering.
    if (!(error instanceof FirebaseError) || error.code !== "failed-precondition") {
      throw error;
    }

    const fallbackBaseQuery = query(
      collection(db, DOCUMENTS_COLLECTION),
      where("ownerId", "==", input.ownerId),
    );
    const fallbackQuery = input.startAfterCursor
      ? query(fallbackBaseQuery, startAfter(input.startAfterCursor), limit(pageLimit))
      : query(fallbackBaseQuery, limit(pageLimit));

    snapshot = await getDocs(fallbackQuery);
  }
  const hasMore = snapshot.docs.length > pageSize;
  const currentPageDocs = hasMore ? snapshot.docs.slice(0, pageSize) : snapshot.docs;

  return {
    sources: currentPageDocs.map(mapDocumentSnapshot),
    hasMore,
    nextCursor:
      currentPageDocs.length > 0 ? currentPageDocs[currentPageDocs.length - 1] : null,
  };
}

export async function deleteDocumentSource(input: {
  documentId: string;
  storagePath?: string;
}) {
  // Delete storage object first (if present), then remove metadata doc.
  if (input.storagePath) {
    await deleteObject(ref(storage, input.storagePath));
  }

  await deleteDoc(doc(db, DOCUMENTS_COLLECTION, input.documentId));
}
