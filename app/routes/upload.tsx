import React, { useState } from 'react'
import FileUploader from '~/components/FileUploader';
import Navbar from '~/components/Navbar'

const FileUploaderTyped = FileUploader as React.ComponentType<{
  onFileSelect: (file: File | null) => void
}>;

const Upload = () => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [statusText, setStatusText] = useState('');
  const [file, setFile] = useState<File | null>(null);

  const handleFileSelect = (file: File | null) => {
    setFile(file);
  }
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {

  }

  return (
    <main className='bg-[url("/images/bg-main.svg")] bg-cover'>
        <Navbar />
        <section className='main-section'>
            <div className='page-heading py-16'>
                <h1>Smart feedback for your dream job</h1>
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

export default Upload