import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router";
import { usePuterStore } from "~/lib/puter";
import { generateUUID } from "~/lib/utils";
import gsap from "gsap";

interface Job {
  id: string;
  title: string;
  company: string;
  description: string;
}

interface KVItem {
  key: string;
  value: string;
}

export default function AdminJobs() {
  const { auth, kv, isAdmin, isLoading } = usePuterStore();
  const navigate = useNavigate();
  
  const [jobs, setJobs] = useState<Job[]>([]); 
  const [title, setTitle] = useState("");
  const [company, setCompany] = useState("");
  const [description, setDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Refs for GSAP animations
  const pageRef = useRef(null);
  const formRef = useRef(null);
  const jobsListRef = useRef(null);
  const titleRef = useRef(null);
  const formTitleRef = useRef(null);
  const jobsTitleRef = useRef(null);

  // Check admin
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

  // GSAP Animations
  useEffect(() => {
    if (isLoading || !auth.isAuthenticated || !isAdmin) return;

    const tl = gsap.timeline();
    
    tl.fromTo(pageRef.current,
      { opacity: 0 },
      { opacity: 1, duration: 0.8, ease: "power2.out" }
    )
    .fromTo(titleRef.current,
      { y: 30, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.6, ease: "back.out(1.2)" },
      "-=0.3"
    )
    .fromTo(formRef.current,
      { y: 40, opacity: 0, scale: 0.95 },
      { y: 0, opacity: 1, scale: 1, duration: 0.7, ease: "power2.out" },
      "-=0.4"
    )
    .fromTo(formTitleRef.current,
      { y: 20, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.5, ease: "power2.out" },
      "-=0.5"
    )
    .fromTo(jobsTitleRef.current,
      { y: 20, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.5, ease: "power2.out" },
      "-=0.3"
    )
    .fromTo(jobsListRef.current,
      { y: 30, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.6, ease: "power2.out" },
      "-=0.4"
    );

    return () => {
      tl.kill();
    };
  }, [isLoading, auth.isAuthenticated, isAdmin]);

  // Submit form
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !company || !description) {
      alert("Please fill in all fields.");
      return;
    }

    setIsSubmitting(true);
    const jobId = generateUUID();
    const jobData = { title, company, description }; 

    try {
      await kv.set(`job:${jobId}`, JSON.stringify(jobData));
      
      // Animation for success
      const tl = gsap.timeline();
      tl.to(formRef.current, {
        backgroundColor: "#f0fdf4",
        duration: 0.3,
        ease: "power2.out"
      }).to(formRef.current, {
        backgroundColor: "#ffffff",
        duration: 0.3,
        ease: "power2.out",
        onComplete: () => {
          alert("Job created successfully!");
          setTitle("");
          setCompany("");
          setDescription("");
          loadJobs();
          setIsSubmitting(false);
        }
      });
    } catch (err) {
      alert("Error creating job: " + (err as Error).message);
      setIsSubmitting(false);
    }
  };
  
  const handleDeleteJob = async (jobId: string) => {
    if (!window.confirm("Are you sure you want to delete this job?")) return;
    
    try {
      // Animation for deletion
      const jobElement = document.getElementById(`job-${jobId}`);
      if (jobElement) {
        gsap.to(jobElement, {
          x: -100,
          opacity: 0,
          height: 0,
          marginBottom: 0,
          paddingTop: 0,
          paddingBottom: 0,
          duration: 0.4,
          ease: "power2.in",
          onComplete: () => {
             kv.delete(`job:${jobId}`).then(() => loadJobs());
          }
        });
      } else {
        await kv.delete(`job:${jobId}`);
        loadJobs();
      }
    } catch (err) {
      alert("Error deleting job: " + (err as Error).message);
    }
  };

  const animateJobItem = (element: HTMLElement) => {
    gsap.fromTo(element,
      { y: 20, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.5, ease: "power2.out" }
    );
  };

  if (isLoading) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="pt-32 pb-16 text-center">
          <div className="flex justify-center items-center gap-3">
            <div className="w-6 h-6 border-2 border-gray-800 border-t-transparent rounded-full animate-spin"></div>
            <h1 className="text-2xl font-semibold text-gray-800">Loading...</h1>
          </div>
        </div>
      </main>
    );
  }
  
  if (!isAdmin) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="pt-32 pb-16 text-center">
          <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md mx-auto border border-gray-200">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h1>
            <p className="text-gray-600">You don't have permission to access this page.</p>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main ref={pageRef} className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <section className="main-section pt-16 md:pt-24 pb-10 md:pb-16">
        <div className="container mx-auto px-4 max-w-6xl">
          {/* Page Header */}
          <div className="text-center mb-8 md:mb-12">
            <h1
              ref={titleRef}
              className="text-4xl md:text-5xl font-bol bg-clip-text text-transparent mb-4"
            >
              Job Management
            </h1>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto">
              Create and manage job listings for your career platform
            </p>
          </div>

          <div 
            ref={formRef}
            className="bg-white w-full rounded-2xl shadow-xl border border-gray-200 p-6 md:p-8 mb-8 md:mb-12"
          >
            <h2
              ref={formTitleRef}
              className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3"
            >
          
              Add New Job
            </h2>
            
            <form onSubmit={handleSubmit} className="space-y-6 ">
              <div className="flex flex-col md:flex-row w-full gap-6 md:gap-10">
                <div className="space-y-2">
                  <label htmlFor="company-name" className="block text-sm font-semibold text-gray-700">
                    Company Name *
                  </label>
                  <input 
                    type="text" 
                    value={company} 
                    onChange={(e) => setCompany(e.target.value)} 
                    id="company-name" 
                    placeholder="Enter company name" 
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-gray-800 focus:border-transparent transition-all duration-200 bg-gray-50"
                    required 
                  />
                </div>
                
                <div className="space-y-2">
                  <label htmlFor="job-title" className="block text-sm font-semibold text-gray-700">
                    Job Title *
                  </label>
                  <input 
                    type="text" 
                    value={title} 
                    onChange={(e) => setTitle(e.target.value)} 
                    id="job-title" 
                    placeholder="Enter job title" 
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-gray-800 focus:border-transparent transition-all duration-200 bg-gray-50"
                    required 
                  />
                </div>
              </div>
              
              <div className="space-y-2 w-full">
                <label htmlFor="job-description" className="block text-sm font-semibold text-gray-700">
                  Job Description *
                </label>
                <textarea 
                  rows={5} 
                  value={description} 
                  onChange={(e) => setDescription(e.target.value)} 
                  id="job-description" 
                  placeholder="Enter job description, requirements, and skills needed..." 
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-gray-800 focus:border-transparent transition-all duration-200 bg-gray-50 resize-vertical"
                  required 
                />
              </div>
              
              <button 
                type="submit" 
                disabled={isSubmitting}
                className="w-full bg-gradient-to-r from-gray-900 to-gray-800 text-white py-4 px-6 rounded-xl font-semibold hover:shadow-lg transition-all duration-200 transform hover:scale-[1.02] disabled:opacity-50 disabled:transform-none disabled:hover:shadow-none"
              >
                {isSubmitting ? (
                  <div className="flex items-center justify-center gap-3">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Creating Job...
                  </div>
                ) : (
                  "Create Job Listing"
                )}
              </button>
            </form>
          </div>

          {/* Jobs List */}
          <div ref={jobsListRef}>
            <h2 
              ref={jobsTitleRef}
              className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3"
            >
              <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Existing Job Listings ({jobs.length})
            </h2>
            
            <div className="space-y-4">
              {jobs.length === 0 ? (
                <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-12 text-center">
                  <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-700 mb-2">No Jobs Yet</h3>
                  <p className="text-gray-500 max-w-sm mx-auto">
                    Get started by creating your first job listing using the form above.
                  </p>
                </div>
              ) : (
                jobs.map((job, index) => (
                  <div
                    key={job.id}
                    id={`job-${job.id}`}
                    ref={(el: HTMLDivElement | null) => { if (el) animateJobItem(el); }}
                    className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 hover:shadow-xl transition-all duration-300 group"
                  >
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                      <div className="flex-1">
                        <h3 className="text-xl font-bold text-gray-900 group-hover:text-gray-700 transition-colors">
                          {job.title}
                        </h3>
                        <div className="flex items-center gap-2 mt-2">
                          <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                          </svg>
                          <p className="text-gray-600 font-medium">{job.company}</p>
                        </div>
                        <p className="text-gray-500 mt-3 line-clamp-2">{job.description}</p>
                      </div>
                      
                      <button 
                        onClick={() => handleDeleteJob(job.id)}
                        className="bg-red-50 text-red-600 px-4 py-2 rounded-lg hover:bg-red-100 transition-all duration-200 flex items-center gap-2 group/delete font-semibold"
                      >
                        <svg className="w-4 h-4 group-hover/delete:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                        Delete
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}