import React, { useState } from 'react'
import { useNavigate } from 'react-router';
import FileUploader from '~/components/FileUploader';
import Navbar from '~/components/Navbar'
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
    <main className='bg-[url("/images/bg-main.svg")] bg-cover'>
        <Navbar />
        <section className='main-section'>
            <div className='page-heading py-16'>
                <h1>Get a General Analysis of Your CV</h1>
                {isProcessing ? (
                    <>
                        <h2>{statusText}</h2>
                        <img src="/images/resume-scan.gif" className="w-full"/>
                    </>
                    ) : (
                        <h2>
                            Drop your resume here to get started!
                        </h2>
                    )}
                    {!isProcessing && (
                        // Form chỉ có 1 file uploader
                        <form id="upload-form" onSubmit={handleSubmit} className="flex flex-col gap-4 mt-8">
                            <div className='form-div'>
                                <label htmlFor="uploader">Uploader</label>
                                <FileUploaderTyped onFileSelect={handleFileSelect} />
                            </div>
                            <button className='primary-button' type="submit">
                                Analyze My CV
                            </button>
                        </form>
                    )}
            </div>
        </section>
    </main>
  )
}

export default AnalyzeCV