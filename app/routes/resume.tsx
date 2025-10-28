import React, { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router';
import ATS from '~/components/ATS';
import Summary from '~/components/Summary';
import Details from '~/components/Details';
import { usePuterStore } from '~/lib/puter';


export const meta = () => ([
    { title: "Resumind - Review" },
    { name: "description", content: "Detailed overview of your resume" },
])

const resume = () => {
  const { auth, isLoading, fs, kv } = usePuterStore();
  const { id } = useParams();
  const [ imageUrl, setImageUrl ] = useState<string | null>(null);
  const [ resumeUrl, setResumeUrl ] = useState<string | null>(null);
  const [ feedback, setFeedback ] = useState<Feedback | null>(null);
  const navigate = useNavigate();
 
  useEffect(() => {
          if(!isLoading && !auth.isAuthenticated) navigate(`/auth?next=/resume${id}`);
  }, [isLoading]);


  useEffect(() => {
    const loadResume = async () => {
      console.log('📖 Loading resume with ID:', id);
      
      const resume = await kv.get(`resume-${id}`);
      console.log('📦 Resume data from KV:', resume);

      if(!resume) {
        console.warn('⚠️ Resume not found');
        return;
      }

      const data = JSON.parse(resume);
      console.log('✅ Parsed resume data:', data);

      const resumeBlob = await fs.read(data.resumePath);
      if(!resumeBlob) {
        console.warn('⚠️ Resume blob not found');
      } else {
        const pdfBlob = new Blob([resumeBlob], {type: 'application/pdf'});
        const resumeUrl = URL.createObjectURL(pdfBlob);
        setResumeUrl(resumeUrl);
        console.log('📄 PDF URL created:', resumeUrl);
      }

      const imageBlob = await fs.read(data.imagePath);
      if(!imageBlob) {
        console.warn('⚠️ Image blob not found');
      } else {
        const imageUrl = URL.createObjectURL(imageBlob);
        setImageUrl(imageUrl);
        console.log('🖼️ Image URL created:', imageUrl);
      }

      console.log('💬 Setting feedback:', data.feedback);
      setFeedback(data.feedback);
    }

    if (id && kv && fs) {
      loadResume();
    }
  }, [id, kv, fs]);
 
  return (
     <main className='pt-0!'>
        <nav className='resume-nav'>
          <Link to="/" className='back-button'>
            <img src="/icons/back.svg" alt="logo" className='w-2.5 h-2.5' />
            <span className='text-gray-800 text-sm font-semibold'>Back to homepage</span>
          </Link>
        </nav>
         <div className='flex flex-row w-full max-lg:flex-col-reverse'>
            {/* Feedback Section */}
            <section className="feedback-section bg-[url('/images/bg-small.svg')] bg-cover min-h-screen p-8 w-full lg:w-2/3">
                <h2 className='text-4xl font-bold text-gray-800 mb-8'>Resume Analysis</h2>
                {feedback ? 
                    <div className="flex flex-col gap-8 animate-in fade-in duration-1000">
                        <Summary feedback={feedback}/>
                        <ATS score={feedback.ATS?.score || 0} suggestions={feedback.ATS?.tips || []}/>
                        <Details feedback={feedback}/>
                    </div>
                 : (
                    <div className="flex flex-col items-center justify-center h-96">
                      <img src="/images/resume-scan-2.gif" className="w-64 mb-4" />
                      <p className="text-gray-600 text-lg">Analyzing your resume...</p>
                    </div>
                )}
            </section>

            {/* Resume Preview Section */}
            <aside className="w-full lg:w-1/3 bg-gray-100 p-8 sticky top-0 h-screen overflow-y-auto">
              <h3 className="text-2xl font-bold text-gray-800 mb-4">Resume Preview</h3>
              {imageUrl ? (
                <div className="gradient-border animate-in fade-in duration-1000">
                  <img 
                    src={imageUrl}
                    alt="resume preview"
                    className="w-full h-auto object-contain rounded-lg shadow-lg"
                  />
                  {resumeUrl && (
                    <a 
                      href={resumeUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="mt-4 w-full inline-block text-center primary-button"
                    >
                      <img src="/icons/info.svg" alt="view" className="w-4 h-4 inline mr-2" />
                      View Full PDF
                    </a>
                  )}
                </div>
              ) : (
                <div className="flex items-center justify-center h-96 bg-gray-200 rounded-lg">
                  <p className="text-gray-500">Loading preview...</p>
                </div>
              )}
            </aside>
         </div>
     </main>
  )
}

export default resume
