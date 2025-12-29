import React, { useEffect, useState } from 'react'
import { Link } from 'react-router'
import ScoreCircle from '../ui/ScoreCircle'
import { usePuterStore } from '~/lib/puter'

const ResumeCard = ({ resume:{ id, companyName, jobTitle, feedback, imagePath } }: { resume: Resume }) => {
  const { fs } = usePuterStore()
  const [resumeUrl, setResumeUrl] = useState<string | null>(null)

  useEffect(() => {
    const loadResumes = async () => {
      const blob = await fs.read(imagePath)
      if (!blob) return
      const url = URL.createObjectURL(blob)
      setResumeUrl(url)
    }
    loadResumes()
  }, [imagePath])

  return (
    <Link 
      to={`/resume/${id}`} 
      className="
        group resume-card
        bg-white/20 backdrop-blur-xl border border-white/30 rounded-2xl
        overflow-hidden shadow-lg hover:shadow-2xl
        transition-all duration-300 h-full hover:scale-[1.015]
      "
    >
      <div className="flex items-center justify-between px-6 py-4 border-b border-white/20">
        <div>
          {companyName ? (
            <h2 className="font-bold text-xl text-gray-900 group-hover:text-blue-600 transition">
              {companyName}
            </h2>
          ) : (
            <h2 className="font-bold text-xl">Resume</h2>
          )}

          {jobTitle && (
            <h3 className="text-gray-600 mt-1 text-sm">{jobTitle}</h3>
          )}
        </div>

        <div>
          <ScoreCircle score={feedback.overallScore} />
        </div>
      </div>

      {resumeUrl && (
        <div className="relative">
          <div className="absolute inset-0 h-full opacity-0 group-hover:opacity-100 transition"></div>
          <img 
            src={resumeUrl}
            alt="resume"
            className="w-full h-full object-cover"
          />
        </div>
      )}
    </Link>
  )
}

export default ResumeCard
