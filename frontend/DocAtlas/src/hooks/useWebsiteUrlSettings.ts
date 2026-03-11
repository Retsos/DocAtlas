import { useEffect, useState } from "react";
import { apiClient, getApiErrorMessage } from "@/lib/api";

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
      setSavedWebsiteUrl(null);
      setWebsiteUrl("");
      return;
    }

    const loadWebsiteUrl = async () => {
      setIsLoadingUrl(true);
      setUrlStatus(null);
      try {
        const response = await apiClient.get<{ websiteUrl: string | null }>("/api/website-url");
        const existingUrl = response.data.websiteUrl ?? "";
        setSavedWebsiteUrl(existingUrl || null);
        setWebsiteUrl(existingUrl);
      } catch (error) {
        const message = getApiErrorMessage(error) ?? "Failed to load saved website URL.";
        setUrlStatus(message);
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

    setIsSavingUrl(true);
    setUrlStatus(null);

    try {
      const response = await apiClient.put<{ websiteUrl: string }>("/api/website-url", {
        website_url: rawUrl,
      });
      const normalizedUrl = response.data.websiteUrl;
      setSavedWebsiteUrl(normalizedUrl);
      setWebsiteUrl(normalizedUrl);
      setUrlStatus("Website URL saved successfully.");
    } catch (error) {
      const message = getApiErrorMessage(error) ?? "Failed to save website URL.";
      setUrlStatus(message);
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
