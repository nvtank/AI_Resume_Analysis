import React from 'react';

interface CandidateInfoCardProps {
  candidateInfo?: {
    name?: string;
    email?: string;
    phone?: string;
    currentTitle?: string;
  };
}

const CandidateInfoCard: React.FC<CandidateInfoCardProps> = ({ candidateInfo }) => {
  if (!candidateInfo || !candidateInfo.name) {
    return null;
  }

  return (
    <div className="my-6 p-5 bg-gradient-to-r from-indigo-50 to-blue-50 rounded-xl border-2 border-indigo-200 shadow-md">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-12 h-12 bg-indigo-600 rounded-full flex items-center justify-center text-white text-xl font-bold">
          {candidateInfo.name.charAt(0).toUpperCase()}
        </div>
        <div>
          <h3 className="text-2xl font-bold text-indigo-900">{candidateInfo.name}</h3>
          {candidateInfo.currentTitle && (
            <p className="text-sm text-indigo-600 font-medium">{candidateInfo.currentTitle}</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {candidateInfo.email && (
          <div className="flex items-center gap-2 text-gray-700">
            <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            <span className="text-sm">{candidateInfo.email}</span>
          </div>
        )}

        {candidateInfo.phone && (
          <div className="flex items-center gap-2 text-gray-700">
            <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
            </svg>
            <span className="text-sm">{candidateInfo.phone}</span>
          </div>
        )}
      </div>

      <div className="mt-4 pt-4 border-t border-indigo-200">
        <p className="text-xs text-gray-600 italic">
          ℹ️ This information was extracted from your CV and will be used in the cover letter
        </p>
      </div>
    </div>
  );
};

export default CandidateInfoCard;
