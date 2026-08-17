import { UserManager, WebStorageStateStore } from 'oidc-client-ts';

/**
 * OIDC configuration for the SkillHub React SPA.
 * Connects to the Spring Authorization Server running on :9000.
 */
export const oidcConfig = {
  authority: 'http://localhost:9000',
  client_id: 'skillhub-react',
  redirect_uri: 'http://localhost:5173/callback',
  post_logout_redirect_uri: 'http://localhost:5173',
  response_type: 'code',
  scope: 'openid profile read write',
  // Store tokens in sessionStorage (cleared on tab close)
  userStore: new WebStorageStateStore({ store: window.sessionStorage }),
  // Automatically renew tokens in the background
  automaticSilentRenew: false,
};

export const userManager = new UserManager(oidcConfig);
