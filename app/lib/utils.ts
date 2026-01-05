import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Format file size in bytes to a human-readable string.
 * @param {number} bytes - The file size in bytes.
 * @returns {string} - The formatted file size string.
 */
export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export const formatSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';

    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

export const generateUUID = () => crypto.randomUUID();

export const parseAIResponse = <T>(text: string): T | null => {
    try {
        // First try to parse directly
        return JSON.parse(text);
    } catch (e) {
        // If it fails, try to find the JSON object string
        // This regex looks for the first { and the last } in the string
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
            try {
                return JSON.parse(jsonMatch[0]);
            } catch (e2) {
                console.error("Failed to parse extracted JSON:", e2);
            }
        }

        console.error("Failed to parse AI response:", e);
        return null;
    }
};
