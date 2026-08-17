import { UserManager, WebStorageStateStore } from 'oidc-client-ts';

/**
 * OIDC configuration for the SkillHub React SPA.
 * Connects to the Spring Authorization Server running on :9000.
 */
const getOrigin = () => (typeof window !== 'undefined' ? window.location.origin : 'http://localhost:5173');

const getAuthority = () => {
  if (typeof window !== 'undefined') {
    const origin = window.location.origin;
    if (origin.includes('localhost') || origin.includes('127.0.0.1')) {
      return 'http://localhost:9000';
    }
    return import.meta.env.VITE_AUTH_SERVER_URL || 'https://skillhub-auth-service.onrender.com';
  }
  return 'http://localhost:9000';
};

const origin = getOrigin();

export const oidcConfig = {
  authority: getAuthority(),
  client_id: 'skillhub-react',
  redirect_uri: `${origin}/callback`,
  post_logout_redirect_uri: origin,
  response_type: 'code',
  scope: 'openid profile read write',
  // Store tokens in sessionStorage (cleared on tab close)
  userStore: new WebStorageStateStore({ store: window.sessionStorage }),
  // Automatically renew tokens in the background
  automaticSilentRenew: false,
};

export const userManager = new UserManager(oidcConfig);
