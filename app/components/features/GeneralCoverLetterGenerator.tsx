import React, { useState } from 'react';

interface GeneralCoverLetterGeneratorProps {
  feedback: Feedback;
  onGenerate: (companyName: string, jobTitle: string, jobDescription: string) => Promise<string>;
}

const GeneralCoverLetterGenerator: React.FC<GeneralCoverLetterGeneratorProps> = ({ 
  feedback, 
  onGenerate 
}) => {
  const [showForm, setShowForm] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [coverLetter, setCoverLetter] = useState<string>('');
  const [formData, setFormData] = useState({
    companyName: '',
    jobTitle: '',
    jobDescription: ''
  });

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.companyName.trim() || !formData.jobTitle.trim()) {
      alert('Please enter both Company Name and Job Title');
      return;
    }
    
    setIsGenerating(true);
    
    try {
      const letter = await onGenerate(
        formData.companyName, 
        formData.jobTitle, 
        formData.jobDescription
      );
      setCoverLetter(letter);
      setShowForm(false);
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
    const fileName = formData.companyName 
      ? `cover-letter-${formData.companyName.replace(/\s+/g, '-')}.txt`
      : 'cover-letter.txt';
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleReset = () => {
    setCoverLetter('');
    setFormData({ companyName: '', jobTitle: '', jobDescription: '' });
    setShowForm(true);
  };

  return (
    <div className="my-8 p-6 bg-white rounded-lg shadow-md border border-gray-200 animate-in fade-in duration-700">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-2xl font-bold text-gray-800">Cover Letter Generator</h3>
          <p className="text-sm text-gray-600 mt-1">
            Create a professional cover letter for any job application
          </p>
        </div>
        {!showForm && !coverLetter && (
          <button
            onClick={() => setShowForm(true)}
            className="px-6 py-2.5 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 transition-all shadow-md hover:shadow-lg"
          >
            ✍️ Create Cover Letter
          </button>
        )}
      </div>

      {/* Form to enter job details */}
      {showForm && !coverLetter && (
        <form onSubmit={handleGenerate} className="space-y-4 mt-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Company Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={formData.companyName}
              onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
              className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition"
              placeholder="e.g., Google, Microsoft, Startup Inc..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Job Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={formData.jobTitle}
              onChange={(e) => setFormData({ ...formData, jobTitle: e.target.value })}
              className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition"
              placeholder="e.g., Senior Frontend Developer, Marketing Manager..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Job Description <span className="text-gray-500 text-xs">(Optional - helps personalize)</span>
            </label>
            <textarea
              rows={5}
              value={formData.jobDescription}
              onChange={(e) => setFormData({ ...formData, jobDescription: e.target.value })}
              className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition resize-none"
              placeholder="Paste the job description here to create a more targeted cover letter..."
            />
            <p className="text-xs text-gray-500 mt-1">
              💡 Tip: Include requirements, responsibilities, and company values for a better match
            </p>
          </div>

          <div className="flex gap-3">
            <button
              type="submit"
              disabled={isGenerating}
              className="flex-1 py-3 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isGenerating ? (
                <>
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Generating...
                </>
              ) : (
                '🚀 Generate Cover Letter'
              )}
            </button>
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300 transition"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* Generating state */}
      {isGenerating && (
        <div className="mt-4 p-6 bg-purple-50 rounded-lg border border-purple-200 text-center">
          <div className="flex flex-col items-center gap-3">
            <svg className="animate-spin h-8 w-8 text-purple-600" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            <p className="text-purple-800 font-medium">Creating your personalized cover letter...</p>
            <p className="text-sm text-purple-600">Using your CV analysis to highlight your strengths</p>
          </div>
        </div>
      )}

      {/* Cover Letter Result */}
      {coverLetter && (
        <div className="mt-4 space-y-4">
          <div className="bg-linear-to-br from-purple-50 to-blue-50 border-2 border-purple-200 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="font-semibold text-purple-800">Cover Letter Created Successfully!</p>
            </div>
            <p className="text-sm text-purple-700">
              For <strong>{formData.jobTitle}</strong> at <strong>{formData.companyName}</strong>
            </p>
          </div>

          <div className="bg-gray-50 border border-gray-300 rounded-lg p-6 max-h-96 overflow-y-auto">
            <pre className="whitespace-pre-wrap font-sans text-sm text-gray-800 leading-relaxed">
              {coverLetter}
            </pre>
          </div>

          <div className="flex gap-3">
            <button
              onClick={handleCopy}
              className="flex-1 py-2.5 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition flex items-center justify-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
              Copy to Clipboard
            </button>
            <button
              onClick={handleDownload}
              className="flex-1 py-2.5 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition flex items-center justify-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Download as .txt
            </button>
            <button
              onClick={handleReset}
              className="px-6 py-2.5 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 transition"
            >
              🔄 Create New
            </button>
          </div>

          {/* Tips after generation */}
          <div className="p-4 bg-green-50 rounded-lg border border-green-200">
            <p className="text-sm text-green-800 font-medium mb-2">✅ Next steps:</p>
            <ul className="text-sm text-green-700 space-y-1 ml-4">
              <li>• Review and customize the letter to match your voice</li>
              <li>• Add specific examples from your experience</li>
              <li>• Include the complete company address before sending</li>
              <li>• Save as PDF for professional submission</li>
              <li>• Proofread carefully before attaching to your application</li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};

export default GeneralCoverLetterGenerator;
