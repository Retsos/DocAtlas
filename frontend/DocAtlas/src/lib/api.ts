import axios from "axios";
import { auth } from "@/lib/firebase";

const backendBaseUrl =
  import.meta.env.VITE_BACKEND_API_URL ?? "http://127.0.0.1:8000";

// Single axios instance used by all backend services/hooks.
export const apiClient = axios.create({
  baseURL: backendBaseUrl,
  timeout: 30000,
});


apiClient.interceptors.request.use(
  async (config) => {
    const user = auth.currentUser;
    
    // if there's a logged in user, we attempt to get their token and attach it to the request.
    if (user) {
      const token = await user.getIdToken();
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Normalizes backend error payloads into one message string.
export function getApiErrorMessage(error: unknown) {
  if (!axios.isAxiosError(error)) {
    return null;
  }

  const responseData = error.response?.data as
    | { detail?: string; message?: string }
    | undefined;

  return responseData?.detail ?? responseData?.message ?? error.message;
}