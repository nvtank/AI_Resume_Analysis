import React, { useState } from 'react'
import { useNavigate } from 'react-router';
import FileUploader from '~/components/ui/FileUploader';
import { prepareGeneralInstructions } from '~/constants';
import { convertPdfToImage } from '~/lib/pdf2img';
import { usePuterStore } from '~/lib/puter';
import { generateUUID } from '~/lib/utils';
const FileUploaderTyped = FileUploader as React.ComponentType<{
  onFileSelect: (file: File | null) => void
}>;

const AnalyzeCV = () => {
  const {auth, isLoading, fs, ai, kv } = usePuterStore();
  const navigate = useNavigate();
  const [isProcessing, setIsProcessing] = useState(false);
  const [statusText, setStatusText] = useState('');
  const [file, setFile] = useState<File | null>(null);

  const handleFileSelect = (file: File | null) => {
    setFile(file);
  }

  // Hàm handleAnalyze đã được rút gọn
  const handleAnalyze = async ({file}:{file: File}) => {
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
    // Data KHÔNG CÓ jobTitle hay jobDescription
    const data = {
        id: uuid,
        resumePath: uploaderFile.path,
        imagePath: uploaderImage.path,
        feedback: ''
    }
    await kv.set(`resume-${uuid}`, JSON.stringify(data));
    setStatusText('Analysis complete! Redirecting...');

    // Dùng prompt TỔNG QUÁT
    const feedback = await ai.feedback(
        uploaderFile.path,
        prepareGeneralInstructions() // <--- THAY ĐỔI QUAN TRỌNG
    )

    if (!feedback) return setStatusText('Failed to get feedback from AI.');

    const feedbackText = typeof feedback.message.content === 'string' ? feedback.message.content : feedback.message.content[0]?.text || '';

    data.feedback = JSON.parse(feedbackText);
    await kv.set(`resume-${uuid}`, JSON.stringify(data));

    setStatusText('Redirecting to results page...');

    console.log('Feedback data (General):', data);
    navigate(`/resume/${uuid}`);
}

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!file) return;
    handleAnalyze({file}); // Chỉ cần gửi file
  }

 return (
  <main className="min-h-screen bg-gradient-to-b from-white to-gray-50">
    <section className="max-w-3xl mx-auto px-6 py-20">

      <div className="text-center mb-16">
        <h1 className="text-4xl font-extrabold tracking-tight text-gray-900">
          Get a General Analysis of Your CV
        </h1>
        <p className="text-gray-600 mt-3 text-lg">
          Upload your resume to receive an AI-powered review and improvement suggestions.
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
            Please wait while we process your CV...
          </p>
        </div>

      ) : (

        <form
          id="upload-form"
          onSubmit={handleSubmit}
          className="bg-white/70 backdrop-blur-lg border border-gray-200 shadow-lg rounded-3xl p-10 space-y-8"
        >
          <div className="w-full">
            <label className="block font-medium text-gray-800 mb-2">
              Upload Your CV
            </label>

            <div className="bg-gray-50 text-center border border-gray-300 rounded-xl p-5">
              <FileUploaderTyped onFileSelect={handleFileSelect} />
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-4 bg-black text-white rounded-xl font-semibold text-lg
            hover:bg-gray-900 transition active:scale-[0.98]"
          >
            Analyze My CV
          </button>
        </form>
      )}
    </section>
  </main>
);
}
export default AnalyzeCV