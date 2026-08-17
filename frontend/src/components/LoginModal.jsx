import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../auth/AuthProvider';
import { Mail, Lock, LogIn, X } from 'lucide-react';

export default function LoginModal() {
  const { isLoginModalOpen, closeLoginModal, loginWithCredentials } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  if (!isLoginModalOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const loggedUser = await loginWithCredentials(username, password);
      closeLoginModal();
      if (loggedUser.role === 'ADMIN') {
        navigate('/admin');
      } else if (loggedUser.role === 'EMPLOYER') {
        navigate('/employer');
      } else {
        navigate('/candidate');
      }
    } catch (err) {
      const msg = err.response?.data?.error || err.response?.data?.message || 'Invalid email or password.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-dark-900 border border-dark-800 rounded-3xl p-8 shadow-2xl relative">
        <button
          onClick={closeLoginModal}
          className="absolute top-5 right-5 text-dark-400 hover:text-white transition-colors"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="text-center mb-6">
          <div className="h-12 w-12 rounded-2xl bg-primary-600/10 border border-primary-500/20 flex items-center justify-center mx-auto mb-3 text-primary-400">
            <LogIn className="h-6 w-6" />
          </div>
          <h2 className="text-2xl font-extrabold text-white tracking-tight">Sign In to SkillHub</h2>
          <p className="text-xs text-dark-400 mt-1">Access your candidate, employer, or admin portal</p>
        </div>

        {error && (
          <div className="rounded-xl bg-rose-500/10 border border-rose-500/20 p-3.5 text-xs text-rose-400 mb-5 whitespace-pre-line text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-[10px] font-bold text-dark-300 uppercase tracking-wider mb-1.5">
              Email Address
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-dark-400">
                <Mail className="h-4 w-4" />
              </span>
              <input
                type="email"
                required
                placeholder="name@email.com"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full rounded-xl bg-dark-950 border border-dark-800 text-white placeholder-dark-500 pl-10 pr-4 py-2.5 text-sm focus:border-primary-500 focus:outline-none transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-dark-300 uppercase tracking-wider mb-1.5">
              Password
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-dark-400">
                <Lock className="h-4 w-4" />
              </span>
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-xl bg-dark-950 border border-dark-800 text-white placeholder-dark-500 pl-10 pr-4 py-2.5 text-sm focus:border-primary-500 focus:outline-none transition-colors"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 rounded-xl bg-primary-600 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-primary-600/10 hover:bg-primary-500 disabled:opacity-50 transition-all mt-2"
          >
            <LogIn className="h-4 w-4" />
            <span>{loading ? 'Signing in...' : 'Sign In'}</span>
          </button>
        </form>

        <div className="border-t border-dark-800 mt-6 pt-5 text-center text-xs text-dark-400">
          Don't have an account?{' '}
          <Link
            to="/register"
            onClick={closeLoginModal}
            className="font-semibold text-primary-400 hover:text-primary-300"
          >
            Create Account
          </Link>
        </div>
      </div>
    </div>
  );
}
