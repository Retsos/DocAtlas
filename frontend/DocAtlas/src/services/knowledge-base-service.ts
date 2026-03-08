import {
  addDoc,
  collection,
  onSnapshot,
  query,
  serverTimestamp,
  where,
  type Unsubscribe,
} from "firebase/firestore";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";

import { db, storage } from "@/lib/firebase";
import type { KnowledgeSource } from "@/types/knowledgeSource";

const COLLECTION_NAME = "knowledge_sources";

export async function createUrlSource(input: {
  ownerId: string;
  hospitalName: string;
  sourceUrl: string;
}) {
  // Normalize URL input so stored links are always clickable.
  const sourceUrl = input.sourceUrl.trim();
  const normalizedUrl = /^https?:\/\//i.test(sourceUrl)
    ? sourceUrl
    : `https://${sourceUrl}`;

  await addDoc(collection(db, COLLECTION_NAME), {
    ownerId: input.ownerId,
    hospitalName: input.hospitalName,
    type: "url",
    name: normalizedUrl,
    url: normalizedUrl,
    createdAt: serverTimestamp(),
  });
}

export async function uploadFileSource(input: {
  ownerId: string;
  hospitalName: string;
  file: File;
}) {
  // Store file under user-scoped folder to avoid cross-tenant collisions.
  const safeFileName = input.file.name.replace(/\s+/g, "_");
  const storagePath = `knowledge-sources/${input.ownerId}/${Date.now()}-${safeFileName}`;
  const storageRef = ref(storage, storagePath);

  await uploadBytes(storageRef, input.file);
  const downloadUrl = await getDownloadURL(storageRef);

  await addDoc(collection(db, COLLECTION_NAME), {
    ownerId: input.ownerId,
    hospitalName: input.hospitalName,
    type: "file",
    name: input.file.name,
    url: downloadUrl,
    storagePath,
    createdAt: serverTimestamp(),
  });
}

export function subscribeToKnowledgeSources(
  ownerId: string,
  onData: (sources: KnowledgeSource[]) => void,
): Unsubscribe {
  // Subscribe only to the current owner's sources.
  const sourcesQuery = query(
    collection(db, COLLECTION_NAME),
    where("ownerId", "==", ownerId),
  );

  return onSnapshot(sourcesQuery, (snapshot) => {
    const sources = snapshot.docs
      .map((docSnapshot) => {
        const data = docSnapshot.data();

        return {
          id: docSnapshot.id,
          ownerId: typeof data.ownerId === "string" ? data.ownerId : "",
          hospitalName:
            typeof data.hospitalName === "string" ? data.hospitalName : "",
          type: data.type === "file" ? "file" : "url",
          name: typeof data.name === "string" ? data.name : "Untitled",
          url: typeof data.url === "string" ? data.url : "",
          storagePath:
            typeof data.storagePath === "string" ? data.storagePath : undefined,
          createdAt: data.createdAt?.toDate?.(),
        } as KnowledgeSource;
      })
      .sort((a, b) => {
        const dateA = a.createdAt?.getTime() ?? 0;
        const dateB = b.createdAt?.getTime() ?? 0;
        return dateB - dateA;
      });

    onData(sources);
  });
}
