import axios from "axios";

export default axios.create({
  baseURL: import.meta.env.VITE_API_CLIENT_BASE_URL, // Base URL for the API
  withCredentials: true, // Ensures cookies are sent
});
