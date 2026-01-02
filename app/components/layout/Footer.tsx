import React, { useEffect, useRef } from "react";
import { Link } from "react-router";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import {
  FaGithub,
  FaTwitter,
  FaLinkedin,
  FaArrowRight,
} from "react-icons/fa6";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

const Footer = () => {
  const currentYear = new Date().getFullYear();
  const footerRef = useRef<HTMLElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const titleContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.set(footerRef.current, { yPercent: 0 });
      gsap.set(contentRef.current, { y: 100, opacity: 0 });

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: footerRef.current,
          start: "top bottom", 
          end: "bottom bottom",
          scrub: 3,
        },
      });

      tl.to(contentRef.current, {
        y: 0,
        opacity: 1,
        ease: "power2.out",
      });

      // 2. Title Animation (Slide Up Text)
      const title = titleContainerRef.current?.querySelector("h1");
      if (title) {
          gsap.fromTo(title, 
            { yPercent: 100, rotateX: -20, opacity: 0 },
            { 
                yPercent: 0, 
                rotateX: 0, 
                opacity: 1, 
                duration: 2, 
                ease: "power4.out",
                scrollTrigger: {
                    trigger: footerRef.current,
                    start: "top 80%",
                }
            }
          );
      }

    }, footerRef);

    return () => ctx.revert();
  }, []);

  return (
    <footer
      ref={footerRef}
      className="w-full bg-black text-white overflow-hidden relative min-h-[50vh] flex flex-col justify-end rounded-t-[100px] mt-12"
    >
      <div 
        ref={contentRef}
        className="container mx-auto px-6 py-20 relative z-10"
      >
        {/* Giant Title Section */}
        <div className="border-b border-white/20 pb-12 mb-16">
             <div ref={titleContainerRef} className="overflow-hidden">
                <h1 className="text-[12vw] font-bold !text-white opacity-90 select-none">
                    RESUMIND
                </h1>
             </div>
             <div className="flex flex-col md:flex-row justify-between items-end mt-8 gap-8">
                 <p className="text-xl md:text-2xl !text-gray-400 font-light max-w-xl">
                    Crafting the future of career searching with precision AI analysis.
                 </p>
             </div>
        </div>

        {/* Links Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-10 text-sm md:text-base">
           <div className="space-y-6">
               <h4 className="text-gray-500 font-medium mb-4">PLATFORM</h4>
               <ul className="space-y-3">
                   <li><Link to="/analyze-cv" className="hover:text-gray-300 transition-colors block py-1">Resume Analysis</Link></li>
                   <li><Link to="/match-jd" className="hover:text-gray-300 transition-colors block py-1">Job Match</Link></li>
               </ul>
           </div>

           <div className="space-y-6">
               <h4 className="text-gray-500 font-medium mb-4">COMPANY</h4>
               <ul className="space-y-3">
                   <li><Link to="/about" className="hover:text-gray-300 transition-colors block py-1">Our Story</Link></li>
                   <li><Link to="/careers" className="hover:text-gray-300 transition-colors block py-1">Careers</Link></li>
                   <li><Link to="/contact" className="hover:text-gray-300 transition-colors block py-1">Contact</Link></li>
               </ul>
           </div>

           <div className="space-y-6">
               <h4 className="text-gray-500 font-medium mb-4">LEGAL</h4>
               <ul className="space-y-3">
                   <li><Link to="/privacy" className="hover:text-gray-300 transition-colors block py-1">Privacy Policy</Link></li>
                   <li><Link to="/terms" className="hover:text-gray-300 transition-colors block py-1">Terms of Service</Link></li>
               </ul>
           </div>
           
           <div className="space-y-6">
               <h4 className="text-gray-500 font-medium mb-4">FOLLOW US</h4>
               <div className="flex gap-4">
                  {[
                      { icon: <FaGithub />, link: "https://github.com/nvtank/AI_Resume_Analysis" },
                      { icon: <FaTwitter />, link: "https://twitter.com" },
                      { icon: <FaLinkedin />, link: "https://linkedin.com" }
                  ].map((social, idx) => (
                      <a 
                        key={idx}
                        href={social.link}
                        target="_blank" 
                        rel="noreferrer"
                        className="w-10 h-10 rounded-full border border-white/20 flex items-center justify-center hover:bg-white hover:text-black transition-all duration-300"
                      >
                          {social.icon}
                      </a>
                  ))}
               </div>
           </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-20 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-gray-500 uppercase tracking-wider">
            <p>© {currentYear} Resumind Inc.</p>
            <p>Designed by nvtank</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;


