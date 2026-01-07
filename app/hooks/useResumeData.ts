import { useState, useEffect } from 'react';
import { usePuterStore } from '~/lib/puter';

export const useResumeData = (id: string | undefined) => {
    const { kv, fs, ai } = usePuterStore();
    const [resumeData, setResumeData] = useState<Resume | null>(null);
    const [resumeUrl, setResumeUrl] = useState<string | null>(null);
    const [imageUrl, setImageUrl] = useState<string | null>(null);
    const [feedback, setFeedback] = useState<Feedback | null>(null);
    const [resumeText, setResumeText] = useState<string>('');
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const loadResume = async () => {
            if (!id || !kv || !fs) return;

            let resumeBlob: Blob | null = null;
            setIsLoading(true);
            setError(null);

            try {
                console.log('📖 Loading resume with ID:', id);
                const resume = await kv.get(`resume-${id}`);
                console.log('📦 Resume data from KV:', resume);

                if (!resume) {
                    console.warn('⚠️ Resume not found');
                    setError('Resume not found');
                    return;
                }

                // Dùng kiểu 'Resume' global
                const data = JSON.parse(resume) as Resume;
                console.log('✅ Parsed resume data:', data);

                // Lưu toàn bộ data vào state
                setResumeData(data);
                setFeedback(data.feedback);

                setResumeData(data);
                setFeedback(data.feedback);

                resumeBlob = (await fs.read(data.resumePath)) || null;
                if (!resumeBlob) {
                    console.warn('⚠️ Resume blob not found');
                } else {
                    const pdfBlob = new Blob([resumeBlob], { type: 'application/pdf' });
                    const url = URL.createObjectURL(pdfBlob);
                    setResumeUrl(url);
                    console.log('📄 PDF URL created:', url);
                }

                const imageBlob = await fs.read(data.imagePath);
                if (!imageBlob) {
                    console.warn('⚠️ Image blob not found');
                } else {
                    const url = URL.createObjectURL(imageBlob);
                    setImageUrl(url);
                    console.log('🖼️ Image URL created:', url);
                }

            } catch (err) {
                console.error('Error loading resume:', err);
                setError((err as Error).message);
            } finally {
                setIsLoading(false);
            }

            // Background Task: Extract text for chat (Non-blocking)
            if (resumeBlob) {
                try {
                    const text = await ai.img2txt(resumeBlob);
                    if (text) {
                        setResumeText(text);
                        console.log('📝 Resume text extracted for chat (Background)');
                    }
                } catch (err) {
                    console.warn('⚠️ Could not extract resume text (Background):', err);
                }
            }
        }

        loadResume();

        // Cleanup URLs to avoid memory leaks
        return () => {
            if (resumeUrl) URL.revokeObjectURL(resumeUrl);
            if (imageUrl) URL.revokeObjectURL(imageUrl);
        };
    }, [id, kv, fs, ai]);

    return { resumeData, resumeUrl, imageUrl, feedback, resumeText, isLoading, error };
};
