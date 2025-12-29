import React from 'react'

interface ATSProps {
  score: number;
  suggestions: {
    type: 'good' | 'improve';
    tip: string;
  }[];
}

const ATS = ({ score, suggestions }: ATSProps) => {
  const getATSStatus = (score: number) => {
    if (score >= 80) return { 
      label: 'ATS Friendly', 
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      icon: '/icons/ats-good.svg'
    };
    if (score >= 60) return { 
      label: 'Needs Optimization', 
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50',
      icon: '/icons/ats-warning.svg'
    };
    return { 
      label: 'Not ATS Friendly', 
      color: 'text-red-600',
      bgColor: 'bg-red-50',
      icon: '/icons/ats-bad.svg'
    };
  };

  const status = getATSStatus(score);

  return (
    <div className="feedback-card animate-in fade-in duration-500">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <img src={status.icon} alt="ATS Status" className="w-10 h-10" />
          <div>
            <h3 className="text-2xl font-bold text-gray-800">ATS Compatibility</h3>
            <p className="text-sm text-gray-500">Applicant Tracking System Score</p>
          </div>
        </div>
        <div className={`flex flex-col items-end`}>
          <div className={`text-4xl font-bold ${status.color}`}>
            {score}
            <span className="text-xl">/100</span>
          </div>
          <span className={`text-sm font-semibold ${status.color}`}>
            {status.label}
          </span>
        </div>
      </div>

      <div className="mb-6">
        <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
          <div 
            className={`h-full transition-all duration-700 ${
              score >= 80 ? 'bg-green-500' : 
              score >= 60 ? 'bg-yellow-500' : 
              'bg-red-500'
            }`}
            style={{ width: `${score}%` }}
          />
        </div>
      </div>

      <div className="space-y-3">
        <h4 className="text-lg font-semibold text-gray-800 mb-3">
          {suggestions.length > 0 ? 'Suggestions' : 'No Suggestions Available'}
        </h4>
        {suggestions && suggestions.length > 0 ? (
          suggestions.map((item, index) => (
            <div
              key={index}
              className={`p-4 rounded-lg border-l-4 transition-all hover:shadow-md ${
                item.type === 'good'
                  ? 'bg-green-50 border-green-500'
                  : 'bg-orange-50 border-orange-500'
              }`}
            >
              <div className="flex items-start gap-3">
                <img
                  src={item.type === 'good' ? '/icons/check.svg' : '/icons/warning.svg'}
                  alt={item.type}
                  className="w-5 h-5 mt-1 shrink-0"
                />
                <p className="text-sm text-gray-700 leading-relaxed flex-1">{item.tip}</p>
              </div>
            </div>
          ))
        ) : (
          <div className="p-4 bg-gray-50 rounded-lg text-center">
            <p className="text-gray-500 text-sm">Your resume is being analyzed...</p>
          </div>
        )}
      </div>

      <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <div className="flex items-start gap-3">
          <img src="/icons/info.svg" alt="info" className="w-5 h-5 mt-0.5" />
          <div className="text-sm text-blue-800">
            <p className="font-semibold mb-1">What is ATS?</p>
            <p className="text-blue-700">
              ATS (Applicant Tracking System) is software used by employers to filter resumes. 
              A higher score means your resume is more likely to pass automated screening.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ATS