/* CLEAN BLACK & WHITE PROFILE — NEW DESIGN */

import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { usePuterStore } from '~/lib/puter';
import type { Route } from './+types/profile';
import { 
  FaFileLines, 
  FaChartSimple, 
  FaAward, 
  FaClock, 
  FaHouse, 
  FaPlus, 
  FaDownload, 
  FaArrowTrendUp, 
  FaRightFromBracket, 
  FaTrash, 
  FaShieldHalved, 
  FaCircleInfo 
} from "react-icons/fa6";

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
            icon: <FaFileLines className="w-10 h-10" />
          },
          { 
            label: "Average Score", 
            value: stats.averageScore + "%", 
            icon: <FaChartSimple className="w-10 h-10" />
          },
          { 
            label: "Best Score", 
            value: stats.bestScore + "%", 
            icon: <FaAward className="w-10 h-10" />
          },
          { 
            label: "Last Activity", 
            value: stats.lastActivity, 
            icon: <FaClock className="w-10 h-10" />
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
              icon: <FaHouse className="w-8 h-8" />,
              onClick: () => navigate("/") 
            },
            { 
              label: "New Analysis", 
              icon: <FaPlus className="w-8 h-8" />,
              onClick: () => navigate("/analyze-cv") 
            },
            { 
              label: "Export", 
              icon: <FaDownload className="w-8 h-8" />,
              onClick: () => console.log("export") 
            },
            { 
              label: "Progress", 
              icon: <FaArrowTrendUp className="w-8 h-8" />,
              onClick: () => console.log("progress") 
            }
          ].map((btn, i) => (
            <button
              key={i}
              onClick={btn.onClick}
              className="bg-gray-50 border border-gray-200 rounded-2xl py-8 px-6 text-center 
                hover:bg-gray-900 hover:text-white transition-all duration-200 shadow-sm flex flex-col items-center justify-center group"
            >
              <div className="text-3xl mb-3 text-gray-700 group-hover:text-white transition-colors">{btn.icon}</div>
              <div className="font-semibold text-gray-700 group-hover:text-white transition-colors">{btn.label}</div>
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
              hover:bg-red-500 hover:text-white transition-all duration-200 shadow-sm group"
          >
            <FaRightFromBracket className="w-6 h-6 text-gray-700 group-hover:text-white transition-colors" />
            Logout
          </button>

          <button
            onClick={() => navigate("/wipe")}
            className="flex items-center justify-center gap-3 bg-gray-50 border border-gray-200 rounded-2xl p-6
              hover:bg-black hover:text-white transition-all duration-200 shadow-sm group"
          >
            <FaTrash className="w-6 h-6 text-gray-700 group-hover:text-white transition-colors" />
            Delete All Data
          </button>
        </div>
      </section>

      {/* INFO BOXES */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-8">

        <div className="bg-white border border-gray-200 shadow-sm rounded-3xl p-10 space-y-4">
          <FaShieldHalved className="w-10 h-10 text-gray-700" />
          <h3 className="text-xl font-bold">Data Security</h3>
          <p className="text-gray-600 leading-relaxed">
            Your resume data is encrypted and securely stored.  
            No tracking, no sharing — your privacy is our priority.
          </p>
        </div>

        <div className="bg-white border border-gray-200 shadow-sm rounded-3xl p-10 space-y-4">
          <FaCircleInfo className="w-10 h-10 text-gray-700" />
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