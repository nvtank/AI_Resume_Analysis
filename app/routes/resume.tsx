import React, { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router';
import ATS from '~/components/ATS';
import Summary from '~/components/Summary';
import Details from '~/components/Details';
import CoverLetterGenerator from '~/components/CoverLetterGenerator';
import GeneralCoverLetterGenerator from '~/components/GeneralCoverLetterGenerator';
import ResumeChat from '~/components/ResumeChat';
import JobMatchAnalysis from '~/components/JobMatchAnalysis';
import CandidateInfoCard from '~/components/CandidateInfoCard';
import { usePuterStore } from '~/lib/puter';
import { fetchJobs, type ExternalJob } from '~/lib/jobs-api';

export const meta = () => ([
    { title: "Resumind - Review" },
    { name: "description", content: "Detailed overview of your resume" },
])

const Resume = () => {
  // Lấy 'ai' từ store để dùng cho tính năng gợi ý
  const { auth, isLoading, fs, kv, ai } = usePuterStore();
  const { id } = useParams();
  const [ imageUrl, setImageUrl ] = useState<string | null>(null);
  const [ resumeUrl, setResumeUrl ] = useState<string | null>(null);
  const [ feedback, setFeedback ] = useState<Feedback | null>(null);
  
  // State mới để lưu toàn bộ dữ liệu resume (bao gồm cả jobTitle nếu có)
  const [ resumeData, setResumeData ] = useState<Resume | null>(null); 
  
  const navigate = useNavigate();
 
  // State cho tính năng gợi ý Job từ RapidAPI
  const [isSuggesting, setIsSuggesting] = useState(false);
  const [suggestedJobs, setSuggestedJobs] = useState<ExternalJob[]>([]);

  // State cho tính năng Resume Text (để chat)
  const [resumeText, setResumeText] = useState<string>('');

  // useEffect để kiểm tra xác thực
  useEffect(() => {
    if(!isLoading && !auth.isAuthenticated) navigate(`/auth?next=/resume${id}`);
  }, [isLoading, auth.isAuthenticated, navigate]);


  // useEffect để tải dữ liệu resume
  useEffect(() => {
    const loadResume = async () => {
      console.log('📖 Loading resume with ID:', id);
      
      const resume = await kv.get(`resume-${id}`);
      console.log('📦 Resume data from KV:', resume);

      if(!resume) {
        console.warn('⚠️ Resume not found');
        return;
      }

      // Dùng kiểu 'Resume' global
      const data = JSON.parse(resume) as Resume; 
      console.log('✅ Parsed resume data:', data);

      // Lưu toàn bộ data vào state
      setResumeData(data); 

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

      // Extract text from resume for chat feature
      try {
        const resumeBlob = await fs.read(data.resumePath);
        if (resumeBlob) {
          const text = await ai.img2txt(resumeBlob);
          if (text) {
            setResumeText(text);
            console.log('📝 Resume text extracted for chat');
          }
        }
      } catch (error) {
        console.warn('⚠️ Could not extract resume text:', error);
      }
    }

    if (id && kv && fs) {
      loadResume();
    }
  }, [id, kv, fs, ai]);
 

  // Hàm để xử lý gợi ý việc làm từ RapidAPI
  const handleSuggestJobs = async () => {
    if (!feedback) {
      alert("Dữ liệu feedback CV chưa sẵn sàng.");
      return;
    }
    
    setIsSuggesting(true);
    setSuggestedJobs([]);

    try {
      // 1. Tạo query từ CV
      const cvSkills = feedback.skills?.tips?.map(tip => tip.tip).join(', ') || "Không có kỹ năng";
      
      // Tạo query tìm kiếm dựa trên CV (lấy skill đầu tiên)
      const firstSkill = cvSkills.split(',')[0]?.trim() || 'software';
      const searchQuery = `${firstSkill} developer`.trim();
      
      // 2. Gọi API để lấy jobs thật từ RapidAPI
      const allJobs = await fetchJobs(searchQuery);
      
      if (!allJobs || allJobs.length === 0) {
        alert("Không tìm thấy job phù hợp từ RapidAPI.");
        setIsSuggesting(false);
        return;
      }

      // 3. Dùng AI để chọn top 3 jobs phù hợp nhất
      const prompt = `
        You are an AI recruitment specialist.
        Here are the skills of a candidate:
        ---CV SKILLS---
        ${cvSkills}
        ---
        Here is a list of real jobs:
        ---JOBS---
        ${JSON.stringify(allJobs.slice(0, 10))}
        ---
        Based on the candidate's skills, select the 3 most suitable jobs.
        Return ONE JSON ARRAY containing only the IDs of those 3 jobs.
        Example: ["job-id-1", "job-id-2", "job-id-3"]

        `;

      // 4. Gọi AI
      const response = await ai.chat(prompt);
      if (!response) {
        throw new Error("AI không trả về phản hồi");
      }
      
      const content = typeof response.message.content === 'string' 
        ? response.message.content 
        : response.message.content[0]?.text || '';

      // 5. Xử lý kết quả
      const jsonMatch = content.match(/\[.*?\]/);
      if (jsonMatch) {
        const suggestedIds = JSON.parse(jsonMatch[0]) as string[];
        const matchedJobs = allJobs.filter(job => suggestedIds.includes(job.id));
        setSuggestedJobs(matchedJobs.slice(0, 3));
      } else {
        // Nếu AI không trả về đúng format, lấy 3 job đầu tiên
        setSuggestedJobs(allJobs.slice(0, 3));
      }

    } catch (err) {
      console.error(err);
      alert("Lỗi khi gợi ý việc làm: " + (err as Error).message);
    } finally {
      setIsSuggesting(false);
    }
  };

  // Handler cho Cover Letter Generator
  const handleGenerateCoverLetter = async (
    companyName: string,
    jobTitle: string,
    jobDescription: string
  ): Promise<string> => {
    if (!feedback) throw new Error('Feedback chưa sẵn sàng');

    // Get candidate info from feedback
    const candidateName = feedback.candidateInfo?.name || '[Your Name]';
    const candidateEmail = feedback.candidateInfo?.email || '[Your Email]';
    const candidatePhone = feedback.candidateInfo?.phone || '[Your Phone]';
    const currentTitle = feedback.candidateInfo?.currentTitle || '';

    // Sử dụng Job Match data nếu có
    let matchedSkills = '';
    let missingSkills = '';
    
    if (feedback.jobMatch) {
      // Use detailed job match analysis
      matchedSkills = feedback.jobMatch.matchingSkills
        .map(s => `${s.skill} (${s.evidence})`)
        .join(', ');
      
      const criticalMissing = feedback.jobMatch.missingSkills
        .filter(s => s.importance === 'critical' || s.importance === 'important')
        .map(s => s.skill)
        .join(', ');
      
      missingSkills = criticalMissing;
    } else {
      // Fallback to general skills analysis
      matchedSkills = feedback.skills.tips
        .filter(t => t.type === 'good')
        .map(t => t.tip)
        .join(', ');

      missingSkills = feedback.skills.tips
        .filter(t => t.type === 'improve')
        .map(t => t.tip)
        .join(', ');
    }

    const prompt = `
    You are a professional career coach writing a cover letter.

    Write a professional, compelling cover letter for the following:

    **CANDIDATE INFORMATION:**
    - Name: ${candidateName}
    - Email: ${candidateEmail}
    - Phone: ${candidatePhone}
    ${currentTitle ? `- Current Role: ${currentTitle}` : ''}

    **POSITION APPLYING FOR:**
    - Company Name: ${companyName}
    - Job Title: ${jobTitle}
    ${jobDescription ? `- Job Description: ${jobDescription}` : ''}

    **CANDIDATE'S QUALIFICATIONS:**
    ${feedback.matchScore ? `Match Score: ${feedback.matchScore}/100` : ''}

    The candidate has the following strengths based on their CV analysis:
    ${matchedSkills}

    ${missingSkills ? `Areas the candidate is working to improve:\n${missingSkills}` : ''}

    ${feedback.jobMatch ? `Overall Job Fit: ${feedback.jobMatch.overallAssessment}` : ''}

    Overall CV Score: ${feedback.overallScore}/100
    ATS Score: ${feedback.ATS.score}/100

    **REQUIREMENTS:**
    1. **Use proper business letter format:**
      - Include candidate's contact information at the top
      - Include date
      - Include hiring manager address placeholder
      - Professional greeting (Dear Hiring Manager, or Dear [Company] Team,)
      - Professional closing (Sincerely, [Candidate Name])

    2. Write in a professional but warm tone
    3. Highlight the candidate's matching skills prominently with specific examples
    4. Address areas to improve subtly by showing eagerness to learn and grow
    5. Show genuine enthusiasm for the role and company
    6. Keep it concise (250-350 words for the body)
    7. Make it personal and authentic, not generic
    8. Reference the candidate's current role if applicable

    **IMPORTANT: Write the cover letter in ENGLISH ONLY.**
    Even if the company name or job title is in Vietnamese, write the cover letter in English.

    Format the letter properly with:
    [Candidate Name]
    [Email] | [Phone]

    [Date]

    [Company Name]
    [Address - to be filled]

    Dear Hiring Manager,

    [Body paragraphs]

    Sincerely,
    [Candidate Name]
    `.trim();

    const response = await ai.chat(prompt);
    if (!response) throw new Error('AI không trả về phản hồi');

    const content = typeof response.message.content === 'string'
      ? response.message.content
      : response.message.content[0]?.text || '';

    return content;
  };

  // Handler cho Resume Chat
  const handleChatMessage = async (userMessage: string, context: string): Promise<string> => {
    const fullPrompt = `
You are an expert CV/Resume consultant and career advisor.

Context about the resume:
${context}

${resumeText ? `Resume Full Text:\n${resumeText}\n` : ''}

User Question: ${userMessage}

Please provide a helpful, specific, and actionable answer. If the question is about improving the resume, give concrete suggestions. Be professional but friendly.

**IMPORTANT: Answer in ENGLISH ONLY, regardless of the question's language.**
Even if the user asks in Vietnamese or another language, respond in English.
    `.trim();

    const response = await ai.chat(fullPrompt);
    if (!response) throw new Error('AI không trả về phản hồi');

    const content = typeof response.message.content === 'string'
      ? response.message.content
      : response.message.content[0]?.text || '';

    return content;
  };

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
                        {/* Candidate Info Card */}
                        {feedback.candidateInfo && (
                          <CandidateInfoCard candidateInfo={feedback.candidateInfo} />
                        )}
                        
                        <Summary feedback={feedback}/>
                        
                        {/* Job Match Analysis - Show when matching with JD */}
                        {feedback.jobMatch && resumeData && (
                          <JobMatchAnalysis
                            jobMatch={feedback.jobMatch}
                            matchScore={feedback.matchScore}
                            jobTitle={resumeData.jobTitle}
                            companyName={resumeData.companyName}
                          />
                        )}
                        
                        <ATS score={feedback.ATS?.score || 0} suggestions={feedback.ATS?.tips || []}/>
                        
                        {/* Cover Letter Generator - Two versions based on analysis type */}
                        {resumeData && resumeData.jobTitle ? (
                          /* Match JD: One-click generator with auto-filled data */
                          <CoverLetterGenerator
                            feedback={feedback}
                            resumeData={resumeData}
                            onGenerate={handleGenerateCoverLetter}
                          />
                        ) : (
                          /* General Analysis: Form-based generator */
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