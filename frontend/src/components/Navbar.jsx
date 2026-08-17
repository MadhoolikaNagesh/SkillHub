import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../auth/AuthProvider';
import { Briefcase, LogOut, PlusCircle, User } from 'lucide-react';

export default function Navbar() {
  const { user, login, logout } = useAuth();
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-dark-800 bg-dark-950/80 backdrop-blur-md">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-2 text-xl font-extrabold tracking-tight text-white">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-primary-600 to-primary-400 text-white shadow-lg shadow-primary-500/20">
                <Briefcase className="h-5 w-5" />
              </span>
              <span>
                Skill<span className="bg-gradient-to-r from-primary-400 to-primary-200 bg-clip-text text-transparent">Hub</span>
              </span>
            </Link>
          </div>

          {/* Nav Links */}
          <div className="flex items-center space-x-4">
            <Link
              to="/"
              className={`rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                isActive('/') ? 'text-primary-400 bg-dark-900' : 'text-dark-300 hover:text-white'
              }`}
            >
              Explore Jobs
            </Link>

            {user ? (
              <>
                {user.role === 'CANDIDATE' && (
                  <Link
                    to="/candidate"
                    className={`rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                      isActive('/candidate') ? 'text-primary-400 bg-dark-900' : 'text-dark-300 hover:text-white'
                    }`}
                  >
                    My Applications
                  </Link>
                )}

                {user.role === 'EMPLOYER' && (
                  <>
                    <Link
                      to="/employer"
                      className={`rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                        isActive('/employer') ? 'text-primary-400 bg-dark-900' : 'text-dark-300 hover:text-white'
                      }`}
                    >
                      Manage Jobs
                    </Link>
                    <Link
                      to="/employer/post"
                      className="flex items-center space-x-1 rounded-lg bg-primary-600 px-3.5 py-2 text-sm font-semibold text-white shadow-lg shadow-primary-600/10 hover:bg-primary-500 transition-all"
                    >
                      <PlusCircle className="h-4 w-4" />
                      <span>Post Job</span>
                    </Link>
                  </>
                )}

                <div className="h-6 w-[1px] bg-dark-800" />

                <div className="flex items-center space-x-2">
                  <div className="flex items-center space-x-2 rounded-lg bg-dark-900 px-3 py-1.5 border border-dark-800">
                    <User className="h-4 w-4 text-primary-400" />
                    <span className="text-sm font-medium text-dark-200">{user.fullName}</span>
                    <span className="rounded-full bg-dark-800 px-2 py-0.5 text-[10px] font-bold text-primary-300 uppercase tracking-wider">
                      {user.role?.toLowerCase()}
                    </span>
                  </div>
                  <button
                    onClick={logout}
                    className="flex h-9 w-9 items-center justify-center rounded-lg border border-dark-800 text-dark-400 hover:text-rose-400 hover:bg-rose-500/5 hover:border-rose-500/20 transition-all"
                    title="Logout"
                  >
                    <LogOut className="h-4 w-4" />
                  </button>
                </div>
              </>
            ) : (
              <>
                {/* Sign In triggers OIDC redirect to auth-service login form */}
                <button
                  onClick={login}
                  className="rounded-lg px-3.5 py-2 text-sm font-medium text-dark-300 hover:text-white transition-colors"
                >
                  Sign In
                </button>
                <Link
                  to="/register"
                  className="rounded-lg border border-primary-500/30 bg-primary-600/10 px-4 py-2 text-sm font-semibold text-primary-400 hover:bg-primary-600 hover:text-white transition-all"
                >
                  Register
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
