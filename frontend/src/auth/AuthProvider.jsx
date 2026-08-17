import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { userManager } from './authConfig';

const AuthContext = createContext(null);

/**
 * OIDC-based AuthProvider.
 * Wraps the app, provides `user` (decoded OIDC User object with JWT claims),
 * `accessToken`, and helper functions for login/logout.
 */
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

  useEffect(() => {
    // 1. Check native session in sessionStorage
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

    // 2. Fallback check for OIDC session
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

  const loginWithCredentials = useCallback(async (username, password) => {
    // Dynamically import api to prevent circular dependencies
    const api = (await import('../utils/api')).default;
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
  }, []);

  const login = useCallback(() => {
    openLoginModal();
  }, [openLoginModal]);

  const logout = useCallback(async () => {
    sessionStorage.removeItem('skillhub_token');
    sessionStorage.removeItem('skillhub_user');
    try {
      await userManager.removeUser();
    } catch (e) {}
    setUser(null);
    window.location.href = '/';
  }, []);

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
        logout,
        loginWithCredentials,
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
