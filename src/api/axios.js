import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:4000/api",
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

    if (
      error.response?.data?.message?.includes("expired") ||
      error.response?.data?.error?.includes("expired")
    ) {
      // Clear token
      localStorage.removeItem("token");
      localStorage.removeItem("user");

      // Redirect to login
      window.location.href = "/login";
    }

    return Promise.reject(error);
  }
);

export default API;