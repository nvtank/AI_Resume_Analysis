import React, { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router'
import ScoreCircle from './ScoreCricle'
import { usePuterStore } from '~/lib/puter';

const ResumeCard = ({ resume:{ id, companyName, jobTitle, feedback, imagePath } }: { resume: Resume }) => {

   const { fs } = usePuterStore();
   const [resumeUrl, setResumeUrl] = useState<string | null>(null);


    useEffect(() => {
      const loadResumes = async () => {
        const blob = await fs.read(imagePath);
        if(!blob) return;
        let url = URL.createObjectURL(blob);
        setResumeUrl(url);
      }
  
      loadResumes();
    }, [imagePath]);
  return (
    <Link to={`/resume/${id}`} className='resume-card  h-full animate-in fade-in duration-1000'>
      <div className='resume-card-header h-full'>
          <div className='flex flex-col gap-2'>
            {companyName && <h2 className='font-bold wrap-break-words'>
                {companyName}
            </h2>}
            {jobTitle && <h3 className='text-lg wrap-break-words text-gray-500'>
                {jobTitle}
            </h3>}
            {!companyName && !jobTitle && <h2 className='text-black! font-bold wrap-break-words'>
                 Resume
            </h2>}
        </div>
        <div className='shrink-0'>
            <ScoreCircle score={feedback.overallScore} />
        </div>
      </div>
      {resumeUrl && (
         <div className='gradient-border h-full animate-in fade-in duration-1000'>
            <div className='w-full h-full'>
                <img
                    src={resumeUrl}
                    alt="resume"
                    className='w-full h-[500px] md:h-[550px] max-sm:h-[350px] object-cover'
                />
            </div>
      </div>
      )}
    </Link>
  )
}
    
export default ResumeCard