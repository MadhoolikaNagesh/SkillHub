import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { Briefcase, MapPin, DollarSign, ArrowLeft, Send } from 'lucide-react';

export default function PostJob() {
  const navigate = useNavigate();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [requirements, setRequirements] = useState('');
  const [location, setLocation] = useState('');
  const [salaryRange, setSalaryRange] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    try {
      await api.post('/api/jobs', {
        title,
        description,
        requirements,
        location,
        salaryRange
      });
      navigate('/employer');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to post job listing.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Back Button */}
      <button
        onClick={() => navigate('/employer')}
        className="flex items-center gap-1.5 text-xs font-semibold text-dark-400 hover:text-white mb-6 transition-colors"
      >
        <ArrowLeft className="h-4 w-4" /> Back to Dashboard
      </button>

      <div className="bg-dark-900 border border-dark-800 rounded-3xl p-8 shadow-2xl relative">
        <div className="mb-6">
          <h1 className="text-2xl font-extrabold text-white tracking-tight">Create Job Opportunity</h1>
          <p className="text-sm text-dark-400 mt-1">
            Describe the position, compensation, and qualifications to attract premium talent.
          </p>
        </div>

        {error && (
          <div className="rounded-xl bg-rose-500/10 border border-rose-500/20 p-4 text-xs text-rose-400 mb-6">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-xs font-bold text-dark-300 uppercase tracking-wider mb-2">
              Job Title
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-dark-400">
                <Briefcase className="h-4 w-4" />
              </span>
              <input
                type="text"
                required
                placeholder="e.g. Senior Backend Engineer (Spring Boot)"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full rounded-xl bg-dark-950 border border-dark-800 text-white placeholder-dark-500 pl-10 pr-4 py-3 text-sm focus:border-primary-500 focus:outline-none transition-colors"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-bold text-dark-300 uppercase tracking-wider mb-2">
                Location
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-dark-400">
                  <MapPin className="h-4 w-4" />
                </span>
                <input
                  type="text"
                  required
                  placeholder="e.g. Remote, San Francisco, CA"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full rounded-xl bg-dark-950 border border-dark-800 text-white placeholder-dark-500 pl-10 pr-4 py-3 text-sm focus:border-primary-500 focus:outline-none transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-dark-300 uppercase tracking-wider mb-2">
                Salary Range / Budget
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-dark-400">
                  <DollarSign className="h-4 w-4" />
                </span>
                <input
                  type="text"
                  placeholder="e.g. $100k - $120k / Year or $80/hr"
                  value={salaryRange}
                  onChange={(e) => setSalaryRange(e.target.value)}
                  className="w-full rounded-xl bg-dark-950 border border-dark-800 text-white placeholder-dark-500 pl-10 pr-4 py-3 text-sm focus:border-primary-500 focus:outline-none transition-colors"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-dark-300 uppercase tracking-wider mb-2">
              Job Description
            </label>
            <textarea
              required
              rows={6}
              placeholder="Outline the responsibilities, project scope, and daily tasks..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full rounded-xl bg-dark-950 border border-dark-800 text-white placeholder-dark-500 px-4 py-3 text-sm focus:border-primary-500 focus:outline-none transition-colors resize-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-dark-300 uppercase tracking-wider mb-2">
              Required Skills & Experience
            </label>
            <textarea
              rows={4}
              placeholder="Detail required tech stack, education, or years of experience..."
              value={requirements}
              onChange={(e) => setRequirements(e.target.value)}
              className="w-full rounded-xl bg-dark-950 border border-dark-800 text-white placeholder-dark-500 px-4 py-3 text-sm focus:border-primary-500 focus:outline-none transition-colors resize-none"
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full flex items-center justify-center gap-2 rounded-xl bg-primary-600 px-4 py-3.5 text-sm font-semibold text-white shadow-lg shadow-primary-600/10 hover:bg-primary-500 hover:shadow-primary-500/20 disabled:opacity-50 transition-all pt-2.5"
          >
            <Send className="h-4.5 w-4.5" />
            <span>{submitting ? 'Creating listing...' : 'Publish Job Listing'}</span>
          </button>
        </form>
      </div>
    </div>
  );
}
