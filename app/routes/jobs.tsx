import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import type { Route } from "./+types/jobs";
import { fetchJobs, type ExternalJob } from '~/lib/jobs-api';
import { usePuterStore } from '~/lib/puter';

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Jobs - Resumind" },
    { name: "description", content: "Job listings from RapidAPI" },
  ];
}

const JobsPage: React.FC = () => {
  const { auth, isLoading } = usePuterStore();
  const navigate = useNavigate();
  const [jobs, setJobs] = useState<ExternalJob[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (!isLoading && !auth.isAuthenticated) {
      navigate('/auth?next=/jobs');
    }
  }, [isLoading, auth.isAuthenticated, navigate]);

  const loadJobs = async (query: string) => {
    try {
      setLoading(true);
      setError(null);
      const jobsData = await fetchJobs(query);
      setJobs(jobsData);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (auth.isAuthenticated && searchQuery) {
      loadJobs(searchQuery);
    }
  }, [auth.isAuthenticated]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    loadJobs(searchQuery);
  };

  if (isLoading || !auth.isAuthenticated) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <p className="text-gray-600">Loading...</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-white to-gray-50">
      <section className="max-w-6xl mx-auto px-6 py-16">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-4 text-gray-900">Job search</h1>
          <p className="text-gray-600 mb-6">
            Explore thousands of job opportunities from top companies
          </p>

          <form onSubmit={handleSearch} className="flex gap-3">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Enter position, skills or company..."
              className="flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-gray-800 focus:border-transparent"
            />
            <button
              type="submit"
              disabled={loading}
              className="px-8 py-3 bg-gray-900 text-white rounded-xl font-semibold hover:bg-gray-800 transition disabled:opacity-50"
            >
              {loading ? 'Loading...' : 'Search'}
            </button>
          </form>
        </div>

        {loading && (
          <div className="text-center py-12">
            <div className="inline-block w-8 h-8 border-4 border-gray-300 border-t-gray-900 rounded-full animate-spin"></div>
            <p className="text-gray-600 mt-4">Loading job listings...</p>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
            <p className="text-red-600">Error: {error}</p>
          </div>
        )}

        {!loading && !error && jobs.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-600">
              {searchQuery ? "No job listings found. Try searching with different keywords." : "Enter a keyword to search for jobs."}
            </p>
          </div>
        )}

        {!loading && jobs.length > 0 && (
          <div className="mb-4 text-gray-600">
            Found <strong>{jobs.length}</strong> job listings
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {jobs.map((job) => (
            <article
              key={job.id}
              className="bg-white rounded-xl shadow-md border border-gray-200 p-6 hover:shadow-lg transition-shadow"
            >
              <div className="flex justify-between items-start mb-3">
                <h2 className="text-xl font-semibold text-gray-900 flex-1 pr-4">
                  {job.title}
                </h2>
                {job.employmentType && (
                  <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full whitespace-nowrap">
                    {job.employmentType}
                  </span>
                )}
              </div>

              <p className="text-base text-gray-700 font-medium mb-2">{job.company}</p>
              
              {job.location && (
                <p className="text-sm text-gray-500 mb-3 flex items-center gap-1">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  {job.location}
                </p>
              )}

              {job.description && (
                <p className="text-sm text-gray-600 line-clamp-3 mb-4">
                  {job.description}
                </p>
              )}

              <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
                {job.datePosted && (
                  <span className="text-xs text-gray-400">
                    {new Date(job.datePosted).toLocaleDateString('vi-VN')}
                  </span>
                )}
                {job.url && (
                  <a
                    href={job.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-sm font-semibold text-indigo-600 hover:text-indigo-700"
                  >
                    See details
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                  </a>
                )}
              </div>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
};

export default JobsPage;
