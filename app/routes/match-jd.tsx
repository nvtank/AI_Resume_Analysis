import React, { useState } from 'react'
import { useNavigate } from 'react-router';
import FileUploader from '~/components/ui/FileUploader';
import { prepareInstructions } from '~/constants';
import { convertPdfToImage } from '~/lib/pdf2img';
import { usePuterStore } from '~/lib/puter';
import { generateUUID } from '~/lib/utils';
const FileUploaderTyped = FileUploader as React.ComponentType<{
  onFileSelect: (file: File | null) => void
}>;

const MatchJD = () => {
  const {auth, isLoading, fs, ai, kv } = usePuterStore();
  const navigate = useNavigate();
  const [isProcessing, setIsProcessing] = useState(false);
  const [statusText, setStatusText] = useState('');
  const [file, setFile] = useState<File | null>(null);

  const handleFileSelect = (file: File | null) => {
    setFile(file);
  }

  const handleAnalyze = async ({companyName, jobTitle, jobDescription, file}:{companyName: string, jobTitle: string, jobDescription: string, file: File}) => {
    setIsProcessing(true);
    setStatusText('Uploading your resume...');

    const uploaderFile = await fs.upload([file]);
    if(!uploaderFile) return setStatusText('Failed to upload file.');

    setStatusText('Converting resume to text...');
    const imageFile = await convertPdfToImage(file)

    if(!imageFile.file) return setStatusText('Failed to convert PDF to image.');

    setStatusText('Analyzing your resume...');

    const uploaderImage = await fs.upload([imageFile.file]);

    if(!uploaderImage) return setStatusText('Failed to upload image file.');

    setStatusText('Generating feedback...');

    const uuid = generateUUID();
    const data = {
        id: uuid,
        resumePath: uploaderFile.path,
        imagePath: uploaderImage.path,
        companyName,
        jobTitle,
        jobDescription,
        feedback: ''
    }
    await kv.set(`resume-${uuid}`, JSON.stringify(data));
    setStatusText('Analysis complete! Redirecting...');

    const feedback = await ai.feedback(
        uploaderFile.path,
        prepareInstructions({jobTitle, jobDescription})
    )

    if (!feedback) return setStatusText('Failed to get feedback from AI.');

    const feedbackText = typeof feedback.message.content === 'string' ? feedback.message.content : feedback.message.content[0]?.text || '';

    data.feedback = JSON.parse(feedbackText);
    await kv.set(`resume-${uuid}`, JSON.stringify(data));

    setStatusText('Redirecting to results page...');

    console.log('Feedback data:', data);
    navigate(`/resume/${uuid}`);

}

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget.closest('form');
    if (!form || !file) return;
    const formdata = new FormData(form);

    const companyName = formdata.get('company-name') as string;
    const jobTitle = formdata.get('job-title') as string;
    const jobDescription = formdata.get('job-description') as string;

    if (!file) return;

    handleAnalyze({companyName, jobTitle, jobDescription, file});
  }

  return (
  <main className="min-h-screen bg-gradient-to-b from-white to-gray-50">
    
    <section className="max-w-4xl mx-auto px-6 py-20 h-full">

      <div className="text-center mb-16">
        <h1 className="text-4xl font-extrabold tracking-tight text-gray-900">
          Match Your CV With a Job Description
        </h1>
        <p className="text-gray-600 mt-3 text-lg">
          Upload your resume and compare it instantly with any job description.
        </p>
      </div>

      {isProcessing ? (
        <div className="bg-white/70 backdrop-blur-xl border border-gray-200 shadow-lg rounded-3xl p-12 text-center space-y-6">
          <h2 className="text-2xl font-semibold text-gray-800">
            {statusText}
          </h2>

          <img
            src="/images/resume-scan.gif"
            className="w-72 mx-auto opacity-90"
          />

          <p className="text-sm text-gray-500">
            Please wait a moment while we analyze your resume...
          </p>
        </div>
      ) : (

        <form
          id="upload-form"
          onSubmit={handleSubmit}
          className="bg-white/70 backdrop-blur-lg border border-gray-200 shadow-lg rounded-3xl p-10 space-y-3"
        >

          <div className='w-full'>
            <label
              htmlFor="company-name"
              className="block font-medium text-gray-800 pb-1"
            >
              Company Name
            </label>
            <input
              type="text"
              name="company-name"
              id="company-name"
              placeholder="e.g. Google"
              required
              className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-300 focus:border-black focus:ring-1 focus:ring-black transition"
            />
          </div>

          <div className='w-full'>
            <label
              htmlFor="job-title"
              className="block font-medium text-gray-800 pb-1"
            >
              Job Title
            </label>
            <input
              type="text"
              name="job-title"
              id="job-title"
              placeholder="e.g. Frontend Engineer"
              required
              className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-300 focus:border-black focus:ring-1 focus:ring-black transition"
            />
          </div>

          <div className='w-full'>
            <label
              htmlFor="job-description"
              className="block font-medium text-gray-800 pb-2"
            >
              Job Description
            </label>
            <textarea
              id="job-description"
              name="job-description"
              rows={5}
              placeholder="Paste the job description here..."
              required
              className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-300 resize-none 
              focus:border-black focus:ring-1 focus:ring-black transition"
            />
          </div>

          <div className='w-full'>
            <label className="block font-medium text-gray-800 mb-2">
              Resume Upload
            </label>

            <div className="bg-gray-50 border text-center border-gray-300 rounded-xl p-5">
              <FileUploaderTyped onFileSelect={handleFileSelect} />
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-4 bg-black text-white rounded-xl font-semibold text-lg
            hover:bg-gray-900 transition cursor-pointer active:scale-[0.98]"
          >
            Analyze Resume
          </button>

        </form>
      )}

    </section>
  </main>
);
}

export default MatchJD