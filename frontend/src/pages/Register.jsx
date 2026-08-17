import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../auth/AuthProvider';
import api from '../utils/api';
import { User, Briefcase, Mail, Lock, FileText, Globe, Building2, UserPlus, CheckCircle } from 'lucide-react';

export default function Register() {
  const { login } = useAuth();

  const [role, setRole] = useState('CANDIDATE'); // 'CANDIDATE' or 'EMPLOYER'
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  
  // Candidate specific
  const [title, setTitle] = useState('');
  const [skills, setSkills] = useState('');
  const [resumeUrl, setResumeUrl] = useState('');

  // Employer specific
  const [companyName, setCompanyName] = useState('');
  const [companyWebsite, setCompanyWebsite] = useState('');
  const [companyDescription, setCompanyDescription] = useState('');

  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const payload = {
      username,
      password,
      fullName,
      role,
      ...(role === 'CANDIDATE' ? { title, skills, resumeUrl } : { companyName, companyWebsite, companyDescription })
    };

    try {
      // Call the monolith's pre-registration endpoint directly
      await api.post('/api/users/register', payload);
      setSuccess(true);
    } catch (err) {
      const errorData = err.response?.data;
      if (errorData?.error) {
        setError(errorData.error);
      } else if (typeof errorData === 'object') {
        setError(Object.entries(errorData).map(([k,v]) => `${k}: ${v}`).join('\n'));
      } else {
        setError('Registration failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="hero-gradient min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-lg bg-dark-900 border border-dark-800 rounded-3xl p-8 shadow-2xl relative">

        {/* Success State */}
        {success && (
          <div className="text-center py-8">
            <CheckCircle className="h-14 w-14 text-emerald-400 mx-auto mb-4" />
            <h2 className="text-2xl font-extrabold text-white mb-2">Account Created!</h2>
            <p className="text-sm text-dark-400 mb-6">
              Your account has been successfully created. Click below to sign in with your new credentials.
            </p>
            <button
              onClick={login}
              className="w-full rounded-xl bg-primary-600 px-4 py-3 text-sm font-semibold text-white hover:bg-primary-500 transition-all"
            >
              Sign In with SkillHub
            </button>
          </div>
        )}

        {!success && (
        <>
        <div className="text-center mb-6">
          <h2 className="text-3xl font-extrabold text-white tracking-tight">Create Account</h2>

          <p className="text-sm text-dark-400 mt-2">
            Join the SkillHub community and get started today.
          </p>
        </div>

        {/* Role Tabs */}
        <div className="flex bg-dark-950 p-1.5 rounded-xl border border-dark-800 mb-6">
          <button
            type="button"
            onClick={() => setRole('CANDIDATE')}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all ${
              role === 'CANDIDATE' 
                ? 'bg-primary-600 text-white shadow-md' 
                : 'text-dark-400 hover:text-white'
            }`}
          >
            <User className="h-4 w-4" />
            <span>Candidate / Freelancer</span>
          </button>
          <button
            type="button"
            onClick={() => setRole('EMPLOYER')}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all ${
              role === 'EMPLOYER' 
                ? 'bg-primary-600 text-white shadow-md' 
                : 'text-dark-400 hover:text-white'
            }`}
          >
            <Building2 className="h-4 w-4" />
            <span>Employer / Company</span>
          </button>
        </div>

        {error && (
          <div className="rounded-xl bg-rose-500/10 border border-rose-500/20 p-4 text-xs text-rose-400 mb-6 whitespace-pre-line">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-[10px] font-bold text-dark-300 uppercase tracking-wider mb-1.5">
                Full Name
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-dark-400">
                  <User className="h-4 w-4" />
                </span>
                <input
                  type="text"
                  required
                  placeholder="John Doe"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full rounded-xl bg-dark-950 border border-dark-800 text-white placeholder-dark-500 pl-10 pr-4 py-2.5 text-sm focus:border-primary-500 focus:outline-none transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-dark-300 uppercase tracking-wider mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-dark-400">
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
          </div>

          <div>
            <label className="block text-[10px] font-bold text-dark-300 uppercase tracking-wider mb-1.5">
              Password
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-dark-400">
                <Lock className="h-4 w-4" />
              </span>
              <input
                type="password"
                required
                placeholder="Min 6 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-xl bg-dark-950 border border-dark-800 text-white placeholder-dark-500 pl-10 pr-4 py-2.5 text-sm focus:border-primary-500 focus:outline-none transition-colors"
              />
            </div>
          </div>

          {/* Dynamic Candidate Fields */}
          {role === 'CANDIDATE' && (
            <div className="space-y-4 border-t border-dark-800 pt-4 mt-2">
              <div>
                <label className="block text-[10px] font-bold text-dark-300 uppercase tracking-wider mb-1.5">
                  Professional Title
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-dark-400">
                    <Briefcase className="h-4 w-4" />
                  </span>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Senior Fullstack Developer"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full rounded-xl bg-dark-950 border border-dark-800 text-white placeholder-dark-500 pl-10 pr-4 py-2.5 text-sm focus:border-primary-500 focus:outline-none transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-dark-300 uppercase tracking-wider mb-1.5">
                  Skills (comma separated)
                </label>
                <input
                  type="text"
                  required
                  placeholder="React, Java, Spring Boot, PostgreSQL"
                  value={skills}
                  onChange={(e) => setSkills(e.target.value)}
                  className="w-full rounded-xl bg-dark-950 border border-dark-800 text-white placeholder-dark-500 px-4 py-2.5 text-sm focus:border-primary-500 focus:outline-none transition-colors"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-dark-300 uppercase tracking-wider mb-1.5">
                  Resume Link (Google Drive, Dropbox, etc)
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-dark-400">
                    <FileText className="h-4 w-4" />
                  </span>
                  <input
                    type="url"
                    placeholder="https://drive.google.com/..."
                    value={resumeUrl}
                    onChange={(e) => setResumeUrl(e.target.value)}
                    className="w-full rounded-xl bg-dark-950 border border-dark-800 text-white placeholder-dark-500 pl-10 pr-4 py-2.5 text-sm focus:border-primary-500 focus:outline-none transition-colors"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Dynamic Employer Fields */}
          {role === 'EMPLOYER' && (
            <div className="space-y-4 border-t border-dark-800 pt-4 mt-2">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-[10px] font-bold text-dark-300 uppercase tracking-wider mb-1.5">
                    Company Name
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-dark-400">
                      <Building2 className="h-4 w-4" />
                    </span>
                    <input
                      type="text"
                      required
                      placeholder="Acme Corp"
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                      className="w-full rounded-xl bg-dark-950 border border-dark-800 text-white placeholder-dark-500 pl-10 pr-4 py-2.5 text-sm focus:border-primary-500 focus:outline-none transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-dark-300 uppercase tracking-wider mb-1.5">
                    Company Website
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-dark-400">
                      <Globe className="h-4 w-4" />
                    </span>
                    <input
                      type="url"
                      placeholder="https://acme.org"
                      value={companyWebsite}
                      onChange={(e) => setCompanyWebsite(e.target.value)}
                      className="w-full rounded-xl bg-dark-950 border border-dark-800 text-white placeholder-dark-500 pl-10 pr-4 py-2.5 text-sm focus:border-primary-500 focus:outline-none transition-colors"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-dark-300 uppercase tracking-wider mb-1.5">
                  Company Description
                </label>
                <textarea
                  rows={3}
                  placeholder="Introduce your company and what you focus on..."
                  value={companyDescription}
                  onChange={(e) => setCompanyDescription(e.target.value)}
                  className="w-full rounded-xl bg-dark-950 border border-dark-800 text-white placeholder-dark-500 px-4 py-2.5 text-sm focus:border-primary-500 focus:outline-none transition-colors resize-none"
                />
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 rounded-xl bg-primary-600 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-primary-600/10 hover:bg-primary-500 hover:shadow-primary-500/20 disabled:opacity-50 transition-all pt-2.5"
          >
            <UserPlus className="h-4 w-4" />
            <span>{loading ? 'Registering Account...' : 'Sign Up'}</span>
          </button>
        </form>

        <div className="border-t border-dark-800 mt-6 pt-6 text-center text-xs text-dark-400">
          Already have an account?{' '}
          <button
            onClick={login}
            className="font-semibold text-primary-400 hover:text-primary-300"
          >
            Sign In
          </button>
        </div>
        </>
        )}
      </div>
    </div>
  );
}

