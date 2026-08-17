import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../utils/api';
import { 
  Briefcase, Building2, Calendar, FileText, Clock, Eye, CheckCircle, XCircle 
} from 'lucide-react';

export default function CandidateDashboard() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchApplications = async () => {
    setLoading(true);
    try {
      const response = await api.get('/api/applications/my-applications');
      setApplications(response.data);
    } catch (error) {
      console.error('Failed to load candidate applications', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, []);

  const getStatusBadge = (status) => {
    switch (status) {
      case 'PENDING':
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/10 border border-amber-500/20 px-2.5 py-1 text-xs font-semibold text-amber-400">
            <Clock className="h-3 w-3" /> Pending Review
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
            <XCircle className="h-3 w-3" /> Application Rejected
          </span>
        );
      case 'ACCEPTED':
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 text-xs font-semibold text-emerald-400">
            <CheckCircle className="h-3 w-3" /> Offer Accepted
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
        <p className="text-sm text-dark-400">Loading your applications...</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="border-b border-dark-800 pb-6 mb-8">
        <h1 className="text-3xl font-extrabold text-white tracking-tight">Candidate Dashboard</h1>
        <p className="text-sm text-dark-400 mt-1">
          Track the status and history of your submitted applications.
        </p>
      </div>

      {applications.length === 0 ? (
        <div className="text-center py-16 bg-dark-900 border border-dark-800 rounded-2xl p-8 shadow-xl">
          <Briefcase className="h-12 w-12 text-dark-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-white">No applications submitted</h3>
          <p className="text-sm text-dark-400 mt-1">Explore available listings and start applying for contracts.</p>
          <div className="mt-6">
            <Link
              to="/"
              className="inline-flex items-center justify-center rounded-xl bg-primary-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-primary-500 transition-colors"
            >
              Explore Jobs
            </Link>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {applications.map((app) => (
            <div 
              key={app.id} 
              className="bg-dark-900 border border-dark-800 rounded-2xl p-6 hover:border-dark-700 transition-colors shadow-lg"
            >
              <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                <div>
                  <h3 className="text-xl font-bold text-white">{app.job.title}</h3>
                  <div className="flex items-center gap-2 text-sm text-dark-300 mt-2 font-medium">
                    <Building2 className="h-4.5 w-4.5 text-primary-400" />
                    <span>{app.job.employer?.companyName || 'SkillHub Client'}</span>
                  </div>
                  <div className="flex items-center gap-4 text-xs text-dark-400 mt-4">
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3.5 w-3.5" />
                      Applied on {new Date(app.appliedAt).toLocaleDateString()}
                    </span>
                    {app.resumeUrl && (
                      <a
                        href={app.resumeUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-primary-400 hover:text-primary-350 font-semibold"
                      >
                        Submitted Resume
                      </a>
                    )}
                  </div>
                </div>

                <div className="flex flex-col items-start md:items-end justify-between self-stretch gap-4 md:gap-0">
                  {getStatusBadge(app.status)}
                </div>
              </div>

              {/* Cover Letter Section */}
              <div className="mt-6 border-t border-dark-800 pt-4 bg-dark-950/40 p-4 rounded-xl">
                <h4 className="flex items-center gap-1.5 text-xs font-bold text-dark-300 uppercase tracking-wider mb-2">
                  <FileText className="h-3.5 w-3.5 text-primary-400" /> Cover Letter
                </h4>
                <p className="text-sm text-dark-200 leading-relaxed whitespace-pre-line">
                  {app.coverLetter}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
