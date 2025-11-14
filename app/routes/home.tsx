import Navbar from "~/components/Navbar";
import type { Route } from "./+types/Home";
import ResumeCard from "~/components/ResumeCard";
import { usePuterStore } from "~/lib/puter";
import {  useNavigate } from "react-router";
import { useEffect, useState } from "react";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Resumind" },
    { name: "description", content: "Smart feedback for your dream job" },
  ];
}

// Loading Skeleton Component
const ResumeSkeleton = () => (
  <div className="resume-card h-full animate-pulse">
    <div className="resume-card-header h-full">
      <div className="flex flex-col gap-2 flex-1">
        <div className="h-6 bg-gray-300 rounded w-3/4"></div>
        <div className="h-4 bg-gray-200 rounded w-1/2"></div>
      </div>
      <div className="shrink-0 w-16 h-16 bg-gray-300 rounded-full"></div>
    </div>
    <div className="gradient-border h-full">
      <div className="w-full h-[500px] md:h-[550px] max-sm:h-[350px] bg-gray-200 animate-pulse"></div>
    </div>
  </div>
);

export default function Home() {
  const { auth, kv } = usePuterStore();
  const navigate = useNavigate();
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [loadingResume, setLoadingResume] = useState<boolean>(true);
  
  useEffect(() => {
    if (!auth.isAuthenticated) navigate('/auth?next=/');
      }, [auth.isAuthenticated]);

  useEffect(() => { 
    const loadResumes = async () => {
      setLoadingResume(true);
      try {
        const resumes = (await kv.list('resume-*', true)) as KVItem[];
        const paredResumes = resumes.map(({ value }) => (
          JSON.parse(value) as Resume
        )).sort((a, b) => {
          // Sort by score descending
          return (b.feedback?.overallScore || 0) - (a.feedback?.overallScore || 0);
        });

        console.log('paredResumes', paredResumes);
        setResumes(paredResumes);
      } catch (error) {
        console.error('Error loading resumes:', error);
      } finally {
        setLoadingResume(false);
      }
    }

    loadResumes();
  },[]);

  const getAverageScore = () => {
    if (resumes.length === 0) return 0;
    const total = resumes.reduce((sum, resume) => sum + (resume.feedback?.overallScore || 0), 0);
    return Math.round(total / resumes.length);
  };

  const getBestScore = () => {
    if (resumes.length === 0) return 0;
    return Math.max(...resumes.map(r => r.feedback?.overallScore || 0));
  };

  return (
    <main className="bg-[url('/images/bg-main.svg')] bg-cover min-h-screen">
      <Navbar />

      <section className="main-section">
        <div className="page-heading py-16">
          <h1 className="animate-in fade-in slide-in-from-bottom-4 duration-700">Welcome to Resumind</h1>
          <h2 className="animate-in fade-in slide-in-from-bottom-4 duration-700 delay-100">Your AI-powered resume analysis tool</h2>
          
          {/* Stats Section */}
          {!loadingResume && resumes.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-200">
              <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-gray-200">
                <div className="text-gray-600 text-sm font-medium mb-2">Total Resumes</div>
                <div className="text-4xl font-bold text-blue-600">{resumes.length}</div>
              </div>
              <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-gray-200">
                <div className="text-gray-600 text-sm font-medium mb-2">Average Score</div>
                <div className="text-4xl font-bold text-green-600">{getAverageScore()}%</div>
              </div>
              <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-gray-200">
                <div className="text-gray-600 text-sm font-medium mb-2">Best Score</div>
                <div className="text-4xl font-bold text-purple-600">{getBestScore()}%</div>
              </div>
            </div>
          )}
        </div>

        {/* Loading State */}
        {loadingResume && (
          <div className="resumes-section">
            {[1, 2, 3].map((i) => (
              <div key={i}>
                <ResumeSkeleton />
              </div>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!loadingResume && resumes.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 animate-in fade-in duration-700">
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-12 shadow-xl border border-gray-200 text-center max-w-md">
              <svg className="w-24 h-24 mx-auto mb-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <h3 className="text-2xl font-bold text-gray-800 mb-3">No Resumes Yet</h3>
              <p className="text-gray-600 mb-6">Start analyzing your resumes to see them here</p>
              <button 
                onClick={() => navigate('/upload')}
                className="primary-button"
              >
                Upload Your First Resume
              </button>
            </div>
          </div>
        )}
        
        {!loadingResume && resumes.length > 0 && (
          <div className="resumes-section">
            {resumes.map((resume, index) => (
              <div 
                key={resume.id} 
                className="animate-in fade-in slide-in-from-bottom-4 duration-700"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <ResumeCard resume={resume} />
              </div>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
