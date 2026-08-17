import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import Modal from '../components/Modal';
import { 
  Building2, Trash2, Edit3, Briefcase, Mail, FileText, CheckCircle, 
  XCircle, Clock, Eye, ExternalLink, ChevronRight, Check, AlertCircle 
} from 'lucide-react';

export default function EmployerDashboard() {
  const [activeTab, setActiveTab] = useState('jobs'); // 'jobs' or 'applicants'
  const [myJobs, setMyJobs] = useState([]);
  const [applicants, setApplicants] = useState([]);
  const [loading, setLoading] = useState(true);

  // Edit Job State
  const [editingJob, setEditingJob] = useState(null);
  const [editTitle, setEditTitle] = useState('');
  const [editDesc, setEditDesc] = useState('');
  const [editReq, setEditReq] = useState('');
  const [editLoc, setEditLoc] = useState('');
  const [editSal, setEditSal] = useState('');
  const [editError, setEditError] = useState('');
  const [updatingJob, setUpdatingJob] = useState(false);

  // Applicant Detail State
  const [selectedApplicant, setSelectedApplicant] = useState(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [jobsRes, appsRes] = await Promise.all([
        api.get('/api/jobs/my-listings'),
        api.get('/api/applications/incoming')
      ]);
      setMyJobs(jobsRes.data);
      setApplicants(appsRes.data);
    } catch (error) {
      console.error('Failed to load dashboard data', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleDeleteJob = async (jobId) => {
    if (!window.confirm('Are you sure you want to delete this job listing? This will delete all associated applications.')) return;
    try {
      await api.delete(`/api/jobs/${jobId}`);
      setMyJobs(myJobs.filter(j => j.id !== jobId));
      setApplicants(applicants.filter(app => app.job.id !== jobId));
    } catch (error) {
      alert('Failed to delete job post');
    }
  };

  const handleEditClick = (job) => {
    setEditingJob(job);
    setEditTitle(job.title);
    setEditDesc(job.description);
    setEditReq(job.requirements || '');
    setEditLoc(job.location || '');
    setEditSal(job.salaryRange || '');
    setEditError('');
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setUpdatingJob(true);
    setEditError('');
    try {
      const response = await api.put(`/api/jobs/${editingJob.id}`, {
        title: editTitle,
        description: editDesc,
        requirements: editReq,
        location: editLoc,
        salaryRange: editSal
      });
      // Update local state
      setMyJobs(myJobs.map(j => j.id === editingJob.id ? response.data : j));
      setEditingJob(null);
    } catch (error) {
      setEditError(error.response?.data?.error || 'Failed to update job post');
    } finally {
      setUpdatingJob(false);
    }
  };

  const handleStatusUpdate = async (appId, newStatus) => {
    try {
      const response = await api.patch(`/api/applications/${appId}/status`, null, {
        params: { status: newStatus }
      });
      // Update in local state
      setApplicants(applicants.map(app => app.id === appId ? response.data : app));
      if (selectedApplicant && selectedApplicant.id === appId) {
        setSelectedApplicant(response.data);
      }
    } catch (error) {
      alert('Failed to update status: ' + (error.response?.data?.error || error.message));
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'PENDING':
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/10 border border-amber-500/20 px-2.5 py-1 text-xs font-semibold text-amber-400">
            <Clock className="h-3 w-3" /> Pending
          </span>
        );
      case 'UNDER_REVIEW':
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-blue-500/10 border border-blue-500/20 px-2.5 py-1 text-xs font-semibold text-blue-400">
            <Eye className="h-3 w-3" /> Under Review
          </span>
        );
      case 'SHORTLISTED':
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-purple-500/10 border border-purple-500/20 px-2.5 py-1 text-xs font-semibold text-purple-400">
            <CheckCircle className="h-3 w-3" /> Shortlisted
          </span>
        );
      case 'REJECTED':
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-rose-500/10 border border-rose-500/20 px-2.5 py-1 text-xs font-semibold text-rose-400">
            <XCircle className="h-3 w-3" /> Rejected
          </span>
        );
      case 'ACCEPTED':
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 text-xs font-semibold text-emerald-400">
            <CheckCircle className="h-3 w-3" /> Accepted
          </span>
        );
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-4rem)] gap-4">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-dark-700 border-t-primary-500"></div>
        <p className="text-sm text-dark-400">Loading Employer Dashboard...</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Dashboard Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between border-b border-dark-800 pb-6 mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">Employer Dashboard</h1>
          <p className="text-sm text-dark-400 mt-1">
            Manage your active listings and review incoming candidates.
          </p>
        </div>
        
        {/* Navigation Tabs */}
        <div className="flex bg-dark-900 border border-dark-800 p-1 rounded-xl">
          <button
            onClick={() => setActiveTab('jobs')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              activeTab === 'jobs' ? 'bg-primary-600 text-white' : 'text-dark-400 hover:text-white'
            }`}
          >
            My Listings ({myJobs.length})
          </button>
          <button
            onClick={() => setActiveTab('applicants')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              activeTab === 'applicants' ? 'bg-primary-600 text-white' : 'text-dark-400 hover:text-white'
            }`}
          >
            Applicants ({applicants.length})
          </button>
        </div>
      </div>

      {/* Tabs Content */}
      {activeTab === 'jobs' ? (
        myJobs.length === 0 ? (
          <div className="text-center py-16 bg-dark-900 border border-dark-800 rounded-2xl p-8">
            <Briefcase className="h-12 w-12 text-dark-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-white">No active listings</h3>
            <p className="text-sm text-dark-400 mt-1">Start hiring by posting your first job opportunity!</p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 animate-fade-in">
            {myJobs.map((job) => {
              const jobAppsCount = applicants.filter(app => app.job.id === job.id).length;
              return (
                <div key={job.id} className="bg-dark-900 border border-dark-800 rounded-2xl p-6 flex flex-col justify-between hover:border-dark-700 transition-colors">
                  <div>
                    <div className="flex justify-between items-start">
                      <span className="text-xs text-dark-400 uppercase tracking-wider font-semibold">
                        {job.location || 'Remote'}
                      </span>
                      <div className="flex gap-1.5">
                        <button
                          onClick={() => handleEditClick(job)}
                          className="p-1.5 rounded-lg text-dark-400 hover:bg-dark-800 hover:text-primary-400 transition-colors"
                          title="Edit Job"
                        >
                          <Edit3 className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteJob(job.id)}
                          className="p-1.5 rounded-lg text-dark-400 hover:bg-dark-800 hover:text-rose-400 transition-colors"
                          title="Delete Job"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                    
                    <h3 className="text-lg font-bold text-white mt-3">{job.title}</h3>
                    <p className="text-sm text-dark-400 mt-2 line-clamp-3 leading-relaxed">
                      {job.description}
                    </p>
                  </div>

                  <div className="border-t border-dark-800 mt-6 pt-4 flex items-center justify-between">
                    <span className="text-xs text-dark-400">
                      Posted on {new Date(job.createdAt).toLocaleDateString()}
                    </span>
                    <span className="rounded-full bg-primary-600/10 border border-primary-500/20 px-2.5 py-0.5 text-xs font-semibold text-primary-400">
                      {jobAppsCount} {jobAppsCount === 1 ? 'applicant' : 'applicants'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )
      ) : (
        applicants.length === 0 ? (
          <div className="text-center py-16 bg-dark-900 border border-dark-800 rounded-2xl p-8">
            <Mail className="h-12 w-12 text-dark-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-white">No applications yet</h3>
            <p className="text-sm text-dark-400 mt-1">Applications will appear here once candidates apply for your listings.</p>
          </div>
        ) : (
          <div className="bg-dark-900 border border-dark-800 rounded-2xl overflow-hidden animate-fade-in shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-dark-800 text-[11px] font-bold text-dark-300 uppercase tracking-wider bg-dark-950">
                    <th className="px-6 py-4">Applicant</th>
                    <th className="px-6 py-4">Opportunity</th>
                    <th className="px-6 py-4">Applied Date</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-dark-800 text-sm">
                  {applicants.map((app) => (
                    <tr key={app.id} className="hover:bg-dark-950/40 transition-colors">
                      <td className="px-6 py-4">
                        <div>
                          <div className="font-bold text-white">{app.candidate.fullName}</div>
                          <div className="text-xs text-dark-400">{app.candidate.title || 'Freelancer'}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-dark-200">
                        <div className="font-semibold">{app.job.title}</div>
                      </td>
                      <td className="px-6 py-4 text-dark-400">
                        {new Date(app.appliedAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4">
                        {getStatusBadge(app.status)}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => setSelectedApplicant(app)}
                          className="inline-flex items-center gap-1.5 rounded-lg border border-dark-800 bg-dark-900 px-3 py-1.5 text-xs font-semibold text-dark-300 hover:text-white hover:border-dark-700 transition-colors"
                        >
                          Review <ChevronRight className="h-3 w-3" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )
      )}

      {/* Edit Job Modal */}
      {editingJob && (
        <Modal
          isOpen={!!editingJob}
          onClose={() => setEditingJob(null)}
          title={`Edit: ${editingJob.title}`}
        >
          <form onSubmit={handleEditSubmit} className="space-y-4">
            {editError && (
              <div className="rounded-lg bg-rose-500/10 border border-rose-500/20 p-3 text-xs text-rose-400">
                {editError}
              </div>
            )}
            
            <div>
              <label className="block text-xs font-bold text-dark-300 uppercase tracking-wider mb-2">Job Title</label>
              <input
                type="text"
                required
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                className="w-full rounded-xl bg-dark-950 border border-dark-800 text-white placeholder-dark-500 px-4 py-3 text-sm focus:border-primary-500 focus:outline-none transition-colors"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-dark-300 uppercase tracking-wider mb-2">Location</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Remote, SF"
                  value={editLoc}
                  onChange={(e) => setEditLoc(e.target.value)}
                  className="w-full rounded-xl bg-dark-950 border border-dark-800 text-white placeholder-dark-500 px-4 py-3 text-sm focus:border-primary-500 focus:outline-none transition-colors"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-dark-300 uppercase tracking-wider mb-2">Salary Range</label>
                <input
                  type="text"
                  placeholder="e.g. $80k - $100k"
                  value={editSal}
                  onChange={(e) => setEditSal(e.target.value)}
                  className="w-full rounded-xl bg-dark-950 border border-dark-800 text-white placeholder-dark-500 px-4 py-3 text-sm focus:border-primary-500 focus:outline-none transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-dark-300 uppercase tracking-wider mb-2">Description</label>
              <textarea
                required
                rows={5}
                value={editDesc}
                onChange={(e) => setEditDesc(e.target.value)}
                className="w-full rounded-xl bg-dark-950 border border-dark-800 text-white placeholder-dark-500 px-4 py-3 text-sm focus:border-primary-500 focus:outline-none transition-colors resize-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-dark-300 uppercase tracking-wider mb-2">Requirements</label>
              <textarea
                rows={3}
                placeholder="List skills and background requirements..."
                value={editReq}
                onChange={(e) => setEditReq(e.target.value)}
                className="w-full rounded-xl bg-dark-950 border border-dark-800 text-white placeholder-dark-500 px-4 py-3 text-sm focus:border-primary-500 focus:outline-none transition-colors resize-none"
              />
            </div>

            <div className="flex gap-2 justify-end pt-4">
              <button
                type="button"
                onClick={() => setEditingJob(null)}
                className="rounded-xl border border-dark-800 bg-dark-900 px-4 py-2.5 text-sm font-semibold text-dark-300 hover:text-white"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={updatingJob}
                className="rounded-xl bg-primary-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-primary-500 disabled:opacity-50"
              >
                {updatingJob ? 'Saving Changes...' : 'Save Listings'}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Applicant Review Modal */}
      {selectedApplicant && (
        <Modal
          isOpen={!!selectedApplicant}
          onClose={() => setSelectedApplicant(null)}
          title="Review Candidate Application"
        >
          <div className="space-y-6">
            <div className="flex justify-between items-start">
              <div>
                <h2 className="text-xl font-bold text-white">{selectedApplicant.candidate.fullName}</h2>
                <p className="text-sm text-primary-400 mt-1 font-semibold">{selectedApplicant.candidate.title || 'Freelancer'}</p>
                <p className="text-xs text-dark-400 mt-0.5">{selectedApplicant.candidate.username}</p>
              </div>
              <div className="flex flex-col items-end gap-1.5">
                {getStatusBadge(selectedApplicant.status)}
                {selectedApplicant.candidate.resumeUrl && (
                  <a
                    href={selectedApplicant.candidate.resumeUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 text-xs text-primary-400 hover:text-primary-300 font-semibold"
                  >
                    Resume Link <ExternalLink className="h-3 w-3" />
                  </a>
                )}
              </div>
            </div>

            {selectedApplicant.candidate.skills && (
              <div>
                <h4 className="text-[10px] font-bold text-dark-300 uppercase tracking-wider mb-2">Skills Profile</h4>
                <div className="flex flex-wrap gap-1.5">
                  {selectedApplicant.candidate.skills.split(',').map((skill, idx) => (
                    <span key={idx} className="rounded bg-dark-950 border border-dark-800 px-2 py-0.5 text-xs text-dark-300 font-medium">
                      {skill.trim()}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div>
              <h4 className="text-[10px] font-bold text-dark-300 uppercase tracking-wider mb-2">Applied For</h4>
              <p className="text-sm font-bold text-white bg-dark-950 p-3.5 rounded-xl border border-dark-800">
                {selectedApplicant.job.title}
              </p>
            </div>

            <div>
              <h4 className="text-[10px] font-bold text-dark-300 uppercase tracking-wider mb-2">Cover Letter / Pitch</h4>
              <p className="text-sm text-dark-200 leading-relaxed whitespace-pre-line bg-dark-950 p-4 rounded-xl border border-dark-800">
                {selectedApplicant.coverLetter}
              </p>
            </div>

            {/* Actions for employer */}
            <div className="border-t border-dark-800 pt-4">
              <h4 className="text-[10px] font-bold text-dark-300 uppercase tracking-wider mb-3 text-center">Update Application Status</h4>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                <button
                  onClick={() => handleStatusUpdate(selectedApplicant.id, 'UNDER_REVIEW')}
                  className="rounded-xl border border-blue-500/20 bg-blue-500/5 py-2.5 text-xs font-semibold text-blue-400 hover:bg-blue-500 hover:text-white transition-colors"
                >
                  Under Review
                </button>
                <button
                  onClick={() => handleStatusUpdate(selectedApplicant.id, 'SHORTLISTED')}
                  className="rounded-xl border border-purple-500/20 bg-purple-500/5 py-2.5 text-xs font-semibold text-purple-400 hover:bg-purple-500 hover:text-white transition-colors"
                >
                  Shortlist
                </button>
                <button
                  onClick={() => handleStatusUpdate(selectedApplicant.id, 'ACCEPTED')}
                  className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 py-2.5 text-xs font-semibold text-emerald-400 hover:bg-emerald-500 hover:text-white transition-colors"
                >
                  Accept
                </button>
                <button
                  onClick={() => handleStatusUpdate(selectedApplicant.id, 'REJECTED')}
                  className="rounded-xl border border-rose-500/20 bg-rose-500/5 py-2.5 text-xs font-semibold text-rose-400 hover:bg-rose-500 hover:text-white transition-colors"
                >
                  Reject
                </button>
              </div>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
