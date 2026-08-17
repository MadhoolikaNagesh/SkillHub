import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthProvider';

/**
 * Handles the OAuth2 callback redirect from the Spring Authorization Server.
 * The URL at /callback contains ?code=...&state=... parameters.
 * This page completes the PKCE code exchange to retrieve access + id tokens.
 */
export default function Callback() {
  const { handleCallback } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState(null);

  useEffect(() => {
    handleCallback()
      .then((oidcUser) => {
        const role = oidcUser?.profile?.role;
        if (role === 'EMPLOYER') {
          navigate('/employer', { replace: true });
        } else if (role === 'CANDIDATE') {
          navigate('/candidate', { replace: true });
        } else {
          navigate('/', { replace: true });
        }
      })
      .catch((err) => {
        console.error('OIDC Callback error:', err);
        setError('Authentication failed. Please try logging in again.');
      });
  }, [handleCallback, navigate]);

  if (error) {
    return (
      <div className="hero-gradient min-h-[calc(100vh-4rem)] flex items-center justify-center">
        <div className="bg-dark-900 border border-rose-500/20 rounded-2xl p-8 max-w-md text-center">
          <p className="text-rose-400 font-semibold">{error}</p>
          <button
            onClick={() => navigate('/', { replace: true })}
            className="mt-4 rounded-xl bg-primary-600 px-4 py-2 text-sm font-semibold text-white"
          >
            Go Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="hero-gradient min-h-[calc(100vh-4rem)] flex flex-col items-center justify-center gap-4">
      <div className="h-10 w-10 animate-spin rounded-full border-4 border-dark-700 border-t-primary-500" />
      <p className="text-sm text-dark-400 font-sans">Completing authentication...</p>
    </div>
  );
}
