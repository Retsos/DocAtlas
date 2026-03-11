import { useEffect, useState } from "react";
import { doc, getDoc, serverTimestamp, setDoc } from "firebase/firestore";

import { db } from "@/lib/firebase";

type UseWebsiteUrlSettingsResult = {
  websiteUrl: string;
  savedWebsiteUrl: string | null;
  isSavingUrl: boolean;
  isLoadingUrl: boolean;
  urlStatus: string | null;
  setWebsiteUrl: (value: string) => void;
  saveWebsiteUrl: () => Promise<void>;
};

export function useWebsiteUrlSettings(
  userId: string | undefined,
): UseWebsiteUrlSettingsResult {
  const [websiteUrl, setWebsiteUrl] = useState("");
  const [savedWebsiteUrl, setSavedWebsiteUrl] = useState<string | null>(null);
  const [isSavingUrl, setIsSavingUrl] = useState(false);
  const [isLoadingUrl, setIsLoadingUrl] = useState(false);
  const [urlStatus, setUrlStatus] = useState<string | null>(null);

  useEffect(() => {
    if (!userId) {
      // Clear local state when there is no authenticated user.
      setSavedWebsiteUrl(null);
      setWebsiteUrl("");
      return;
    }

    const loadWebsiteUrl = async () => {
      setIsLoadingUrl(true);
      setUrlStatus(null);
      try {
        const userDocRef = doc(db, "users", userId);
        const snapshot = await getDoc(userDocRef);

        // Read only valid string data to avoid rendering malformed values.
        const existingUrl =
          snapshot.exists() && typeof snapshot.data().websiteUrl === "string"
            ? snapshot.data().websiteUrl
            : "";

        setSavedWebsiteUrl(existingUrl || null);
        setWebsiteUrl(existingUrl);
      } catch (error) {
        console.error("Failed to load website URL", error);
        setUrlStatus("Failed to load saved website URL.");
      } finally {
        setIsLoadingUrl(false);
      }
    };

    void loadWebsiteUrl();
  }, [userId]);

  const saveWebsiteUrl = async () => {
    if (!userId) {
      setUrlStatus("You need to be logged in.");
      return;
    }

    const rawUrl = websiteUrl.trim();
    if (!rawUrl) {
      setUrlStatus("Please provide a valid website URL.");
      return;
    }

    let cleanOrigin = "";
    try {
      // Accept plain domains by adding https:// before parsing.
      const urlToParse = rawUrl.startsWith("http")
        ? rawUrl
        : `https://${rawUrl}`;
      const urlObj = new URL(urlToParse);

      // Persist only origin (scheme + host + optional port), not path/query/hash.
      cleanOrigin = urlObj.origin;
    } catch (error) {
      setUrlStatus("Invalid URL. Please provide a valid website address.");
      return;
    }

    setIsSavingUrl(true);
    setUrlStatus(null);

    try {
      const userDocRef = doc(db, "users", userId);

      // merge:true gives upsert behavior (insert if missing, update if existing).
      await setDoc(
        userDocRef,
        {
          websiteUrl: cleanOrigin,
          websiteUrlUpdatedAt: serverTimestamp(),
        },
        { merge: true },
      );

      setSavedWebsiteUrl(cleanOrigin);
      setWebsiteUrl(cleanOrigin);
      setUrlStatus("Website URL saved successfully.");
    } catch (error) {
      console.error("Failed to save website URL", error);
      setUrlStatus("Failed to save website URL.");
    } finally {
      setIsSavingUrl(false);
    }
  };

  return {
    websiteUrl,
    savedWebsiteUrl,
    isSavingUrl,
    isLoadingUrl,
    urlStatus,
    setWebsiteUrl,
    saveWebsiteUrl,
  };
}
