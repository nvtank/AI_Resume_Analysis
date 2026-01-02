import { useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router';
import { usePuterStore } from '~/lib/puter';
import gsap from 'gsap';
import { FaRightFromBracket, FaRightToBracket, FaSpinner } from 'react-icons/fa6';

export const meta = () => ([
    { title: "Resumind - Auth" },
    { name: "description", content: "Login to your account" },
]);

const Auth = () => {
    const { isLoading, auth } = usePuterStore();
    const location = useLocation();
    const next = location.search.split('next=')[1];
    const navigate = useNavigate();
    
    const containerRef = useRef(null);
    const cardRef = useRef(null);
    const titleRef = useRef(null);
    const subtitleRef = useRef(null);
    const buttonRef = useRef(null);

    useEffect(() => {
        if (auth.isAuthenticated) navigate(next || '/');
    }, [auth.isAuthenticated, next, navigate]);

    useEffect(() => {
        const tl = gsap.timeline();
        
        tl.fromTo(containerRef.current, 
            { opacity: 0 },
            { opacity: 1, duration: 0.8, ease: "power2.out" }
        )
        .fromTo(cardRef.current,
            { y: 50, opacity: 0, scale: 0.9 },
            { y: 0, opacity: 1, scale: 1, duration: 0.8, ease: "back.out(1.7)" },
            "-=0.3"
        )
        .fromTo(titleRef.current,
            { y: 20, opacity: 0 },
            { y: 0, opacity: 1, duration: 0.6, ease: "power2.out" },
            "-=0.4"
        )
        .fromTo(subtitleRef.current,
            { y: 20, opacity: 0 },
            { y: 0, opacity: 1, duration: 0.6, ease: "power2.out" },
            "-=0.5"
        )
        .fromTo(buttonRef.current,
            { y: 20, opacity: 0 },
            { y: 0, opacity: 1, duration: 0.6, ease: "power2.out" },
            "-=0.4"
        );

        return () => {
            tl.kill();
        };
    }, []);

    const handleButtonClick = () => {
        if (!isLoading) {
            const tl = gsap.timeline();
            tl.to(buttonRef.current, {
                scale: 0.95,
                duration: 0.1,
                ease: "power2.in"
            }).to(buttonRef.current, {
                scale: 1,
                duration: 0.1,
                ease: "power2.out",
                onComplete: () => {
                    if (auth.isAuthenticated) {
                        auth.signOut();
                    } else {
                        auth.signIn();
                    }
                }
            });
        }
    };

    return (
        <main 
            ref={containerRef}
            className="h-screen bg-white flex items-center justify-center"
        >
            <div className="relative">
                <div className="absolute -inset-4 bg-gradient-to-r from-black to-gray-800 rounded-2xl opacity-5 blur-xl"></div>
                
                <div 
                    ref={cardRef}
                    className="relative bg-white rounded-4xl shadow-2xl border border-gray-100 p-8 w-full max-w-md overflow-hidden"
                >
                    <div className="absolute inset-0 bg-gradient-to-r from-black via-gray-800 to-black opacity-0 hover:opacity-5 transition-opacity duration-500"></div>
                    
                    <section className="flex flex-col gap-8 relative z-10">
                        <div className="flex flex-col items-center gap-4 text-center">
     
                            <div ref={titleRef}>
                                <h1 className="text-3xl font-bold bg-gradient-to-r from-black to-gray-700 bg-clip-text text-transparent">
                                    RESUME
                                </h1>
                            </div>
                            
                            <div ref={subtitleRef}>
                                <h2 className="text-gray-600 text-lg font-light">
                                    Continue your professional journey
                                </h2>
                            </div>
                        </div>

                        <div className="flex flex-col gap-4">
                            {isLoading ? (
                                <div
                                    ref={buttonRef}
                                    className="w-full bg-gray-800 text-white py-4 px-6 rounded-xl font-semibold transition-all duration-200 flex items-center justify-center"
                                >
                                    <div className="flex items-center gap-3">
                                        <FaSpinner className="w-5 h-5 animate-spin" />
                                        <span>Signing you in...</span>
                                    </div>
                                </div>
                            ) : (
                                <>
                                    {auth.isAuthenticated ? (
                                        <button 
                                            ref={buttonRef}
                                            className="w-full bg-gradient-to-r from-gray-800 to-black text-white py-4 px-6 rounded-xl font-semibold hover:shadow-lg transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98]"
                                            onClick={handleButtonClick}
                                        >
                                            <div className="flex items-center justify-center gap-2">
                                                <FaRightFromBracket className="w-5 h-5" />
                                                Log Out
                                            </div>
                                        </button>
                                    ) : (
                                        <button 
                                            ref={buttonRef}
                                            className="w-full bg-gradient-to-r from-black to-gray-800 text-white py-4 px-6 rounded-xl font-semibibold hover:shadow-lg transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98]"
                                            onClick={handleButtonClick}
                                        >
                                            <div className="flex cursor-pointer items-center justify-center gap-2">
                                                <FaRightToBracket className="w-5 h-5" />
                                                Sign In to Continue
                                            </div>
                                        </button>
                                    )}
                                </>
                            )}
                        </div>

                        {/* Footer text */}
                        <div className="text-center">
                            <p className="text-gray-500 text-sm">
                                Secure authentication • Professional platform
                            </p>
                        </div>
                    </section>
                </div>
            </div>
        </main>
    );
};

export default Auth;