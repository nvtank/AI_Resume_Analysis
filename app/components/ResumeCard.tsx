import React from 'react'
import { Link } from 'react-router'
import ScoreCircle from './ScoreCricle'

const ResumeCard = ({ resume:{ id, companyName, jobTitle, feedback, imagePath } }: { resume: Resume }) => {
  return (
    <Link to={`/resume/${id}`} className='resume-card  h-full animate-in fade-in duration-1000'>
      <div className='resume-card-header h-full'>
          <div className='flex flex-col gap-2'>
            <h2 className='font-bold wrap-break-words'>
                {companyName}
            </h2>
            <h3 className='text-lg wrap-break-words text-gray-500'>
                {jobTitle}
            </h3>
        </div>
        <div className='shrink-0'>
            <ScoreCircle score={feedback.overallScore} />
        </div>
      </div>
      <div className='gradient-border h-full animate-in fade-in duration-1000'>
        <div className='w-full h-full'>
            <img
                src={imagePath}
                alt="resume"
                className='w-full h-[500px] md:h-[550px] max-sm:h-[350px] object-cover'
            />
        </div>
      </div>
    </Link>
  )
}
    
export default ResumeCard