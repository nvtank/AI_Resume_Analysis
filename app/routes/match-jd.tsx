import React, { useState } from 'react'
import { useNavigate } from 'react-router';
import FileUploader from '~/components/FileUploader';
import Navbar from '~/components/Navbar'
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
    <main className='bg-[url("/images/bg-main.svg")] bg-cover'>
        <Navbar />
        <section className='main-section'>
            <div className='page-heading py-16'>
                <h1>Match your CV against a Job Description</h1>
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
                        <form id="upload-form" onSubmit={handleSubmit} className="flex flex-col gap-4 mt-8">
                            <div className='form-div'>
                                <label htmlFor="company-name">Company Name</label>
                                <input type="text" id="company-name" placeholder="company Name" name="company-name" required />
                            </div>
                            <div className='form-div'>
                                <label htmlFor="job-title">Job Title</label>
                                <input type="text" id="job-title" placeholder="Job Title" name="job-title" required />
                            </div>
                             <div className='form-div'>
                                <label htmlFor="job-description">Job Description</label>
                                <textarea rows={4} id="job-description" placeholder="Job Description" name="job-description" required />
                            </div>
                            <div className='form-div'>
                                <label htmlFor="uploader">Uploader</label>
                                <FileUploaderTyped onFileSelect={handleFileSelect} />
                            </div>
                            <button className='primary-button' type="submit">
                                Analyze Resume
                            </button>
                        </form>
                    )}
            </div>
        </section>
    </main>
  )
}

export default MatchJD