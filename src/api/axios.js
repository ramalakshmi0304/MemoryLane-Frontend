import axios from "axios";

const API = axios.create({
  // 1. Changed to baseURL (Axios standard)
  // 2. Removed semicolon after the variable
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:4000"
});

// Request interceptor
API.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

// Response interceptor (handles expired token)
API.interceptors.response.use(
  (response) => response,
  (error) => {
    // 3. Optional Chaining is good here to prevent crashes if response is undefined
    const message = error.response?.data?.message || error.response?.data?.error || "";

    if (
      error.response?.status === 401 || // 4. Best practice: check for 401 Unauthorized status
      message.toLowerCase().includes("expired")
    ) {
      // Clear storage
      localStorage.removeItem("token");
      localStorage.removeItem("user");

      // Redirect to login
      window.location.href = "/login";
    }

    return Promise.reject(error);
  }
);

export default API;