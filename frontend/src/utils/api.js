import axios from 'axios';
import { userManager } from '../auth/authConfig';

const getBaseUrl = () => {
  if (typeof window !== 'undefined') {
    const origin = window.location.origin;
    // If running from Vite dev server on :5173, point to backend on :8080
    if (origin.includes(':5173')) {
      return 'http://localhost:8080';
    }
    // In production single-container deployment, serve relative to origin
    return origin;
  }
  return 'http://localhost:8080';
};

const api = axios.create({
  baseURL: getBaseUrl(),
  withCredentials: false, // No session cookies — we use Bearer tokens
});

/**
 * Intercept every request to attach the current access token as a Bearer header.
 * The token is fetched fresh from the UserManager's session storage.
 */
api.interceptors.request.use(async (config) => {
  const nativeToken = typeof window !== 'undefined' ? sessionStorage.getItem('skillhub_token') : null;
  if (nativeToken) {
    config.headers['Authorization'] = `Bearer ${nativeToken}`;
    return config;
  }
  const oidcUser = await userManager.getUser();
  if (oidcUser && !oidcUser.expired && oidcUser.access_token) {
    config.headers['Authorization'] = `Bearer ${oidcUser.access_token}`;
  }
  return config;
});

/**
 * If the server returns 401, the token has expired or is invalid.
 * Remove it from storage — the user will be prompted to log in again.
 */
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      await userManager.removeUser();
      window.location.href = '/';
    }
    return Promise.reject(error);
  }
);

export default api;
