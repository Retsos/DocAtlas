import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  query,
  serverTimestamp,
  where,
  type Unsubscribe,
} from "firebase/firestore";
import {
  deleteObject,
  getDownloadURL,
  ref,
  uploadBytes,
} from "firebase/storage";

import { db, storage } from "@/lib/firebase";
import type { KnowledgeSource } from "@/types/knowledgeSource";

const DOCUMENTS_COLLECTION = "documents";

// Keep every user's files isolated in a dedicated storage "room".
function buildUserFolder(ownerId: string) {
  return `knowledge-sources/${ownerId}`;
}

function sanitizeFileName(fileName: string) {
  return fileName.replace(/\s+/g, "_");
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

export function subscribeToDocumentSources(
  ownerId: string,
  onData: (sources: KnowledgeSource[]) => void,
  onError: (error: unknown) => void,
): Unsubscribe {
  const sourcesQuery = query(
    collection(db, DOCUMENTS_COLLECTION),
    where("ownerId", "==", ownerId),
  );

  return onSnapshot(
    sourcesQuery,
    (snapshot) => {
      // Convert Firestore docs to typed UI sources.
      const sources = snapshot.docs
        .map((docSnapshot) => {
          const data = docSnapshot.data();

          return {
            id: docSnapshot.id,
            ownerId: typeof data.ownerId === "string" ? data.ownerId : "",
            hospitalName:
              typeof data.hospitalName === "string" ? data.hospitalName : "",
            type: data.type === "url" ? "url" : "file",
            name: typeof data.name === "string" ? data.name : "Untitled",
            url: typeof data.url === "string" ? data.url : "",
            storagePath:
              typeof data.storagePath === "string"
                ? data.storagePath
                : undefined,
            createdAt: data.createdAt?.toDate?.(),
            sizeBytes:
              typeof data.sizeBytes === "number" ? data.sizeBytes : undefined,
          } as KnowledgeSource;
        })
        .sort((a, b) => {
          const dateA = a.createdAt?.getTime() ?? 0;
          const dateB = b.createdAt?.getTime() ?? 0;
          return dateB - dateA;
        });

      onData(sources);
    },
    onError,
  );
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
