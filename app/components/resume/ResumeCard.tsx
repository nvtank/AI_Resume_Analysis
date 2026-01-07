import React, { useEffect, useState } from "react";
import { Link } from "react-router";
import ScoreCircle from "../ui/ScoreCircle";
import { usePuterStore } from "~/lib/puter";
import { FaTrash } from "react-icons/fa6";

const ResumeCard = ({
  resume: { id, companyName, jobTitle, feedback, imagePath },
  onDelete,
}: {
  resume: Resume;
  onDelete: (id: string) => void;
}) => {
  const { fs } = usePuterStore();
  const [resumeUrl, setResumeUrl] = useState<string | null>(null);

  useEffect(() => {
    const loadResumes = async () => {
      const blob = await fs.read(imagePath);
      if (!blob) return;
      const url = URL.createObjectURL(blob);
      setResumeUrl(url);
    };
    loadResumes();
  }, [imagePath]);

  const handleDelete = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (confirm("Are you sure you want to delete this resume?")) {
      onDelete(id);
    }
  };

  return (
    <Link
      to={`/resume/${id}`}
      className="
        group resume-card flex flex-col
        bg-white border border-[var(--color-border)] rounded-3xl
        overflow-hidden shadow-sm hover:shadow-xl hover:translate-y-[-4px]
        transition-all duration-300 h-full
      "
    >
      <div className="flex items-center justify-between px-6 py-5 border-b border-[var(--color-border)] bg-gray-50/50">
        <div className="flex flex-col gap-1">
          {companyName ? (
            <h2 className="font-bold text-xl text-[var(--color-text-primary)] group-hover:underline decoration-1 underline-offset-4 transition">
              {companyName}
            </h2>
          ) : (
            <h2 className="font-bold text-xl text-[var(--color-text-primary)]">
              Resume
            </h2>
          )}

          {jobTitle && (
            <h3 className="text-[var(--color-text-secondary)] text-sm font-medium">
              {jobTitle}
            </h3>
          )}
        </div>

        <div className="shrink-0 flex items-center gap-3">
          <ScoreCircle score={feedback.overallScore} />
             <button
            onClick={handleDelete}
            className="p-2 cursor-pointer text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors"
            title="Delete Resume"
          >
            <FaTrash size={16} />
          </button>
        </div>
      </div>

      <div className="relative flex-1 bg-gray-100 p-4">
        {resumeUrl ? (
          <div className="relative h-full w-full overflow-hidden rounded-xl border border-[var(--color-border)] shadow-inner bg-white">
            <img
              src={resumeUrl}
              alt="resume"
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
            {/* Overlay */}
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors duration-300"></div>
          </div>
        ) : (
             <div className="h-full w-full flex items-center justify-center text-gray-400">
                 Loading preview...
             </div>
        )}
      </div>
    </Link>
  );
};

export default ResumeCard;

