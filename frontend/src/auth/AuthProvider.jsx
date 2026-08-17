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

  useEffect(() => {
    // On mount, check if a user session already exists in sessionStorage
    userManager.getUser().then((oidcUser) => {
      if (oidcUser && !oidcUser.expired) {
        setUser(oidcUser);
      }
      setLoading(false);
    });

    // Listen for events from the UserManager
    const onUserLoaded = (oidcUser) => setUser(oidcUser);
    const onUserUnloaded = () => setUser(null);
    const onAccessTokenExpired = () => {
      setUser(null);
    };

    userManager.events.addUserLoaded(onUserLoaded);
    userManager.events.addUserUnloaded(onUserUnloaded);
    userManager.events.addAccessTokenExpired(onAccessTokenExpired);

    return () => {
      userManager.events.removeUserLoaded(onUserLoaded);
      userManager.events.removeUserUnloaded(onUserUnloaded);
      userManager.events.removeAccessTokenExpired(onAccessTokenExpired);
    };
  }, []);

  /**
   * Redirects the browser to the Spring Authorization Server's /oauth2/authorize.
   * The Authorization Server will show its login form, then redirect back to /callback.
   */
  const login = useCallback(() => {
    userManager.signinRedirect();
  }, []);

  /**
   * Clears local token storage and redirects to the Authorization Server's logout endpoint.
   */
  const logout = useCallback(async () => {
    await userManager.signoutRedirect();
  }, []);

  /**
   * Called from the /callback page after the browser returns from the auth server.
   * Completes the Authorization Code + PKCE exchange to get tokens.
   */
  const handleCallback = useCallback(async () => {
    const oidcUser = await userManager.signinRedirectCallback();
    setUser(oidcUser);
    return oidcUser;
  }, []);

  // Derive a plain user profile object from the OIDC token claims
  // so the rest of the app doesn't need to know about oidc-client-ts internals
  const profile = user ? {
    id: user.profile.userId,
    username: user.profile.sub,
    fullName: user.profile.fullName,
    role: user.profile.role,
    accessToken: user.access_token,
  } : null;

  return (
    <AuthContext.Provider value={{ user: profile, oidcUser: user, loading, login, logout, handleCallback }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
