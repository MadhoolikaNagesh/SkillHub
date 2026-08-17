import React, { useEffect, useState } from 'react';
import api from '../utils/api';
import {
  Shield,
  Users,
  Briefcase,
  FileText,
  UserCheck,
  UserX,
  Trash2,
  Search,
  RefreshCw,
  TrendingUp,
  AlertCircle,
  Building2,
  GraduationCap,
  CheckCircle2
} from 'lucide-react';

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('overview');
  const [stats, setStats] = useState(null);
  const [jobs, setJobs] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [jobSearch, setJobSearch] = useState('');
  const [userSearch, setUserSearch] = useState('');
  const [actionLoading, setActionLoading] = useState(null);
  const [notification, setNotification] = useState('');

  const showNotification = (msg) => {
    setNotification(msg);
    setTimeout(() => setNotification(''), 4000);
  };

  const fetchDashboardData = async () => {
    setLoading(true);
    setError('');
    try {
      const [statsRes, jobsRes, usersRes] = await Promise.all([
        api.get('/api/admin/stats'),
        api.get('/api/admin/jobs'),
        api.get('/api/admin/users'),
      ]);
      setStats(statsRes.data);
      setJobs(jobsRes.data);
      setUsers(usersRes.data);
    } catch (err) {
      console.error('Failed to load admin data:', err);
      setError(err.response?.data?.message || 'Failed to fetch admin dashboard data. Ensure you have ADMIN privileges.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleToggleUserStatus = async (userId, currentEnabled) => {
    setActionLoading(`user-${userId}`);
    try {
      const res = await api.put(`/api/admin/users/${userId}/toggle-status`);
      setUsers((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, enabled: res.data.enabled } : u))
      );
      showNotification(`User account ${res.data.enabled ? 'activated' : 'deactivated'} successfully.`);
    } catch (err) {
      showNotification(err.response?.data?.message || 'Failed to update user status.');
    } finally {
      setActionLoading(null);
    }
  };

  const handleDeleteJob = async (jobId) => {
    if (!window.confirm('Are you sure you want to delete this job listing? This action cannot be undone.')) return;
    setActionLoading(`job-${jobId}`);
    try {
      await api.delete(`/api/admin/jobs/${jobId}`);
      setJobs((prev) => prev.filter((j) => j.id !== jobId));
      setStats((prev) => prev ? { ...prev, totalJobs: prev.totalJobs - 1 } : prev);
      showNotification('Job listing deleted successfully by Admin.');
    } catch (err) {
      showNotification(err.response?.data?.message || 'Failed to delete job listing.');
    } finally {
      setActionLoading(null);
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this user? All their job listings and profile data will be permanently removed.')) return;
    setActionLoading(`user-del-${userId}`);
    try {
      await api.delete(`/api/admin/users/${userId}`);
      setUsers((prev) => prev.filter((u) => u.id !== userId));
      setStats((prev) => prev ? { ...prev, totalUsers: prev.totalUsers - 1 } : prev);
      showNotification('User deleted permanently.');
    } catch (err) {
      showNotification(err.response?.data?.message || 'Failed to delete user.');
    } finally {
      setActionLoading(null);
    }
  };

  const filteredJobs = jobs.filter(
    (job) =>
      job.title?.toLowerCase().includes(jobSearch.toLowerCase()) ||
      job.employer?.fullName?.toLowerCase().includes(jobSearch.toLowerCase()) ||
      job.employer?.companyName?.toLowerCase().includes(jobSearch.toLowerCase()) ||
      job.location?.toLowerCase().includes(jobSearch.toLowerCase())
  );

  const filteredUsers = users.filter(
    (u) =>
      u.username?.toLowerCase().includes(userSearch.toLowerCase()) ||
      u.fullName?.toLowerCase().includes(userSearch.toLowerCase()) ||
      u.role?.toLowerCase().includes(userSearch.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] gap-4">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-dark-700 border-t-primary-500" />
        <p className="text-sm text-dark-400 font-sans">Loading Admin Moderation Portal...</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-dark-800 pb-6 mb-8">
        <div>
          <div className="flex items-center space-x-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-500/10 text-primary-400 border border-primary-500/20">
              <Shield className="h-6 w-6" />
            </span>
            <h1 className="text-3xl font-extrabold tracking-tight text-white">
              Admin Moderation Center
            </h1>
          </div>
          <p className="mt-1 text-sm text-dark-400">
            Monitor platform activity, moderate job listings, and manage user permissions.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={fetchDashboardData}
            className="flex items-center space-x-2 rounded-lg border border-dark-800 bg-dark-900 px-4 py-2 text-sm font-medium text-dark-200 hover:bg-dark-800 hover:text-white transition-all"
          >
            <RefreshCw className="h-4 w-4" />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {notification && (
        <div className="mb-6 flex items-center space-x-3 rounded-xl border border-primary-500/30 bg-primary-500/10 p-4 text-primary-300">
          <CheckCircle2 className="h-5 w-5 shrink-0" />
          <p className="text-sm font-medium">{notification}</p>
        </div>
      )}

      {error && (
        <div className="mb-6 flex items-center space-x-3 rounded-xl border border-rose-500/30 bg-rose-500/10 p-4 text-rose-300">
          <AlertCircle className="h-5 w-5 shrink-0" />
          <p className="text-sm font-medium">{error}</p>
        </div>
      )}

      {/* Tabs */}
      <div className="flex border-b border-dark-800 space-x-8 mb-8">
        <button
          onClick={() => setActiveTab('overview')}
          className={`pb-4 text-sm font-semibold transition-all relative ${
            activeTab === 'overview'
              ? 'text-primary-400 border-b-2 border-primary-500'
              : 'text-dark-400 hover:text-dark-200'
          }`}
        >
          System Overview
        </button>
        <button
          onClick={() => setActiveTab('jobs')}
          className={`pb-4 text-sm font-semibold transition-all relative ${
            activeTab === 'jobs'
              ? 'text-primary-400 border-b-2 border-primary-500'
              : 'text-dark-400 hover:text-dark-200'
          }`}
        >
          Moderate Jobs ({jobs.length})
        </button>
        <button
          onClick={() => setActiveTab('users')}
          className={`pb-4 text-sm font-semibold transition-all relative ${
            activeTab === 'users'
              ? 'text-primary-400 border-b-2 border-primary-500'
              : 'text-dark-400 hover:text-dark-200'
          }`}
        >
          Manage Users ({users.length})
        </button>
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && stats && (
        <div className="space-y-8">
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-2xl border border-dark-800 bg-dark-900/60 p-6 backdrop-blur-sm">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-dark-400">Total Users</span>
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20">
                  <Users className="h-5 w-5" />
                </span>
              </div>
              <p className="mt-4 text-3xl font-extrabold text-white">{stats.totalUsers}</p>
              <div className="mt-2 flex items-center text-xs text-dark-400 space-x-2">
                <span>{stats.totalCandidates} Candidates</span>
                <span>•</span>
                <span>{stats.totalEmployers} Employers</span>
              </div>
            </div>

            <div className="rounded-2xl border border-dark-800 bg-dark-900/60 p-6 backdrop-blur-sm">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-dark-400">Active Job Postings</span>
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  <Briefcase className="h-5 w-5" />
                </span>
              </div>
              <p className="mt-4 text-3xl font-extrabold text-white">{stats.totalJobs}</p>
              <div className="mt-2 flex items-center text-xs text-emerald-400 space-x-1">
                <TrendingUp className="h-3.5 w-3.5" />
                <span>Live on Job Board</span>
              </div>
            </div>

            <div className="rounded-2xl border border-dark-800 bg-dark-900/60 p-6 backdrop-blur-sm">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-dark-400">Total Applications</span>
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
                  <FileText className="h-5 w-5" />
                </span>
              </div>
              <p className="mt-4 text-3xl font-extrabold text-white">{stats.totalApplications}</p>
              <div className="mt-2 text-xs text-dark-400">Applications submitted</div>
            </div>

            <div className="rounded-2xl border border-dark-800 bg-dark-900/60 p-6 backdrop-blur-sm">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-dark-400">System Health</span>
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary-500/10 text-primary-400 border border-primary-500/20">
                  <Shield className="h-5 w-5" />
                </span>
              </div>
              <p className="mt-4 text-2xl font-bold text-emerald-400">Operational</p>
              <div className="mt-2 text-xs text-dark-400">All services connected</div>
            </div>
          </div>

          {/* Quick breakdown card */}
          <div className="rounded-2xl border border-dark-800 bg-dark-900/40 p-6 backdrop-blur-sm">
            <h2 className="text-lg font-bold text-white mb-4">Platform Security & Governance Summary</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="rounded-xl border border-dark-800 bg-dark-950 p-4">
                <div className="flex items-center space-x-3 text-primary-400 mb-2">
                  <Building2 className="h-5 w-5" />
                  <span className="font-semibold text-white">Employer Accounts</span>
                </div>
                <p className="text-2xl font-bold text-dark-100">{stats.totalEmployers}</p>
                <p className="text-xs text-dark-400 mt-1">Verified company posters</p>
              </div>

              <div className="rounded-xl border border-dark-800 bg-dark-950 p-4">
                <div className="flex items-center space-x-3 text-cyan-400 mb-2">
                  <GraduationCap className="h-5 w-5" />
                  <span className="font-semibold text-white">Candidate Profiles</span>
                </div>
                <p className="text-2xl font-bold text-dark-100">{stats.totalCandidates}</p>
                <p className="text-xs text-dark-400 mt-1">Registered job seekers</p>
              </div>

              <div className="rounded-xl border border-dark-800 bg-dark-950 p-4">
                <div className="flex items-center space-x-3 text-amber-400 mb-2">
                  <Shield className="h-5 w-5" />
                  <span className="font-semibold text-white">Moderation Enforcement</span>
                </div>
                <p className="text-2xl font-bold text-dark-100">Full Control</p>
                <p className="text-xs text-dark-400 mt-1">Instant deletion & account freeze</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Jobs Moderation Tab */}
      {activeTab === 'jobs' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3.5 top-3 h-4 w-4 text-dark-400" />
              <input
                type="text"
                placeholder="Search jobs by title, company, or location..."
                value={jobSearch}
                onChange={(e) => setJobSearch(e.target.value)}
                className="w-full rounded-xl border border-dark-800 bg-dark-900 py-2.5 pl-10 pr-4 text-sm text-white placeholder-dark-500 focus:border-primary-500 focus:outline-none"
              />
            </div>
            <span className="text-sm text-dark-400">
              Showing {filteredJobs.length} of {jobs.length} jobs
            </span>
          </div>

          <div className="overflow-hidden rounded-2xl border border-dark-800 bg-dark-900/50 backdrop-blur-sm">
            <table className="w-full text-left text-sm text-dark-300">
              <thead className="border-b border-dark-800 bg-dark-900 text-xs uppercase text-dark-400 font-semibold tracking-wider">
                <tr>
                  <th className="px-6 py-4">Job Title</th>
                  <th className="px-6 py-4">Posted By</th>
                  <th className="px-6 py-4">Location</th>
                  <th className="px-6 py-4">Salary Range</th>
                  <th className="px-6 py-4">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-dark-800">
                {filteredJobs.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-dark-400">
                      No jobs matched your search criteria.
                    </td>
                  </tr>
                ) : (
                  filteredJobs.map((job) => (
                    <tr key={job.id} className="hover:bg-dark-800/40 transition-colors">
                      <td className="px-6 py-4 font-semibold text-white">
                        {job.title}
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-medium text-dark-200">{job.employer?.fullName}</div>
                        <div className="text-xs text-dark-400">{job.employer?.companyName || job.employer?.username}</div>
                      </td>
                      <td className="px-6 py-4 text-dark-300">{job.location || 'Remote'}</td>
                      <td className="px-6 py-4 text-dark-300">{job.salaryRange || 'N/A'}</td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => handleDeleteJob(job.id)}
                          disabled={actionLoading === `job-${job.id}`}
                          className="flex items-center space-x-1.5 rounded-lg border border-rose-500/30 bg-rose-500/10 px-3 py-1.5 text-xs font-semibold text-rose-400 hover:bg-rose-500 hover:text-white transition-all disabled:opacity-50"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                          <span>Delete</span>
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Users Management Tab */}
      {activeTab === 'users' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3.5 top-3 h-4 w-4 text-dark-400" />
              <input
                type="text"
                placeholder="Search users by name, email, or role..."
                value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)}
                className="w-full rounded-xl border border-dark-800 bg-dark-900 py-2.5 pl-10 pr-4 text-sm text-white placeholder-dark-500 focus:border-primary-500 focus:outline-none"
              />
            </div>
            <span className="text-sm text-dark-400">
              Showing {filteredUsers.length} of {users.length} users
            </span>
          </div>

          <div className="overflow-hidden rounded-2xl border border-dark-800 bg-dark-900/50 backdrop-blur-sm">
            <table className="w-full text-left text-sm text-dark-300">
              <thead className="border-b border-dark-800 bg-dark-900 text-xs uppercase text-dark-400 font-semibold tracking-wider">
                <tr>
                  <th className="px-6 py-4">User</th>
                  <th className="px-6 py-4">Role</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-dark-800">
                {filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-8 text-center text-dark-400">
                      No users found matching your search.
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((u) => (
                    <tr key={u.id} className="hover:bg-dark-800/40 transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-semibold text-white">{u.fullName}</div>
                        <div className="text-xs text-dark-400">{u.username}</div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-bold uppercase tracking-wider ${
                          u.role === 'ADMIN'
                            ? 'bg-purple-500/10 text-purple-400 border border-purple-500/20'
                            : u.role === 'EMPLOYER'
                            ? 'bg-primary-500/10 text-primary-400 border border-primary-500/20'
                            : 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20'
                        }`}>
                          {u.role}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center space-x-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${
                          u.enabled !== false
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                            : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                        }`}>
                          <span className={`h-1.5 w-1.5 rounded-full ${u.enabled !== false ? 'bg-emerald-400' : 'bg-rose-400'}`} />
                          <span>{u.enabled !== false ? 'Active' : 'Blocked'}</span>
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => handleToggleUserStatus(u.id, u.enabled !== false)}
                            disabled={actionLoading === `user-${u.id}`}
                            className={`flex items-center space-x-1 rounded-lg border px-2.5 py-1 text-xs font-semibold transition-all ${
                              u.enabled !== false
                                ? 'border-amber-500/30 bg-amber-500/10 text-amber-400 hover:bg-amber-500 hover:text-white'
                                : 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500 hover:text-white'
                            }`}
                          >
                            {u.enabled !== false ? (
                              <>
                                <UserX className="h-3.5 w-3.5" />
                                <span>Block</span>
                              </>
                            ) : (
                              <>
                                <UserCheck className="h-3.5 w-3.5" />
                                <span>Unblock</span>
                              </>
                            )}
                          </button>

                          <button
                            onClick={() => handleDeleteUser(u.id)}
                            disabled={actionLoading === `user-del-${u.id}`}
                            className="flex items-center space-x-1 rounded-lg border border-rose-500/30 bg-rose-500/10 px-2.5 py-1 text-xs font-semibold text-rose-400 hover:bg-rose-500 hover:text-white transition-all"
                            title="Delete User"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
