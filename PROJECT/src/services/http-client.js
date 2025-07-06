//a centralized utility for managing API requests
import axios from "axios";

export const headerKeys = {
  AccessToken: "Authorization",
  ContentType: "Content-Type",
};

const userToken = sessionStorage.getItem("userToken");

// Create an axios instance with the base URL
const api = axios.create({
  baseURL: "http://localhost:8900/api/v1/",
});

// Interceptor to add token to request headers
http: api.interceptors.request.use((config) => {
  let token = userToken;
  if (config.headers && token) {
    config.headers[headerKeys.AccessToken] = `Bearer ${token}`;
  } else {
    config.headers[headerKeys.ContentType] = "application/json";
  }
  return config;
});

// Handle responses and errors globally
api.interceptors.response.use(
  (response) => response.data, // Return only the response data
  (error) => {
    console.error("API error:", error);

    if (error.response) {
      console.log("Response error:", error.response);

      // Handle 401 Unauthorized (Token expired/invalid)
      if (error.response.status === 401) {
        localStorage.removeItem("userToken"); // Remove token from storage
        window.location.href = "/"; // Redirect to login
      }
    } else if (error.request) {
      console.log("No response received:", error.request);
    } else {
      console.log("Request setup error:", error.message);
    }
    return Promise.reject(error);
  }
);

// Utility function for POST requests
export function POST(url, body) {
  return api.post(url, body);
}

// Utility function for POST requests with multipart/form-data
export function POSTFILES(url, body) {
  return api.post(url, body, {
    headers: { "Content-Type": "multipart/form-data" },
  });
}

// Utility function for PATCH requests with multipart/form-data
export function PATCHFILES(url, body) {
  return api.patch(url, body, {
    headers: { "Content-Type": "multipart/form-data" },
  });
}

// Utility function for GET requests
export function GET(url, params) {
  return api.get(url, { params });
}

// Utility function for PATCH requests
export function PATCH(url, body) {
  return api.patch(url, body);
}

// Utility function for DELETE requests
export function DELETE(url) {
  return api.delete(url);
}

export default api;
