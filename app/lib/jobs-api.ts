// Helper functions to fetch jobs from RapidAPI

export interface ExternalJob {
  id: string;
  title: string;
  company: string;
  location?: string;
  description?: string;
  url?: string;
  employmentType?: string;
  datePosted?: string;
}

/**
 * Fetch jobs from RapidAPI JSearch
 * This function should be called from server-side (loader/action) only
 */
export async function fetchJobsFromRapidAPI(
  query: string,
  numPages: number = 1
): Promise<ExternalJob[]> {
  const RAPIDAPI_KEY = process.env.RAPIDAPI_KEY;

  if (!RAPIDAPI_KEY) {
    throw new Error("RAPIDAPI_KEY is not set in environment variables");
  }

  const url = `https://jsearch.p.rapidapi.com/search?query=${encodeURIComponent(query)}&page=1&num_pages=${numPages}`;

  const options = {
    method: 'GET',
    headers: {
      'x-rapidapi-key': RAPIDAPI_KEY,
      'x-rapidapi-host': 'jsearch.p.rapidapi.com'
    }
  };

  try {
    const response = await fetch(url, options);

    if (!response.ok) {
      throw new Error(`RapidAPI request failed: ${response.status} ${response.statusText}`);
    }

    const result = await response.json();

    // Transform RapidAPI response to our format
    const jobs: ExternalJob[] = (result.data || []).map((job: any, index: number) => ({
      id: job.job_id || `job-${index}`,
      title: job.job_title || 'Untitled',
      company: job.employer_name || 'Unknown Company',
      location: job.job_city && job.job_country
        ? `${job.job_city}, ${job.job_country}`
        : job.job_country || 'Remote',
      description: job.job_description || job.job_highlights?.Qualifications?.[0] || 'No description',
      url: job.job_apply_link || job.job_google_link || '#',
      employmentType: job.job_employment_type || 'Full-time',
      datePosted: job.job_posted_at_datetime_utc || new Date().toISOString(),
    }));

    return jobs;
  } catch (error) {
    console.error('Error fetching jobs from RapidAPI:', error);
    throw error;
  }
}

/**
 * Client-side function to fetch jobs through our API route
 */
export async function fetchJobs(query: string = ''): Promise<ExternalJob[]> {
  const response = await fetch(`/api/jobs?query=${encodeURIComponent(query)}`);

  if (!response.ok) {
    throw new Error(`Failed to fetch jobs: ${response.status}`);
  }

  const data = await response.json();
  return data.jobs || [];
}
