import React from 'react';

interface JobMatchAnalysisProps {
  jobMatch: {
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
    }[];
    overallAssessment: string;
  };
  matchScore?: number;
  jobTitle?: string;
  companyName?: string;
}

const JobMatchAnalysis: React.FC<JobMatchAnalysisProps> = ({ 
  jobMatch, 
  matchScore,
  jobTitle,
  companyName 
}) => {
  const getMatchScoreColor = (score?: number) => {
    if (!score) return 'text-gray-600';
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getMatchScoreBg = (score?: number) => {
    if (!score) return 'bg-gray-100';
    if (score >= 80) return 'bg-green-100';
    if (score >= 60) return 'bg-yellow-100';
    return 'bg-red-100';
  };

  const getImportanceColor = (importance: string) => {
    switch (importance) {
      case 'critical': return 'bg-red-100 text-red-800 border-red-300';
      case 'important': return 'bg-orange-100 text-orange-800 border-orange-300';
      case 'nice-to-have': return 'bg-blue-100 text-blue-800 border-blue-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getMatchLevelIcon = (level: string) => {
    switch (level) {
      case 'excellent': return '🎯';
      case 'good': return '✅';
      case 'partial': return '⚠️';
      case 'none': return '❌';
      default: return '•';
    }
  };

  const getMatchLevelColor = (level: string) => {
    switch (level) {
      case 'excellent': return 'text-green-700 bg-green-50 border-green-300';
      case 'good': return 'text-blue-700 bg-blue-50 border-blue-300';
      case 'partial': return 'text-yellow-700 bg-yellow-50 border-yellow-300';
      case 'none': return 'text-red-700 bg-red-50 border-red-300';
      default: return 'text-gray-700 bg-gray-50 border-gray-300';
    }
  };

  return (
    <div className="my-8 p-6 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl shadow-lg border-2 border-indigo-200">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-3xl font-bold text-indigo-900 flex items-center gap-3">
            🎯 Job Match Analysis
          </h2>
          {matchScore !== undefined && (
            <div className={`px-6 py-3 rounded-xl font-bold text-2xl ${getMatchScoreBg(matchScore)} ${getMatchScoreColor(matchScore)} border-2 border-current`}>
              {matchScore}%
            </div>
          )}
        </div>
        {jobTitle && (
          <p className="text-lg text-indigo-700 font-semibold">
            Analysis for position: <span className="text-indigo-900">{jobTitle}</span>
            {companyName && <span> at {companyName}</span>}
          </p>
        )}
      </div>

      {/* Overall Assessment */}
      <div className="mb-6 p-5 bg-white rounded-lg border-l-4 border-indigo-600 shadow-md">
        <h3 className="text-xl font-bold text-gray-800 mb-2 flex items-center gap-2">
          📊 Overall Assessment
        </h3>
        <p className="text-gray-700 leading-relaxed whitespace-pre-line">
          {jobMatch.overallAssessment}
        </p>
      </div>

      {/* Matching Skills */}
      {jobMatch.matchingSkills.length > 0 && (
        <div className="mb-6 p-5 bg-white rounded-lg shadow-md">
          <h3 className="text-xl font-bold text-green-800 mb-4 flex items-center gap-2">
            ✅ Matching Skills ({jobMatch.matchingSkills.length})
          </h3>
          <div className="space-y-3">
            {jobMatch.matchingSkills.map((item, idx) => (
              <div 
                key={idx}
                className="p-4 bg-green-50 rounded-lg border border-green-200 hover:shadow-md transition"
              >
                <div className="flex items-start gap-3">
                  <span className="text-2xl">✓</span>
                  <div className="flex-1">
                    <p className="font-bold text-green-900 text-lg mb-1">
                      {item.skill}
                    </p>
                    <p className="text-sm text-green-700 italic">
                      <span className="font-semibold">Evidence:</span> {item.evidence}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Missing Skills */}
      {jobMatch.missingSkills.length > 0 && (
        <div className="mb-6 p-5 bg-white rounded-lg shadow-md">
          <h3 className="text-xl font-bold text-red-800 mb-4 flex items-center gap-2">
            ⚠️ Missing Skills ({jobMatch.missingSkills.length})
          </h3>
          <div className="space-y-3">
            {jobMatch.missingSkills.map((item, idx) => (
              <div 
                key={idx}
                className="p-4 bg-red-50 rounded-lg border border-red-200 hover:shadow-md transition"
              >
                <div className="flex items-start gap-3">
                  <span className="text-2xl">⚠</span>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <p className="font-bold text-red-900 text-lg">
                        {item.skill}
                      </p>
                      <span className={`text-xs px-2 py-1 rounded-full font-semibold border ${getImportanceColor(item.importance)}`}>
                        {item.importance === 'critical' && '🔴 Critical'}
                        {item.importance === 'important' && '🟠 Important'}
                        {item.importance === 'nice-to-have' && '🔵 Nice to have'}
                      </span>
                    </div>
                    <p className="text-sm text-red-700">
                      <span className="font-semibold">💡 Suggestion:</span> {item.suggestion}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {jobMatch.matchingExperience.length > 0 && (
        <div className="p-5 bg-white rounded-lg shadow-md">
          <h3 className="text-xl font-bold text-indigo-800 mb-4 flex items-center gap-2">
            💼 Experience Comparison
          </h3>
          <div className="space-y-3">
            {jobMatch.matchingExperience.map((item, idx) => (
              <div 
                key={idx}
                className={`p-4 rounded-lg border-2 hover:shadow-md transition ${getMatchLevelColor(item.matchLevel)}`}
              >
                <div className="flex items-start gap-3">
                  <span className="text-2xl">{getMatchLevelIcon(item.matchLevel)}</span>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className={`text-xs px-2 py-1 rounded-full font-bold uppercase ${getMatchLevelColor(item.matchLevel)}`}>
                        {item.matchLevel}
                      </span>
                    </div>
                    <p className="font-bold text-gray-900 mb-2">
                      <span className="text-gray-600">JD Requirement:</span> {item.requirement}
                    </p>
                    <p className="text-sm">
                      <span className="font-semibold text-gray-600">Your CV:</span> {item.match}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {jobMatch.missingSkills.length > 0 && (
        <div className="mt-6 p-5 bg-purple-100 rounded-lg border-2 border-purple-300">
          <h3 className="text-xl font-bold text-purple-900 mb-3 flex items-center gap-2">
            🎯 Next Steps
          </h3>
          <ul className="space-y-2 text-purple-800">
            <li className="flex items-start gap-2">
              <span className="mt-1">1️⃣</span>
              <span>Prioritize learning <strong>Critical</strong> skills first</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-1">2️⃣</span>
              <span>Update CV with specific evidence for existing skills</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-1">3️⃣</span>
              <span>Generate Cover Letter highlighting matching skills</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-1">4️⃣</span>
              <span>Prepare to explain skill gaps during interview</span>
            </li>
          </ul>
        </div>
      )}
    </div>
  );
};

export default JobMatchAnalysis;
