import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthProvider';
import api from '../utils/api';
import Modal from '../components/Modal';
import { Search, MapPin, DollarSign, Briefcase, Calendar, Building2, Sparkles, Send } from 'lucide-react';

export default function Home() {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTitle, setSearchTitle] = useState('');
  const [searchLocation, setSearchLocation] = useState('');
  
  // Selected job for detail modal
  const [selectedJob, setSelectedJob] = useState(null);
  
  // Application form state
  const [applyModalOpen, setApplyModalOpen] = useState(false);
  const [resumeUrl, setResumeUrl] = useState('');
  const [coverLetter, setCoverLetter] = useState('');
  const [applying, setApplying] = useState(false);
  const [appSuccess, setAppSuccess] = useState('');
  const [appError, setAppError] = useState('');

  const fetchJobs = async (title = '', location = '') => {
    setLoading(true);
    try {
      const response = await api.get('/api/jobs/public/search', {
        params: { title, location }
      });
      setJobs(response.data);
    } catch (error) {
      console.error('Failed to fetch jobs', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchJobs(searchTitle, searchLocation);
  };

  const handleApplyClick = () => {
    if (!user) {
      navigate('/login');
      return;
    }
    setAppSuccess('');
    setAppError('');
    setApplyModalOpen(true);
  };

  const handleApplySubmit = async (e) => {
    e.preventDefault();
    setApplying(true);
    setAppSuccess('');
    setAppError('');
    try {
      await api.post(`/api/applications/apply/${selectedJob.id}`, {
        resumeUrl,
        coverLetter
      });
      setAppSuccess('Your application has been submitted successfully!');
      setResumeUrl('');
      setCoverLetter('');
      // Close modal after delay
      setTimeout(() => {
        setApplyModalOpen(false);
        setSelectedJob(null);
      }, 2000);
    } catch (error) {
      setAppError(error.response?.data?.error || 'Failed to submit application. Have you already applied?');
    } finally {
      setApplying(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Just now';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  return (
    <div className="hero-gradient min-h-[calc(100vh-4rem)] pb-12">
      {/* Hero Header */}
      <div className="mx-auto max-w-7xl px-4 pt-16 sm:px-6 lg:px-8 text-center">
        <div className="inline-flex items-center space-x-2 rounded-full border border-primary-500/30 bg-primary-600/5 px-3 py-1 text-xs font-semibold text-primary-400 mb-6">
          <Sparkles className="h-3.5 w-3.5" />
          <span>The Next Gen Freelance & Job Network</span>
        </div>
        
        <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-6xl max-w-3xl mx-auto leading-tight">
          Find your dream gig. <br />
          <span className="bg-gradient-to-r from-primary-400 to-indigo-300 bg-clip-text text-transparent">
            Hire unmatched talent.
          </span>
        </h1>
        <p className="mt-6 text-lg text-dark-300 max-w-xl mx-auto leading-relaxed">
          SkillHub connects elite candidate developers and designers with forward-thinking companies. Seamless, role-driven, real-time tracking.
        </p>

        {/* Search Bar */}
        <form 
          onSubmit={handleSearchSubmit} 
          className="mt-10 mx-auto max-w-4xl glass-panel p-2 rounded-2xl flex flex-col md:flex-row gap-2 shadow-2xl border-dark-800"
        >
          <div className="flex-1 flex items-center px-3 gap-2">
            <Search className="h-5 w-5 text-dark-400" />
            <input
              type="text"
              placeholder="Job Title, Skills, Keywords..."
              value={searchTitle}
              onChange={(e) => setSearchTitle(e.target.value)}
              className="w-full bg-transparent border-0 text-white placeholder-dark-400 focus:ring-0 focus:outline-none py-2 text-sm"
            />
          </div>
          <div className="hidden md:block w-[1px] bg-dark-800 self-stretch my-2"></div>
          <div className="flex-1 flex items-center px-3 gap-2">
            <MapPin className="h-5 w-5 text-dark-400" />
            <input
              type="text"
              placeholder="City, State or Remote..."
              value={searchLocation}
              onChange={(e) => setSearchLocation(e.target.value)}
              className="w-full bg-transparent border-0 text-white placeholder-dark-400 focus:ring-0 focus:outline-none py-2 text-sm"
            />
          </div>
          <button
            type="submit"
            className="w-full md:w-auto rounded-xl bg-primary-600 px-6 py-3 text-sm font-semibold text-white hover:bg-primary-500 hover:shadow-lg hover:shadow-primary-500/20 transition-all duration-200"
          >
            Find Jobs
          </button>
        </form>
      </div>

      {/* Main listings section */}
      <div className="mx-auto max-w-7xl px-4 mt-16 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between border-b border-dark-800 pb-4 mb-6">
          <h2 className="text-xl font-bold text-white tracking-wide">
            Available Opportunities ({jobs.length})
          </h2>
          <span className="text-xs text-dark-400">Showing recent listings</span>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-dark-700 border-t-primary-500"></div>
            <p className="text-sm text-dark-400">Loading listings...</p>
          </div>
        ) : jobs.length === 0 ? (
          <div className="text-center py-20 rounded-2xl bg-dark-900 border border-dark-800 p-8">
            <Building2 className="h-12 w-12 text-dark-500 mx-auto mb-4" />
            <p className="text-lg font-semibold text-white">No jobs found</p>
            <p className="text-sm text-dark-400 mt-1">Try expanding your search criteria or filter keywords.</p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {jobs.map((job) => (
              <div
                key={job.id}
                onClick={() => setSelectedJob(job)}
                className="group relative cursor-pointer rounded-2xl bg-dark-900 border border-dark-800 p-6 transition-all duration-300 hover:border-primary-500/40 hover:-translate-y-1 hover:shadow-xl hover:shadow-primary-950/10 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between">
                    <span className="rounded-full bg-primary-600/10 border border-primary-500/20 px-2.5 py-1 text-[11px] font-semibold text-primary-400">
                      {job.location || 'Remote'}
                    </span>
                    <span className="text-xs text-dark-400 flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {formatDate(job.createdAt)}
                    </span>
                  </div>

                  <h3 className="text-lg font-bold text-white mt-4 group-hover:text-primary-400 transition-colors">
                    {job.title}
                  </h3>

                  <div className="flex items-center gap-1 text-sm text-dark-300 mt-2 font-medium">
                    <Building2 className="h-4 w-4 text-dark-400" />
                    <span>{job.employer?.companyName || 'SkillHub Client'}</span>
                  </div>

                  <p className="text-sm text-dark-400 mt-4 line-clamp-3 leading-relaxed">
                    {job.description}
                  </p>
                </div>

                <div className="border-t border-dark-800 mt-6 pt-4 flex items-center justify-between">
                  <div className="flex items-center text-primary-400 font-semibold text-sm">
                    <DollarSign className="h-4 w-4" />
                    <span>{job.salaryRange || 'Unspecified'}</span>
                  </div>
                  <span className="text-xs font-semibold text-primary-400 group-hover:translate-x-1 transition-transform flex items-center gap-1">
                    Details
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Job Details Modal */}
      {selectedJob && (
        <Modal
          isOpen={!!selectedJob}
          onClose={() => {
            setSelectedJob(null);
            setApplyModalOpen(false);
          }}
          title="Job Listing Details"
        >
          <div className="space-y-6">
            <div>
              <span className="rounded-full bg-primary-600/10 border border-primary-500/20 px-2.5 py-1 text-xs font-semibold text-primary-400">
                {selectedJob.location || 'Remote'}
              </span>
              <h2 className="text-2xl font-extrabold text-white mt-3">{selectedJob.title}</h2>
              <div className="flex items-center gap-2 text-dark-300 mt-2">
                <Building2 className="h-4.5 w-4.5 text-primary-400" />
                <span className="font-semibold">{selectedJob.employer?.companyName || 'SkillHub Client'}</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 border-y border-dark-800 py-4 text-sm">
              <div className="flex items-center gap-2 text-dark-200">
                <DollarSign className="h-5 w-5 text-primary-400" />
                <div>
                  <div className="text-[10px] text-dark-400 uppercase tracking-wider font-semibold">Compensation</div>
                  <div className="font-bold text-white">{selectedJob.salaryRange || 'Unspecified'}</div>
                </div>
              </div>
              <div className="flex items-center gap-2 text-dark-200">
                <MapPin className="h-5 w-5 text-primary-400" />
                <div>
                  <div className="text-[10px] text-dark-400 uppercase tracking-wider font-semibold">Location</div>
                  <div className="font-bold text-white">{selectedJob.location || 'Remote'}</div>
                </div>
              </div>
            </div>

            <div>
              <h4 className="text-xs font-bold text-dark-300 uppercase tracking-wider mb-2">Description</h4>
              <p className="text-sm text-dark-200 leading-relaxed whitespace-pre-line bg-dark-950 p-4 rounded-xl border border-dark-800">
                {selectedJob.description}
              </p>
            </div>

            {selectedJob.requirements && (
              <div>
                <h4 className="text-xs font-bold text-dark-300 uppercase tracking-wider mb-2">Requirements</h4>
                <p className="text-sm text-dark-200 leading-relaxed whitespace-pre-line bg-dark-950 p-4 rounded-xl border border-dark-800">
                  {selectedJob.requirements}
                </p>
              </div>
            )}

            {/* Application CTAs */}
            <div className="pt-2">
              {(!user || user.role === 'CANDIDATE') && !applyModalOpen && (
                <button
                  onClick={handleApplyClick}
                  className="w-full flex items-center justify-center gap-2 rounded-xl bg-primary-600 px-4 py-3.5 text-sm font-semibold text-white shadow-lg shadow-primary-600/20 hover:bg-primary-500 hover:shadow-primary-500/30 transition-all"
                >
                  <Send className="h-4.5 w-4.5" />
                  <span>Apply For This Opportunity</span>
                </button>
              )}

              {user?.role === 'EMPLOYER' && (
                <p className="text-center text-xs text-dark-400 italic">
                  Posting owned by {selectedJob.employer.fullName} ({selectedJob.employer.username}). Manage in dashboard.
                </p>
              )}

              {/* Submit Application Form */}
              {applyModalOpen && (
                <form onSubmit={handleApplySubmit} className="space-y-4 border-t border-dark-800 pt-6 mt-6">
                  <h3 className="text-base font-bold text-white">Apply for {selectedJob.title}</h3>
                  
                  {appError && (
                    <div className="rounded-lg bg-rose-500/10 border border-rose-500/20 p-3 text-xs text-rose-400">
                      {appError}
                    </div>
                  )}
                  {appSuccess && (
                    <div className="rounded-lg bg-emerald-500/10 border border-emerald-500/20 p-3 text-xs text-emerald-400">
                      {appSuccess}
                    </div>
                  )}

                  <div>
                    <label className="block text-xs font-bold text-dark-300 uppercase tracking-wider mb-2">
                      Resume URL (e.g. Google Drive/Dropbox)
                    </label>
                    <input
                      type="url"
                      required
                      placeholder="https://drive.google.com/..."
                      value={resumeUrl}
                      onChange={(e) => setResumeUrl(e.target.value)}
                      className="w-full rounded-xl bg-dark-950 border border-dark-800 text-white placeholder-dark-500 px-4 py-3 text-sm focus:border-primary-500 focus:outline-none transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-dark-300 uppercase tracking-wider mb-2">
                      Cover Letter / pitch
                    </label>
                    <textarea
                      required
                      rows={4}
                      placeholder="Explain why you are the best fit for this position..."
                      value={coverLetter}
                      onChange={(e) => setCoverLetter(e.target.value)}
                      className="w-full rounded-xl bg-dark-950 border border-dark-800 text-white placeholder-dark-500 px-4 py-3 text-sm focus:border-primary-500 focus:outline-none transition-colors resize-none"
                    />
                  </div>

                  <div className="flex gap-2 justify-end pt-2">
                    <button
                      type="button"
                      onClick={() => setApplyModalOpen(false)}
                      className="rounded-xl border border-dark-800 bg-dark-900 px-4 py-2.5 text-sm font-semibold text-dark-300 hover:text-white"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={applying || !!appSuccess}
                      className="rounded-xl bg-primary-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-primary-500 disabled:opacity-50 flex items-center gap-2"
                    >
                      {applying ? 'Submitting...' : 'Submit Application'}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
