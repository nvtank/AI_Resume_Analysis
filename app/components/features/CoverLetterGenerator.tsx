import React, { useState } from 'react';

interface CoverLetterGeneratorProps {
  feedback: Feedback;
  resumeData: Resume;
  onGenerate: (companyName: string, jobTitle: string, jobDescription: string) => Promise<string>;
}

const CoverLetterGenerator: React.FC<CoverLetterGeneratorProps> = ({ 
  feedback, 
  resumeData,
  onGenerate 
}) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [coverLetter, setCoverLetter] = useState<string>('');

  // Check if we have all required info from resumeData
  const hasRequiredInfo = resumeData.companyName && resumeData.jobTitle;

  const handleGenerateQuick = async () => {
    if (!hasRequiredInfo) return;
    
    setIsGenerating(true);
    
    try {
      // Use data from resumeData directly (from Match JD)
      const letter = await onGenerate(
        resumeData.companyName!, 
        resumeData.jobTitle!, 
        '' // No job description needed, already analyzed
      );
      setCoverLetter(letter);
    } catch (error) {
      alert('Error generating cover letter: ' + (error as Error).message);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(coverLetter);
    alert('Cover letter copied to clipboard!');
  };

  const handleDownload = () => {
    const blob = new Blob([coverLetter], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    const fileName = resumeData.companyName 
      ? `cover-letter-${resumeData.companyName.replace(/\s+/g, '-')}.txt`
      : 'cover-letter.txt';
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (!hasRequiredInfo) {
    return null; // Don't show if we don't have required info
  }

  return (
    <div className="my-8 p-6 bg-white rounded-lg shadow-md border border-gray-200 animate-in fade-in duration-700">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-2xl font-bold text-gray-800">Cover Letter Generator</h3>
          <p className="text-sm text-gray-600 mt-1">
            Generate a professional cover letter for <strong>{resumeData.jobTitle}</strong> at <strong>{resumeData.companyName}</strong>
          </p>
        </div>
        {!coverLetter && (
          <button
            onClick={handleGenerateQuick}
            disabled={isGenerating}
            className="px-6 py-2.5 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isGenerating ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Generating...
              </span>
            ) : (
              'Generate Cover Letter'
            )}
          </button>
        )}
      </div>

      {/* Info about what will be included */}
      {!coverLetter && !isGenerating && (
        <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <p className="text-sm text-blue-800 font-medium mb-2">📋 What will be included:</p>
          <ul className="text-sm text-blue-700 space-y-1 ml-4">
            <li>• Your contact information from CV</li>
            <li>• Personalized greeting for {resumeData.companyName}</li>
            <li>• Highlights of your matching skills</li>
            <li>• Professional closing with your signature</li>
          </ul>
        </div>
      )}

      {/* Generating state */}
      {isGenerating && (
        <div className="mt-4 p-6 bg-purple-50 rounded-lg border border-purple-200 text-center">
          <div className="flex flex-col items-center gap-3">
            <svg className="animate-spin h-8 w-8 text-purple-600" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            <p className="text-purple-800 font-medium">Creating your cover letter...</p>
            <p className="text-sm text-purple-600">Using your CV analysis and job match data</p>
          </div>
        </div>
      )}

      {/* Cover Letter Result */}
      {coverLetter && (
        <div className="mt-4 space-y-4">
          <div className="bg-gray-50 border border-gray-300 rounded-lg p-6 max-h-96 overflow-y-auto">
            <pre className="whitespace-pre-wrap font-sans text-sm text-gray-800 leading-relaxed">
              {coverLetter}
            </pre>
          </div>

          <div className="flex gap-3">
            <button
              onClick={handleCopy}
              className="flex-1 py-2.5 bg-black text-white rounded-lg font-semibold hover:bg-black/80 transition flex items-center justify-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
              Copy to Clipboard
            </button>
            <button
              onClick={handleDownload}
              className="flex-1 py-2.5 bg-black text-white rounded-lg font-semibold hover:bg-black/80 transition flex items-center justify-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Download as .txt
            </button>
            <button
              onClick={() => {
                setCoverLetter('');
              }}
              className="px-6 py-2.5 bg-black text-white rounded-lg font-semibold hover:bg-black/80 transition"
            >
              Generate New
            </button>
          </div>

        </div>
      )}
    </div>
  );
};

export default CoverLetterGenerator;
