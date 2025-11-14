import { usePuterStore } from "~/lib/puter";
import { useEffect, useRef } from 'react';
import gsap from 'gsap';

export default function MakeMeAdmin() {
  const { auth, kv, isAdmin } = usePuterStore();
  const containerRef = useRef(null);
  const titleRef = useRef(null);
  const contentRef = useRef(null);
  const buttonRef = useRef(null);

  useEffect(() => {
    const tl = gsap.timeline();
    
    tl.fromTo(containerRef.current,
      { opacity: 0, y: 20 },
      { opacity: 1, y: 0, duration: 0.8, ease: "power2.out" }
    )
    .fromTo(titleRef.current,
      { y: 30, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.6, ease: "back.out(1.2)" },
      "-=0.4"
    )
    .fromTo(contentRef.current,
      { y: 20, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.5, ease: "power2.out" },
      "-=0.3"
    )
    .fromTo(buttonRef.current,
      { y: 20, opacity: 0, scale: 0.9 },
      { y: 0, opacity: 1, scale: 1, duration: 0.5, ease: "power2.out" },
      "-=0.4"
    );

    return () => {
      tl.kill();
    };
  }, []);

  const handleMakeAdmin = async () => {
    if (auth.isAuthenticated && auth.user) {
      try {
        // Animation khi click
        const tl = gsap.timeline();
        tl.to(buttonRef.current, {
          scale: 0.95,
          duration: 0.1,
          ease: "power2.in"
        }).to(buttonRef.current, {
          scale: 1,
          duration: 0.1,
          ease: "power2.out"
        });

        // Thực hiện set admin role
        await kv.set(`user-role:${auth.user.username}`, "admin");
        
        // Success animation
        gsap.to(buttonRef.current, {
          backgroundColor: "#10b981",
          color: "#ffffff",
          duration: 0.3,
          onComplete: () => {
            alert("Successfully made you an Admin!");
            window.location.reload(); // Tải lại trang để 'checkAuthStatus' 
          }
        });
      } catch (e) {
        alert("Error: " + (e as Error).message);
      }
    } else {
      alert("You must be logged in to become an Admin.");
    }
  };

  if (isAdmin) {
    return (
      <div 
        ref={containerRef}
        className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-8"
      >
        <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 p-12 max-w-md w-full text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Admin Access Granted</h1>
          <p className="text-gray-600 mb-2">You already have administrator privileges.</p>
          <p className="text-gray-500 text-sm">Username: <span className="font-mono text-gray-700">{auth.user?.username}</span></p>
        </div>
      </div>
    );
  }

  return (
    <div 
      ref={containerRef}
      className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-8"
    >
      <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 p-12 max-w-md w-full">
        {/* Header Icon */}
        <div className="w-20 h-20 bg-gradient-to-br from-gray-900 to-gray-700 rounded-2xl flex items-center justify-center mx-auto mb-6">
          <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
        </div>

        {/* Title */}
        <h1 
          ref={titleRef}
          className="text-3xl font-bold text-center bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent mb-4"
        >
          Admin Access
        </h1>

        {/* Content */}
        <div ref={contentRef} className="text-center mb-8">
          <p className="text-gray-600 mb-4 leading-relaxed">
            Request administrator privileges to access advanced features and management tools.
          </p>
          <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
            <p className="text-sm text-gray-500 mb-1">Current User</p>
            <p className="font-mono text-gray-800 font-semibold text-lg">{auth.user?.username}</p>
          </div>
        </div>

        {/* Features List */}
        <div className="mb-8 space-y-3">
          <div className="flex items-center gap-3 text-sm text-gray-600">
            <svg className="w-5 h-5 text-green-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <span>Full system access</span>
          </div>
          <div className="flex items-center gap-3 text-sm text-gray-600">
            <svg className="w-5 h-5 text-green-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <span>Job management capabilities</span>
          </div>
          <div className="flex items-center gap-3 text-sm text-gray-600">
            <svg className="w-5 h-5 text-green-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <span>User management tools</span>
          </div>
        </div>

        {/* Button */}
        <button 
          ref={buttonRef}
          onClick={handleMakeAdmin}
          className="w-full bg-gradient-to-r from-gray-900 to-gray-800 text-white py-4 px-6 rounded-xl font-semibold hover:shadow-lg transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
          disabled={!auth.isAuthenticated}
        >
          {auth.isAuthenticated ? (
            <div className="flex items-center justify-center gap-3">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
              Grant Admin Privileges
            </div>
          ) : (
            "Please Log In First"
          )}
        </button>

        {/* Footer Note */}
        <div className="mt-6 text-center">
          <p className="text-xs text-gray-500">
            Administrator privileges will be granted immediately upon confirmation.
          </p>
        </div>
      </div>
    </div>
  );
}