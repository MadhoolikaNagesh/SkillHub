import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { userManager } from './authConfig';

const AuthContext = createContext(null);

/**
 * Unified AuthProvider — single source of truth for all auth operations.
 * Consolidates the former auth/AuthProvider and context/AuthContext into one.
 *
 * Provides:
 *  - user / loading state
 *  - login()               → opens LoginModal (used by Navbar, Register page)
 *  - loginWithCredentials() → POSTs credentials to /api/auth/login (used by LoginModal, Login.jsx)
 *  - register()            → POSTs to /api/users/register then auto-logs in
 *  - checkMe()             → re-fetches user from /api/auth/me
 *  - logout()              → clears session, calls /api/auth/logout, redirects home
 *  - handleCallback()      → completes OIDC code exchange (Callback.jsx)
 */
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

  useEffect(() => {
    // 1. Restore session from sessionStorage (native JWT login)
    const nativeUser = sessionStorage.getItem('skillhub_user');
    const nativeToken = sessionStorage.getItem('skillhub_token');

    if (nativeUser && nativeToken) {
      try {
        setUser(JSON.parse(nativeUser));
        setLoading(false);
        return;
      } catch (e) {
        sessionStorage.removeItem('skillhub_user');
        sessionStorage.removeItem('skillhub_token');
      }
    }

    // 2. Fallback: restore from OIDC session (oidc-client-ts)
    userManager.getUser().then((oidcUser) => {
      if (oidcUser && !oidcUser.expired) {
        setUser({
          id: oidcUser.profile.userId,
          username: oidcUser.profile.sub,
          fullName: oidcUser.profile.fullName,
          role: oidcUser.profile.role,
          accessToken: oidcUser.access_token,
        });
      }
      setLoading(false);
    });

    const onUserLoaded = (oidcUser) => {
      setUser({
        id: oidcUser.profile.userId,
        username: oidcUser.profile.sub,
        fullName: oidcUser.profile.fullName,
        role: oidcUser.profile.role,
        accessToken: oidcUser.access_token,
      });
    };
    const onUserUnloaded = () => setUser(null);

    userManager.events.addUserLoaded(onUserLoaded);
    userManager.events.addUserUnloaded(onUserUnloaded);

    return () => {
      userManager.events.removeUserLoaded(onUserLoaded);
      userManager.events.removeUserUnloaded(onUserUnloaded);
    };
  }, []);

  const openLoginModal = useCallback(() => setIsLoginModalOpen(true), []);
  const closeLoginModal = useCallback(() => setIsLoginModalOpen(false), []);

  /**
   * Opens the login modal.
   * Used by Navbar "Sign In" button and Register page "Sign In" link.
   */
  const login = useCallback(() => {
    openLoginModal();
  }, [openLoginModal]);

  /**
   * POSTs credentials to /api/auth/login, stores the JWT, and updates user state.
   * Used directly by LoginModal and Login.jsx.
   */
  const loginWithCredentials = useCallback(async (username, password) => {
    const api = (await import('../utils/api')).default;
    try {
      const response = await api.post('/api/auth/login', { username, password });
      const authData = response.data; // { token, userId, username, fullName, role }

      const profileObj = {
        id: authData.userId,
        username: authData.username,
        fullName: authData.fullName,
        role: authData.role,
        accessToken: authData.token,
      };

      sessionStorage.setItem('skillhub_token', authData.token);
      sessionStorage.setItem('skillhub_user', JSON.stringify(profileObj));
      setUser(profileObj);
      setIsLoginModalOpen(false);
      return profileObj;
    } catch (error) {
      const message = error.response?.data?.error || 'Invalid email or password.';
      throw new Error(message);
    }
  }, []);

  /**
   * Registers a new user via /api/users/register, then auto-logs in.
   * Throws a user-friendly error string on failure.
   */
  const register = useCallback(async (registerData) => {
    const api = (await import('../utils/api')).default;
    try {
      await api.post('/api/users/register', registerData);
      return await loginWithCredentials(registerData.username, registerData.password);
    } catch (error) {
      const errorData = error.response?.data;
      if (errorData) {
        if (typeof errorData === 'string') throw new Error(errorData);
        if (errorData.error) throw new Error(errorData.error);
        const messages = Object.entries(errorData)
          .map(([field, msg]) => `${field}: ${msg}`)
          .join('\n');
        throw new Error(messages || 'Registration failed');
      }
      throw new Error('Registration failed. Please check input requirements.');
    }
  }, [loginWithCredentials]);

  /**
   * Re-fetches the authenticated user from /api/auth/me.
   * Useful after profile updates to refresh in-memory user state.
   */
  const checkMe = useCallback(async () => {
    try {
      const api = (await import('../utils/api')).default;
      const response = await api.get('/api/auth/me');
      const freshUser = response.data;
      const profileObj = {
        id: freshUser.id,
        username: freshUser.username,
        fullName: freshUser.fullName,
        role: freshUser.role,
        accessToken: sessionStorage.getItem('skillhub_token'),
      };
      setUser(profileObj);
      sessionStorage.setItem('skillhub_user', JSON.stringify(profileObj));
      return profileObj;
    } catch (error) {
      setUser(null);
      sessionStorage.removeItem('skillhub_token');
      sessionStorage.removeItem('skillhub_user');
    }
  }, []);

  /**
   * Clears local session storage, calls /api/auth/logout (best-effort),
   * removes any OIDC session, and redirects to the home page.
   */
  const logout = useCallback(async () => {
    sessionStorage.removeItem('skillhub_token');
    sessionStorage.removeItem('skillhub_user');
    try {
      const api = (await import('../utils/api')).default;
      await api.post('/api/auth/logout');
    } catch (e) {
      // Best-effort — always clear local state regardless
    }
    try {
      await userManager.removeUser();
    } catch (e) {}
    setUser(null);
    window.location.href = '/';
  }, []);

  /**
   * Completes the OIDC Authorization Code + PKCE exchange.
   * Called by Callback.jsx after the auth-service redirects back.
   */
  const handleCallback = useCallback(async () => {
    const oidcUser = await userManager.signinRedirectCallback();
    const profileObj = {
      id: oidcUser.profile.userId,
      username: oidcUser.profile.sub,
      fullName: oidcUser.profile.fullName,
      role: oidcUser.profile.role,
      accessToken: oidcUser.access_token,
    };
    setUser(profileObj);
    return profileObj;
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        loginWithCredentials,
        register,
        checkMe,
        logout,
        isLoginModalOpen,
        openLoginModal,
        closeLoginModal,
        handleCallback,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
