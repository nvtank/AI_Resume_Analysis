import React, { useEffect } from 'react'
import { Link, useNavigate, useParams } from 'react-router';
import ATS from '~/components/resume/ATS';
import Summary from '~/components/resume/Summary';
import Details from '~/components/resume/Details';
import CoverLetterGenerator from '~/components/features/CoverLetterGenerator';
import GeneralCoverLetterGenerator from '~/components/features/GeneralCoverLetterGenerator';
import ResumeChat from '~/components/features/ResumeChat';
import JobMatchAnalysis from '~/components/resume/JobMatchAnalysis';
import CandidateInfoCard from '~/components/resume/CandidateInfoCard';
import { usePuterStore } from '~/lib/puter';
import { useResumeData } from '~/hooks/useResumeData';
import { useJobSuggestions } from '~/hooks/useJobSuggestions';
import { COVER_LETTER_PROMPT, RESUME_CHAT_PROMPT } from '~/lib/prompts';

export const meta = () => ([
    { title: "Resumind - Review" },
    { name: "description", content: "Detailed overview of your resume" },
])

const Resume = () => {
  const { auth, isLoading: isAuthLoading, ai } = usePuterStore();
  const { id } = useParams();
  const navigate = useNavigate();

  // Custom Hooks
  const { resumeData, resumeUrl, imageUrl, feedback, resumeText, isLoading: isResumeLoading, error: resumeError } = useResumeData(id);
  const { suggestedJobs, isSuggesting, suggestJobs } = useJobSuggestions();

  // Authentication Check
  useEffect(() => {
    if(!isAuthLoading && !auth.isAuthenticated) navigate(`/auth?next=/resume${id}`);
  }, [isAuthLoading, auth.isAuthenticated, navigate, id]);

  // Handlers
  const handleSuggestJobs = () => suggestJobs(feedback);

  const handleGenerateCoverLetter = async (
    companyName: string,
    jobTitle: string,
    jobDescription: string
  ): Promise<string> => {
    if (!feedback) throw new Error('Feedback chưa sẵn sàng');

    const candidateName = feedback.candidateInfo?.name || '[Your Name]';
    const candidateEmail = feedback.candidateInfo?.email || '[Your Email]';
    const candidatePhone = feedback.candidateInfo?.phone || '[Your Phone]';
    const currentTitle = feedback.candidateInfo?.currentTitle || '';

    let matchedSkills = '';
    let missingSkills = '';
    
    if (feedback.jobMatch) {
      matchedSkills = feedback.jobMatch.matchingSkills.map(s => `${s.skill} (${s.evidence})`).join(', ');
      missingSkills = feedback.jobMatch.missingSkills
        .filter(s => s.importance === 'critical' || s.importance === 'important')
        .map(s => s.skill).join(', ');
    } else {
      matchedSkills = feedback.skills.tips.filter(t => t.type === 'good').map(t => t.tip).join(', ');
      missingSkills = feedback.skills.tips.filter(t => t.type === 'improve').map(t => t.tip).join(', ');
    }

    const prompt = COVER_LETTER_PROMPT(
      candidateName, candidateEmail, candidatePhone, currentTitle,
      companyName, jobTitle, jobDescription,
      feedback.matchScore, matchedSkills, missingSkills,
      feedback.jobMatch?.overallAssessment, feedback.overallScore, feedback.ATS.score
    );

    const response = await ai.chat(prompt);
    if (!response) throw new Error('AI không trả về phản hồi');

    return typeof response.message.content === 'string'
      ? response.message.content
      : response.message.content[0]?.text || '';
  };

  const handleChatMessage = async (userMessage: string, context: string): Promise<string> => {
    const prompt = RESUME_CHAT_PROMPT(context, resumeText, userMessage);
    const response = await ai.chat(prompt);
    if (!response) throw new Error('AI không trả về phản hồi');

    return typeof response.message.content === 'string'
      ? response.message.content
      : response.message.content[0]?.text || '';
  };

  if (isResumeLoading) {
     return (
        <div className="flex flex-col items-center justify-center min-h-screen">
          <img src="/images/resume-scan-2.gif" className="w-64 mb-4" alt="Loading" />
          <p className="text-gray-600 text-lg">Loading your resume...</p>
        </div>
     );
  }

  if (resumeError) {
      return (
          <div className="flex flex-col items-center justify-center min-h-screen">
              <h1 className="text-2xl font-bold text-red-600">Error</h1>
              <p className="text-gray-600">{resumeError}</p>
              <Link to="/" className="mt-4 text-blue-600 hover:underline">Go back home</Link>
          </div>
      )
  }

  return (
     <main className='pt-0!'>
        <nav className='resume-nav'>
          <Link to="/" className='back-button'>
            <img src="/icons/back.svg" alt="logo" className='w-2.5 h-2.5' />
            <span className='text-gray-800 text-sm font-semibold'>Back to homepage</span>
          </Link>
        </nav>
         <div className='flex flex-row w-full max-lg:flex-col-reverse'>
            <section className="feedback-section bg-[url('/images/bg-small.svg')] bg-cover min-h-screen p-8 w-full lg:w-2/3">
                <h2 className='text-4xl font-bold text-gray-800 mb-8'>Resume Analysis</h2>
                {!resumeData?.jobTitle && (
                  <div className="my-8 p-4 bg-white rounded-lg shadow-md border border-gray-200 animate-in fade-in duration-700">
                    <h3 className="text-2xl font-bold text-gray-800 mb-4">Gợi ý Việc làm</h3>
                    <button 
                      onClick={handleSuggestJobs} 
                      disabled={isSuggesting || !feedback}
                      className="primary-button disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isSuggesting ? "Đang tìm kiếm..." : "Tìm việc làm phù hợp"}
                    </button>
                    
                    {isSuggesting && (
                      <p className="text-gray-600 mt-4">Đang phân tích CV và Job, vui lòng đợi...</p>
                    )}

                    {suggestedJobs.length > 0 && (
                      <div className="mt-4 space-y-3">
                        <h4 className="font-semibold text-lg">Kết quả phù hợp nhất:</h4>
                        {suggestedJobs.map(job => (
                          <div key={job.id} className="p-4 bg-gray-50 rounded-lg border border-gray-200 hover:shadow-md transition">
                            <div className="flex justify-between items-start mb-2">
                              <p className="font-bold text-blue-600 text-lg">{job.title}</p>
                              {job.employmentType && (
                                <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
                                  {job.employmentType}
                                </span>
                              )}
                            </div>
                            <p className="text-sm text-gray-700 font-medium">{job.company}</p>
                            {job.location && (
                              <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                </svg>
                                {job.location}
                              </p>
                            )}
                            {job.description && (
                              <p className="text-sm text-gray-600 mt-2 line-clamp-2">{job.description}</p>
                            )}
                            {job.url && (
                              <a 
                                href={job.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="mt-3 inline-flex items-center gap-2 text-sm font-semibold text-indigo-600 hover:text-indigo-700"
                              >
                                Xem chi tiết & Apply
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                </svg>
                              </a>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {feedback ? 
                    <div className="flex flex-col gap-8 animate-in fade-in duration-1000">
                        {feedback.candidateInfo && (
                          <CandidateInfoCard candidateInfo={feedback.candidateInfo} />
                        )}
                        
                        <Summary feedback={feedback}/>
                        
                        {feedback.jobMatch && resumeData && (
                          <JobMatchAnalysis
                            jobMatch={feedback.jobMatch}
                            matchScore={feedback.matchScore}
                            jobTitle={resumeData.jobTitle}
                            companyName={resumeData.companyName}
                          />
                        )}
                        
                        <ATS score={feedback.ATS?.score || 0} suggestions={feedback.ATS?.tips || []}/>
                        
                        {resumeData && resumeData.jobTitle ? (
                          <CoverLetterGenerator
                            feedback={feedback}
                            resumeData={resumeData}
                            onGenerate={handleGenerateCoverLetter}
                          />
                        ) : (
                          <GeneralCoverLetterGenerator
                            feedback={feedback}
                            onGenerate={handleGenerateCoverLetter}
                          />
                        )}
                        
                        <Details feedback={feedback}/>
                    </div>
                 : (
                    <div className="flex flex-col items-center justify-center h-96">
                      <img src="/images/resume-scan-2.gif" className="w-64 mb-4" />
                      <p className="text-gray-600 text-lg">Analyzing your resume...</p>
                    </div>
                )}
            </section>

            <aside className="w-full lg:w-1/3 bg-gray-100 p-8 sticky top-0 h-screen overflow-y-auto">
              
              {resumeData?.jobTitle && (
                <div className='mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg'>
                  <p className='text-sm font-semibold text-blue-800'>Job Matching Analysis:</p>
                  <p className='text-lg font-bold text-blue-900'>{resumeData.jobTitle}</p>
                </div>
              )}

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
                      className="mt-4 w-full inline-block text-center primary-button font-bold">
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

         {feedback && resumeData && (
           <ResumeChat
             resumeData={resumeData}
             feedback={feedback}
             onSendMessage={handleChatMessage}
           />
         )}
     </main>
  )
}

export default Resume