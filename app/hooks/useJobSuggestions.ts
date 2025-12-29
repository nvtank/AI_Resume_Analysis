import { useState } from 'react';
import { usePuterStore } from '~/lib/puter';
import { fetchJobs, type ExternalJob } from '~/lib/jobs-api';
import { JOB_SUGGESTION_PROMPT } from '~/lib/prompts';

export const useJobSuggestions = () => {
    const { ai } = usePuterStore();
    const [isSuggesting, setIsSuggesting] = useState(false);
    const [suggestedJobs, setSuggestedJobs] = useState<ExternalJob[]>([]);
    const [error, setError] = useState<string | null>(null);

    const suggestJobs = async (feedback: Feedback | null) => {
        if (!feedback) {
            alert("Dữ liệu feedback CV chưa sẵn sàng.");
            return;
        }

        setIsSuggesting(true);
        setSuggestedJobs([]);
        setError(null);

        try {
            // 1. Tạo query từ CV
            const cvSkills = feedback.skills?.tips?.map(tip => tip.tip).join(', ') || "Không có kỹ năng";

            // Tạo query tìm kiếm dựa trên CV (lấy skill đầu tiên)
            const firstSkill = cvSkills.split(',')[0]?.trim() || 'software';
            const searchQuery = `${firstSkill} developer`.trim();

            // 2. Gọi API để lấy jobs thật từ RapidAPI
            const allJobs = await fetchJobs(searchQuery);

            if (!allJobs || allJobs.length === 0) {
                alert("Không tìm thấy job phù hợp từ RapidAPI.");
                setIsSuggesting(false);
                return;
            }

            // 3. Dùng AI để chọn top 3 jobs phù hợp nhất
            const prompt = JOB_SUGGESTION_PROMPT(cvSkills, JSON.stringify(allJobs.slice(0, 10)));

            // 4. Gọi AI
            const response = await ai.chat(prompt);
            if (!response) {
                throw new Error("AI không trả về phản hồi");
            }

            const content = typeof response.message.content === 'string'
                ? response.message.content
                : response.message.content[0]?.text || '';

            // 5. Xử lý kết quả
            const jsonMatch = content.match(/\[.*?\]/);
            if (jsonMatch) {
                const suggestedIds = JSON.parse(jsonMatch[0]) as string[];
                const matchedJobs = allJobs.filter(job => suggestedIds.includes(job.id));
                setSuggestedJobs(matchedJobs.slice(0, 3));
            } else {
                // Nếu AI không trả về đúng format, lấy 3 job đầu tiên
                setSuggestedJobs(allJobs.slice(0, 3));
            }

        } catch (err) {
            console.error(err);
            setError((err as Error).message);
            alert("Lỗi khi gợi ý việc làm: " + (err as Error).message);
        } finally {
            setIsSuggesting(false);
        }
    };

    return { suggestedJobs, isSuggesting, error, suggestJobs };
};
