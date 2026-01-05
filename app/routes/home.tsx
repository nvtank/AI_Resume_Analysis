import type { Route } from "./+types/home";
import ResumeCard from "~/components/resume/ResumeCard";
import { usePuterStore } from "~/lib/puter";
import { useNavigate } from "react-router";
import { useEffect, useState } from "react";
import { Button } from "~/components/ui/Button"; // Use new Button
import { FaPlus } from "react-icons/fa6"; // Use react-icons

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Resumind" },
    { name: "description", content: "Smart feedback for your dream job" },
  ];
}

// Loading Skeleton Component
const ResumeSkeleton = () => (
  <div className="resume-card h-full animate-pulse border border-[var(--color-border)]">
    <div className="resume-card-header h-full border-b border-[var(--color-border)]">
      <div className="flex flex-col gap-2 flex-1">
        <div className="h-6 bg-gray-100 rounded w-3/4"></div>
        <div className="h-4 bg-gray-50 rounded w-1/2"></div>
      </div>
      <div className="shrink-0 w-16 h-16 bg-gray-100 rounded-full"></div>
    </div>
    <div className="p-4 h-full">
      <div className="w-full h-[300px] bg-gray-50 rounded-2xl animate-pulse"></div>
    </div>
  </div>
);

export default function Home() {
  const { auth, kv } = usePuterStore();
  const navigate = useNavigate();
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [loadingResume, setLoadingResume] = useState<boolean>(true);

  useEffect(() => {
    if (!auth.isAuthenticated) navigate("/auth?next=/");
  }, [auth.isAuthenticated]);

  useEffect(() => {
    const loadResumes = async () => {
      setLoadingResume(true);
      try {
        const resumes = (await kv.list("resume-*", true)) as KVItem[];
        const paredResumes = resumes
          .map(({ value }) => JSON.parse(value) as Resume)
          .sort((a, b) => {
            // Sort by score descending
            return (
              (b.feedback?.overallScore || 0) - (a.feedback?.overallScore || 0)
            );
          });

        console.log("paredResumes", paredResumes);
        setResumes(paredResumes);
      } catch (error) {
        console.error("Error loading resumes:", error);
      } finally {
        setLoadingResume(false);
      }
    };

    loadResumes();
  }, []);

  const getAverageScore = () => {
    if (resumes.length === 0) return 0;
    const total = resumes.reduce(
      (sum, resume) => sum + (resume.feedback?.overallScore || 0),
      0
    );
    return Math.round(total / resumes.length);
  };

  const getBestScore = () => {
    if (resumes.length === 0) return 0;
    return Math.max(...resumes.map((r) => r.feedback?.overallScore || 0));
  };

  return (
    <main className="min-h-screen mb-12 bg-[var(--color-bg-primary)]">
      <section className="main-section">
        <div className="page-heading py-10 md:py-16 px-4 md:px-0">
          <h1 className="animate-fade-in text-[var(--color-text-primary)] mb-4">
            Welcome to Resumind
          </h1>
          <h2 className="animate-fade-in text-[var(--color-text-secondary)] font-normal pb-8">
            Your AI-powered resume analysis tool
          </h2>

          {!loadingResume && resumes.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 mt-8 w-full max-w-4xl animate-fade-in">
              <div className="bg-white rounded-2xl p-6 md:p-8 shadow-sm border border-[var(--color-border)] flex flex-col items-center justify-center gap-2 hover:shadow-md transition-shadow">
                <div className="text-[var(--color-text-secondary)] text-sm font-medium uppercase tracking-wider">
                  Total Resumes
                </div>
                <div className="text-5xl font-bold text-[var(--color-text-primary)]">
                  {resumes.length}
                </div>
              </div>
              <div className="bg-white rounded-2xl p-6 md:p-8 shadow-sm border border-[var(--color-border)] flex flex-col items-center justify-center gap-2 hover:shadow-md transition-shadow">
                <div className="text-[var(--color-text-secondary)] text-sm font-medium uppercase tracking-wider">
                  Average Score
                </div>
                <div className="text-5xl font-bold text-[var(--color-text-primary)]">
                  {getAverageScore()}
                  <span className="text-2xl text-[var(--color-text-secondary)] align-top ml-1">
                    %
                  </span>
                </div>
              </div>
              <div className="bg-white rounded-2xl p-6 md:p-8 shadow-sm border border-[var(--color-border)] flex flex-col items-center justify-center gap-2 hover:shadow-md transition-shadow">
                <div className="text-[var(--color-text-secondary)] text-sm font-medium uppercase tracking-wider">
                  Best Score
                </div>
                <div className="text-5xl font-bold text-[var(--color-text-primary)]">
                  {getBestScore()}
                  <span className="text-2xl text-[var(--color-text-secondary)] align-top ml-1">
                    %
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        {loadingResume && (
          <div className="resumes-section">
            {[1, 2, 3].map((i) => (
              <div key={i}>
                <ResumeSkeleton />
              </div>
            ))}
          </div>
        )}

        {!loadingResume && resumes.length === 0 && (
          <div className="flex flex-col items-center justify-center py-10 md:py-20 animate-fade-in w-full px-4">
            <div className="bg-white rounded-3xl p-8 md:p-16 shadow-lg border border-[var(--color-border)] text-center max-w-lg w-full">
              <div className="w-20 h-20 mx-auto mb-8 bg-[var(--color-bg-secondary)] rounded-full flex items-center justify-center">
                <FaPlus className="w-8 h-8 text-[var(--color-text-secondary)]" />
              </div>
              <h3 className="text-2xl font-bold text-[var(--color-text-primary)] mb-4">
                No Resumes Yet
              </h3>
              <p className="text-[var(--color-text-secondary)] mb-8 leading-relaxed">
                Start analyzing your resumes to see them here. It takes just a few seconds.
              </p>
              <Button onClick={() => navigate("/match-jd")}>
                Upload Your First Resume
              </Button>
            </div>
          </div>
        )}

        {!loadingResume && resumes.length > 0 && (
          <div className="flex flex-col w-full items-center gap-8">
             <div className="w-full flex justify-end max-w-[1400px] px-6">
                <Button onClick={() => navigate("/match-jd")} variant="secondary" className="gap-2">
                   <FaPlus /> New Analysis
                </Button>
             </div>
            <div className="resumes-section">
              {resumes.map((resume, index) => (
                <div
                  key={resume.id}
                  className="animate-fade-in"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <ResumeCard resume={resume} />
                </div>
              ))}
            </div>
          </div>
        )}
      </section>
    </main>
  );
}

