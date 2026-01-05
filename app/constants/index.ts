export const resumes: Resume[] = [
  {
    id: "1",
    companyName: "Google",
    jobTitle: "Frontend Developer",
    imagePath: "/images/resume_01.png",
    resumePath: "/resumes/resume-1.pdf",
    feedback: {
      overallScore: 85,
      ATS: {
        score: 90,
        tips: [],
      },
      toneAndStyle: {
        score: 90,
        tips: [],
      },
      content: {
        score: 90,
        tips: [],
      },
      structure: {
        score: 90,
        tips: [],
      },
      skills: {
        score: 90,
        tips: [],
      },
    },
  },
  {
    id: "2",
    companyName: "Microsoft",
    jobTitle: "Cloud Engineer",
    imagePath: "/images/resume_02.png",
    resumePath: "/resumes/resume-2.pdf",
    feedback: {
      overallScore: 55,
      ATS: {
        score: 90,
        tips: [],
      },
      toneAndStyle: {
        score: 90,
        tips: [],
      },
      content: {
        score: 90,
        tips: [],
      },
      structure: {
        score: 90,
        tips: [],
      },
      skills: {
        score: 90,
        tips: [],
      },
    },
  },
  {
    id: "3",
    companyName: "Apple",
    jobTitle: "iOS Developer",
    imagePath: "/images/resume_03.png",
    resumePath: "/resumes/resume-3.pdf",
    feedback: {
      overallScore: 75,
      ATS: {
        score: 90,
        tips: [],
      },
      toneAndStyle: {
        score: 90,
        tips: [],
      },
      content: {
        score: 90,
        tips: [],
      },
      structure: {
        score: 90,
        tips: [],
      },
      skills: {
        score: 90,
        tips: [],
      },
    },
  },
];

export const AIResponseFormat = `
      interface Feedback {
      overallScore: number; 
      matchScore?: number;
      candidateInfo?: {
        // ALWAYS extract this information from CV
        name?: string; 
        email?: string; 
        phone?: string; 
        currentTitle?: string; 
      };
      ATS: {
        score: number; 
        tips: {
          type: "good" | "improve";
          tip: string; 
        }[];
      };
      jobMatch?: {
        // ONLY include this section when Job Description is provided
        matchingSkills: {
          skill: string; 
          evidence: string; 
        }[]; 
        missingSkills: {
          skill: string; 
          importance: "critical" | "important" | "nice-to-have";
          suggestion: string; 
        }[]; 
        matchingExperience: {
          requirement: string; 
          match: string; 
          matchLevel: "excellent" | "good" | "partial" | "none";
        }[]; // Analyze ALL experience requirements
        overallAssessment: string; // 2-3 sentences summary: Is this a good fit? Why or why not?
      };
      toneAndStyle: {
        score: number;
        tips: {
          type: "good" | "improve";
          tip: string; 
          explanation: string; 
        }[]; 
      };
      content: {
        score: number;
        tips: {
          type: "good" | "improve";
          tip: string; 
          explanation: string; 
        }[]; 
      };
      structure: {
        score: number;
        tips: {
          type: "good" | "improve";
          tip: string; 
          explanation: string; 
        }[]; 
      };
      skills: {
        score: number;
        tips: {
          type: "good" | "improve";
          tip: string; 
          explanation: string; 
        }[]; 
      };
    }`;

export const prepareInstructions = ({
  jobTitle,
  jobDescription,
}: {
  jobTitle: string;
  jobDescription: string;
}) =>
  `You are an expert in ATS (Applicant Tracking System) and resume analysis with 10+ years of recruiting experience.

**PRIMARY TASK: DETAILED JOB MATCH ANALYSIS**

You are analyzing this resume for the position: **${jobTitle}**

Job Description:
"""
${jobDescription}
"""

**CRITICAL INSTRUCTIONS:**

1. **EXTRACT CANDIDATE INFORMATION**
   - Find candidate's full name (usually at the top of CV)
   - Extract email address if visible
   - Extract phone number if visible
   - Note current job title if mentioned
   - Include in candidateInfo section

2. **READ THE ENTIRE JOB DESCRIPTION CAREFULLY**
   - Extract ALL required skills (technical, soft skills, tools, technologies)
   - Extract ALL experience requirements (years, specific roles, projects)
   - Extract ALL qualifications (education, certifications)
   - Note "must-have" vs "nice-to-have" requirements

3. **ANALYZE THE RESUME AGAINST EACH REQUIREMENT**
   - For EACH skill in JD: Does the candidate have it? Where is the evidence in CV?
   - For EACH experience requirement: Does the candidate meet it? Provide specific examples from CV
   - Calculate a matchScore (0-100) based on how well the CV matches the JD

4. **BE SPECIFIC AND DETAILED IN jobMatch SECTION**
   - matchingSkills: List EVERY skill from JD that candidate has, with evidence from CV
   - missingSkills: List EVERY required skill from JD that candidate lacks
   - matchingExperience: Compare EACH experience requirement from JD with candidate's experience
   - overallAssessment: Clear verdict - is this candidate a good fit? Why or why not?

5. **GENERAL RESUME ANALYSIS**
   - Rate ATS compatibility, tone, content, structure, and skills presentation
   - Be thorough and detailed - don't be afraid to give low scores if deserved
   - Provide actionable improvement tips

6. **OUTPUT FORMAT**
   - Return ONLY valid JSON matching this format: ${AIResponseFormat}
   - NO markdown, NO backticks, NO extra text
   - Include the jobMatch section with detailed analysis
   - Set matchScore based on overall fit

**SCORING GUIDELINES:**
- matchScore 90-100: Excellent fit, meets all/most requirements
- matchScore 70-89: Good fit, meets most requirements, minor gaps
- matchScore 50-69: Moderate fit, significant gaps in key areas
- matchScore 30-49: Poor fit, many missing requirements
- matchScore 0-29: Not qualified, lacks most requirements

**LANGUAGE REQUIREMENT:**
⚠️ **IMPORTANT: Write ALL feedback, tips, explanations, and assessments in ENGLISH ONLY.**
⚠️ **DO NOT use Vietnamese or any other language. Everything must be in English.**

Be honest and specific. This analysis will help the candidate understand their fit and improve their chances.`;


export const prepareGeneralInstructions = () =>
  `You are an expert in resume analysis.
  
  **CRITICAL:**
  1. **EXTRACT candidate information** (name, email, phone, current title) from CV
  2. Include in candidateInfo section of the response
  
  Please analyze and rate this resume *generally*. Do not focus on any specific job.
  Identify the user's strongest skills, experience level, and potential job titles.
  Be thorough and detailed.
  
  **LANGUAGE REQUIREMENT:**
  ⚠️ **IMPORTANT: Write ALL feedback, tips, explanations in ENGLISH ONLY.**
  ⚠️ **DO NOT use Vietnamese or any other language. Everything must be in English.**
  
  Provide the feedback using the following format: ${AIResponseFormat}
  Return the analysis as a JSON object, without any other text and without the backticks.
  Do not include any other text or comments.`;