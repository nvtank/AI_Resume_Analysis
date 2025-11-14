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
  const { auth, isLoading, fs, kv, ai } = usePuterStore();
  const { id } = useParams();
  const [ imageUrl, setImageUrl ] = useState<string | null>(null);
  const [ resumeUrl, setResumeUrl ] = useState<string | null>(null);

  const [ feedback, setFeedback ] = useState<Feedback | null>(null);
  const navigate = useNavigate();
 

  const [isSuggesting, setIsSuggesting] = useState(false);
  const [suggestedJobs, setSuggestedJobs] = useState<Job[]>([]);

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
 

  const handleSuggestJobs = async () => {
    if (!feedback) {
      alert("Data feedback not available yet.");
      return;
    }
    
    setIsSuggesting(true);
    setSuggestedJobs([]);

    try {
      // get all jobs from KV
      const jobItems = (await kv.list("job:*", true)) as KVItem[];
      if (!jobItems || jobItems.length === 0) {
        alert("No jobs available in the system.");
        setIsSuggesting(false);
        return;
      }
      
      const allJobs = jobItems.map(({ key, value }): Job => {
        const id = key.split(":")[1];
        return { id, ...JSON.parse(value) };
      });

      // prompt construction
      const cvSummary = ((feedback as any)?.summary?.overall) || ((feedback as any)?.overall) || ((feedback as any)?.summaryText) || "No summary";
      const cvSkills = (feedback.skills?.tips?.map((tip: any) => tip.tip).join(', ')) || "No skills";

      const prompt = `
        You are an AI recruiting expert.
        Here is the summary and skills of a candidate:
        ---CV---
        Summary: ${cvSummary}
        Skills: ${cvSkills}
        ---

        Here is the list of available job openings:
        ---JOBS---
        ${JSON.stringify(allJobs)}
        ---

        Based on the candidate's CV, please find the 3 most suitable job openings.
        Please respond with a JSON array containing only the IDs of those 3 jobs.
        For example: ["job-id-1", "job-id-2", "job-id-3"]
      `;

      const response = await ai.chat(prompt);
      if (!response) {
        throw new Error("AI not responding");
      }
      const content = typeof response.message.content === 'string' 
        ? response.message.content 
        : response.message.content[0]?.text || '';

      // result parsing
      const jsonMatch = content.match(/\[.*?\]/);
      if (jsonMatch) {
        const suggestedIds = JSON.parse(jsonMatch[0]) as string[];
        const matchedJobs = allJobs.filter(job => suggestedIds.includes(job.id));
        setSuggestedJobs(matchedJobs);
      } else {
        throw new Error("AI not returning valid JSON format: " + content);
      }

    } catch (err) {
      console.error(err);
      alert("Error suggesting jobs: " + (err as Error).message);
    } finally {
      setIsSuggesting(false);
    }
  };


  // Bắt đầu phần JSX return
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

                {/* === KHỐI GỢI Ý JOB MỚI === */}
                <div className="my-8 p-4 bg-white rounded-lg shadow-md border border-gray-200 animate-in fade-in duration-700">
                  <h3 className="text-2xl font-bold text-gray-800 mb-4">Gợi ý Việc làm</h3>
                  <button 
                    onClick={handleSuggestJobs} 
                    disabled={isSuggesting || !feedback} // Disable khi đang
                    className="primary-button disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSuggesting ? "Đang tìm kiếm..." : "Tìm việc làm phù hợp"}
                  </button>
                  
                  {isSuggesting && (
                    <p className="text-gray-600 mt-4">Đang phân tích CV và Job, vui lòng đợi...</p>
                  )}

                  {suggestedJobs.length > 0 && (
                    <div className="mt-4 space-y-2">
                      <h4 className="font-semibold">Kết quả phù hợp nhất:</h4>
                      {/* 'job' có kiểu 'Job' global */}
                      {suggestedJobs.map(job => (
                        <div key={job.id} className="p-3 bg-gray-50 rounded border border-gray-200">
                          <p className="font-bold text-blue-600">{job.title}</p>
                          <p className="text-sm text-gray-700">{job.company}</p>
                          <p className="text-sm text-gray-500 mt-1 line-clamp-2">{job.description}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                {/* === KẾT THÚC KHỐI GỢI Ý JOB === */}


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