import { UserManager, WebStorageStateStore } from 'oidc-client-ts';

/**
 * OIDC configuration for the SkillHub React SPA.
 * Connects to the Spring Authorization Server running on :9000.
 */
const origin = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:5173';

export const oidcConfig = {
  authority: typeof window !== 'undefined' && window.__ENV__?.AUTH_SERVER_URL ? window.__ENV__.AUTH_SERVER_URL : 'http://localhost:9000',
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
