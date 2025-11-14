import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import Navbar from "~/components/Navbar"; 
import { usePuterStore } from "~/lib/puter";
import { generateUUID } from "~/lib/utils"; 

export default function AdminJobs() {
  const { auth, kv, isAdmin, isLoading } = usePuterStore();
  const navigate = useNavigate();
  

  const [jobs, setJobs] = useState<Job[]>([]); 
  
  const [title, setTitle] = useState("");
  const [company, setCompany] = useState("");
  const [description, setDescription] = useState("");

  // check admin
  useEffect(() => {
    if (!isLoading && !auth.isAuthenticated) {
      navigate("/auth?next=/admin/jobs");
    }
  }, [isLoading, auth.isAuthenticated, navigate]);

  const loadJobs = async () => {
    if (!kv) return;
    try {
      const jobItems = (await kv.list("job:*", true)) as KVItem[];
      const parsedJobs = jobItems.map(({ key, value }): Job => {
        const id = key.split(":")[1];
        const data = JSON.parse(value);
    
        return { id, ...data }; 
      });
      setJobs(parsedJobs.reverse()); 
    } catch (err) {
      console.error("Error:", err);
    }
  };

  useEffect(() => {
    loadJobs();
  }, [kv]); 

  // submit form
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !company || !description) {
      alert("Please fill in all fields.");
      return;
    }

    const jobId = generateUUID();
    const jobData = { title, company, description }; 

    try {
      await kv.set(`job:${jobId}`, JSON.stringify(jobData));
      alert("Job created successfully!");
      setTitle("");
      setCompany("");
      setDescription("");
      loadJobs();
    } catch (err) {
      alert("Error creating job: " + (err as Error).message);
    }
  };
  
  const handleDeleteJob = async (jobId: string) => {
    if (!window.confirm("Do you want to delete this job")) return;
    try {
      await kv.delete(`job:${jobId}`);
      alert("Job deleted successfully!");
      loadJobs(); 
    } catch (err) {
      alert("Error deleting job: " + (err as Error).message);
    }
  }

  if (isLoading) {
    return (
      <main className='bg-[url("/images/bg-main.svg")] bg-cover min-h-screen'>
        <Navbar />
        <div className="main-section page-heading py-16 text-center">
          <h1>Loading...</h1>
        </div>
      </main>
    );
  }
  
  if (!isAdmin) {
    return (
      <main className='bg-[url("/images/bg-main.svg")] bg-cover min-h-screen'>
        <Navbar />
        <div className="main-section page-heading py-16 text-center">
          <h1 className="text-red-500">Access Denied</h1>
          <h2>You don't have permission to access this page.</h2>
        </div>
      </main>
    );
  }

  return (
    <main className='bg-[url("/images/bg-main.svg")] bg-cover min-h-screen'>
      <Navbar />
      <section className='main-section'>
        <div className='page-heading py-16'>
          <h1 className="animate-in fade-in slide-in-from-bottom-4 duration-700">Admin page - manage jobs</h1>
          
          <form onSubmit={handleSubmit} className="flex flex-col gap-4 mt-8 bg-white/80 p-6 rounded-xl shadow-lg border border-gray-200">
            <h2 className="text-2xl font-bold mb-4">Add New Job</h2>
            <div className='form-div'>
                <label htmlFor="company-name">Company Name</label>
                <input type="text" value={company} onChange={(e) => setCompany(e.target.value)} id="company-name" placeholder="Tên công ty" name="company-name" required />
            </div>
            <div className='form-div'>
                <label htmlFor="job-title">Job Title</label>
                <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} id="job-title" placeholder="Job Title" name="job-title" required />
            </div>
            <div className='form-div'>
                <label htmlFor="job-description">Job Description</label>
                <textarea rows={4} value={description} onChange={(e) => setDescription(e.target.value)} id="job-description" placeholder="Job details (experience, skills..)" name="job-description" required />
            </div>
            <button className='primary-button' type="submit">
                Save Job
            </button>
          </form>

          <div className="mt-12">
            <h2 className="text-3xl font-bold mb-6">Existing Job List</h2>
            <div className="space-y-4">
              {jobs.length === 0 && (
                <div className="bg-white/80 p-6 rounded-xl text-center text-gray-600 shadow-md border border-gray-200">
                  <p>No jobs have been created yet.</p>
                </div>
              )}
              {jobs.map((job) => (
                <div key={job.id} className="bg-white/90 p-4 rounded-lg shadow-md flex justify-between items-center transition-all hover:shadow-lg">
                  <div>
                    <h3 className="text-lg font-bold text-gray-800">{job.title}</h3>
                    <p className="text-gray-600">{job.company}</p>
                  </div>
                  <button 
                    onClick={() => handleDeleteJob(job.id)}
                    className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 transition-colors text-sm font-semibold"
                  >
                    Delete
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}