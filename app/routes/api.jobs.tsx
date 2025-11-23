// API route to fetch jobs from RapidAPI
import type { LoaderFunctionArgs } from 'react-router';
import { fetchJobsFromRapidAPI } from '~/lib/jobs-api';

export async function loader({ request }: LoaderFunctionArgs) {
  const url = new URL(request.url);
  const query = url.searchParams.get('query') || 'software developer';
  const numPages = parseInt(url.searchParams.get('pages') || '1', 10);

  try {
    const jobs = await fetchJobsFromRapidAPI(query, numPages);
    return Response.json({ jobs, success: true });
  } catch (error) {
    console.error('Error in jobs API route:', error);
    return Response.json(
      { 
        jobs: [], 
        success: false, 
        error: (error as Error).message 
      }, 
      { status: 500 }
    );
  }
}
