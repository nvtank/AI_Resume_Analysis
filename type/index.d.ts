interface Job {
  id: string; 
  title: string;
  description: string;
  company: string;
  // location?: string;
  // requiredSkills?: string[];
}

interface Resume {
  id: string;
  companyName?: string;
  jobTitle?: string;
  imagePath: string;
  resumePath: string;
  feedback: Feedback;
}

interface Feedback {
  overallScore: number;
  matchScore?: number; // Score so khớp với JD (0-100)
  candidateInfo?: {
    name?: string; // Tên ứng viên từ CV
    email?: string; // Email nếu có
    phone?: string; // Phone nếu có
    currentTitle?: string; // Current job title nếu có
  };
  ATS: {
    score: number;
    tips: {
      type: "good" | "improve";
      tip: string;
    }[];
  };
  jobMatch?: {
    matchingSkills: {
      skill: string;
      evidence: string; // Chỗ nào trong CV chứng minh skill này
    }[];
    missingSkills: {
      skill: string;
      importance: "critical" | "important" | "nice-to-have";
      suggestion: string; // Gợi ý cách bổ sung
    }[];
    matchingExperience: {
      requirement: string;
      match: string; // Evidence từ CV
      matchLevel: "excellent" | "good" | "partial" | "none";
    }[];
    overallAssessment: string; // Đánh giá tổng quan về độ phù hợp
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
}