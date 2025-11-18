/* CLEAN BLACK & WHITE PROFILE — NEW DESIGN */

import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { usePuterStore } from '~/lib/puter';
import type { Route } from './+types/profile';

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Profile - Resumind" },
    { name: "description", content: "User profile" },
  ];
}

interface UserStats {
  totalResumes: number;
  averageScore: number;
  bestScore: number;
  lastActivity: string;
  improvementTrend: number;
}

export default function Profile() {
  const { auth, kv, isLoading } = usePuterStore();
  const navigate = useNavigate();

  const [stats, setStats] = useState<UserStats>({
    totalResumes: 0,
    averageScore: 0,
    bestScore: 0,
    lastActivity: "Never",
    improvementTrend: 0
  });

  const [loadingStats, setLoadingStats] = useState(true);

  useEffect(() => {
    if (!isLoading && !auth.isAuthenticated) {
      navigate("/auth?next=/profile");
    }
  }, [isLoading, auth.isAuthenticated]);

  // load stats
  useEffect(() => {
    const load = async () => {
      if (!auth.isAuthenticated) return;
      setLoadingStats(true);

      try {
        const resumes = (await kv.list("resume-*", true)) as any[];

        if (resumes.length > 0) {
          const parsed = resumes.map(r => JSON.parse(r.value));
          const scores = parsed.map(r => r.feedback?.overallScore || 0).filter((s: number) => s > 0);

          setStats({
            totalResumes: resumes.length,
            averageScore: scores.length ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0,
            bestScore: scores.length ? Math.max(...scores) : 0,
            lastActivity: new Date().toLocaleDateString(),
            improvementTrend: resumes.length > 1 ? 5 : 0
          });
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoadingStats(false);
      }
    };

    load();
  }, [auth.isAuthenticated]);

  const handleLogout = async () => {
    await auth.signOut();
    navigate("/auth");
  };

  if (isLoading || !auth.isAuthenticated) {
    return (
      <main className="min-h-screen flex items-center justify-center text-gray-600">
        Loading...
      </main>
    );
  }
return (
  <main
    className="min-h-screen bg-gradient-to-br from-white via-gray-50 to-gray-100 text-gray-900 px-4 py-20"
  >
    <div className="max-w-6xl mx-auto space-y-16">

      {/* HEADER */}
      <section className="bg-white/70 backdrop-blur-xl shadow-sm border border-gray-200 rounded-3xl p-12">
        <div className="flex flex-col md:flex-row items-center gap-10">

          <div className="w-32 h-32 rounded-full bg-gray-100 border border-gray-300 flex items-center justify-center text-5xl font-bold tracking-tight">
            {auth.user?.username?.charAt(0).toUpperCase()}
          </div>

          <div className="flex-1 text-center md:text-left space-y-3">
            <h1 className="text-4xl font-extrabold tracking-tight">
              {auth.user?.username}
            </h1>
            <p className="text-gray-600">
              Member since 2024 · ID: {auth.user?.uuid?.slice(0, 8)}...
            </p>
          </div>
        </div>
      </section>

      {/* STATS */}
      <section className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          { 
            label: "Total Resumes", 
            value: stats.totalResumes, 
            icon: (
              <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            )
          },
          { 
            label: "Average Score", 
            value: stats.averageScore + "%", 
            icon: (
              <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            )
          },
          { 
            label: "Best Score", 
            value: stats.bestScore + "%", 
            icon: (
              <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
              </svg>
            )
          },
          { 
            label: "Last Activity", 
            value: stats.lastActivity, 
            icon: (
              <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            )
          }
        ].map((s, i) => (
          <div
            key={i}
            className="bg-white/60 backdrop-blur-lg border border-gray-200 shadow-sm rounded-2xl p-8 flex flex-col items-center gap-3 transition hover:shadow-lg hover:scale-[1.02]"
          >
            <div className="text-4xl text-gray-700">{s.icon}</div>
            <div className="text-3xl font-semibold">
              {loadingStats ? "..." : s.value}
            </div>
            <div className="text-gray-500 text-sm">{s.label}</div>
          </div>
        ))}
      </section>

      {/* QUICK ACTIONS */}
      <section className="bg-white border border-gray-200 rounded-3xl shadow-sm p-12">
        <h2 className="text-2xl font-bold mb-10">Quick Actions</h2>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[
            { 
              label: "Dashboard", 
              icon: (
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
              ),
              onClick: () => navigate("/") 
            },
            { 
              label: "New Analysis", 
              icon: (
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              ),
              onClick: () => navigate("/analyze-cv") 
            },
            { 
              label: "Export", 
              icon: (
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
              ),
              onClick: () => console.log("export") 
            },
            { 
              label: "Progress", 
              icon: (
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              ),
              onClick: () => console.log("progress") 
            }
          ].map((btn, i) => (
            <button
              key={i}
              onClick={btn.onClick}
              className="bg-gray-50 border border-gray-200 rounded-2xl py-8 px-6 text-center 
                hover:bg-gray-900 hover:text-white transition-all duration-200 shadow-sm"
            >
              <div className="text-3xl mb-3">{btn.icon}</div>
              <p className="font-semibold">{btn.label}</p>
            </button>
          ))}
        </div>
      </section>

      {/* SECURITY */}
      <section className="bg-white border border-gray-200 rounded-3xl shadow-sm p-12">
        <h2 className="text-2xl font-bold mb-10">Security</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <button
            onClick={handleLogout}
            className="flex items-center justify-center gap-3 bg-gray-50 border border-gray-200 rounded-2xl p-6
              hover:bg-red-500 hover:text-white transition-all duration-200 shadow-sm"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            Logout
          </button>

          <button
            onClick={() => navigate("/wipe")}
            className="flex items-center justify-center gap-3 bg-gray-50 border border-gray-200 rounded-2xl p-6
              hover:bg-black hover:text-white transition-all duration-200 shadow-sm"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
            Delete All Data
          </button>
        </div>
      </section>

      {/* INFO BOXES */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-8">

        <div className="bg-white border border-gray-200 shadow-sm rounded-3xl p-10 space-y-4">
          <svg className="w-10 h-10 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
          </svg>
          <h3 className="text-xl font-bold">Data Security</h3>
          <p className="text-gray-600 leading-relaxed">
            Your resume data is encrypted and securely stored.  
            No tracking, no sharing — your privacy is our priority.
          </p>
        </div>

        <div className="bg-white border border-gray-200 shadow-sm rounded-3xl p-10 space-y-4">
          <svg className="w-10 h-10 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h3 className="text-xl font-bold">Account Details</h3>
          <p className="text-gray-600">Username: {auth.user?.username}</p>
          <p className="text-gray-600">User ID: {auth.user?.uuid}</p>
          <p className="text-gray-600">Resumes: {stats.totalResumes}</p>
        </div>

      </section>

    </div>
  </main>
);
}