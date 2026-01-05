import React, { useState, useEffect, useRef } from 'react'; // Thêm lại useState, useEffect, useRef
import { Link, useLocation, useNavigate } from 'react-router';
import { usePuterStore } from '~/lib/puter';

const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { auth, isLoading } = usePuterStore();

  const [isHidden, setIsHidden] = useState(false);
  const lastScrollY = useRef(0);

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      if (currentScrollY > lastScrollY.current && currentScrollY > 100) {
        setIsHidden(true);
      } else {
        setIsHidden(false);
      }

      lastScrollY.current = currentScrollY;
    };

    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []); 

  // Close mobile menu when route changes
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);
  
  const isActive = (path: string) => location.pathname === path;

  const handleLogout = async () => {
    try {
      await auth.signOut();
      navigate('/auth');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const navLinks = [
    { name: 'Jobs', path: '/jobs', color: 'green' },
    { name: 'Match JD', path: '/match-jd', color: 'purple' },
    { name: 'Analyze CV', path: '/analyze-cv', color: 'blue' },
  ];

  return (
    <>
      <nav
        className={`fixed top-4 left-1/2 -translate-x-1/2 z-50 
                  bg-white/90 backdrop-blur-xl shadow-lg rounded-full
                  transition-all duration-300 ease-in-out w-[60%] max-w-2xl
                  ${
                    isHidden
                      ? '-translate-y-24 opacity-0 pointer-events-none'
                      : 'translate-y-0 opacity-100'
                  }`}
      >
        <div className="flex items-center justify-between px-6 py-3">
          <Link to="/" className="flex items-center gap-2 group">
             {/* Logo text - visible on all screens */}
            <h2 className="text-xl md:text-xl font-extrabold bg-clip-text text-transparent bg-black group-hover:tracking-wide transition-all">
              RESUMIND
            </h2>
          </Link>

          {/* desktop Menu */}
          <div className="hidden md:flex items-center gap-6">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`relative font-semibold px-3 py-2 rounded-lg group transition-all ${
                  isActive(link.path)
                    ? `text-${link.color}-600`
                    : `text-gray-700 hover:text-${link.color}-600`
                }`}
              >
                {link.name}
                <span className={`absolute left-0 -bottom-0.5 h-0.5 w-0 bg-${link.color}-600 transition-all duration-300 group-hover:w-full pointer-events-none`}></span>
              </Link>
            ))}

            {!auth.isAuthenticated ? (
              <Link
                to="/auth"
                className="px-6 py-2.5 font-semibold rounded-full bg-black text-white shadow-md hover:shadow-lg hover:scale-105 transition-all"
              >
                {isLoading ? 'Loading...' : 'Login'}
              </Link>
            ) : (
              <div className="relative group">
                <button className="flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-full hover:bg-black hover:text-white transition-all duration-300 shadow-sm border border-gray-200">
                  <span className="font-semibold text-sm">
                    {auth.user?.username || 'User'}
                  </span>
                </button>

                <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-xl shadow-xl py-2 opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition-all duration-200 border border-gray-100">
                  <Link
                    to="/profile"
                    className="block px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                  >
                     <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                    Profile
                  </Link>

                  <button
                    onClick={handleLogout}
                     className="w-full text-left px-4 py-2.5 text-sm font-bold text-red-600 hover:bg-red-50 flex items-center gap-2"
                    disabled={isLoading}
                  >
                     <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
                    {isLoading ? '...' : 'Logout'}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button 
            className="md:hidden p-2 text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
             {isMobileMenuOpen ? (
               <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
             ) : (
               <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
             )}
          </button>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-40 bg-white/95 backdrop-blur-xl pt-24 px-6 animate-in slide-in-from-top-10 duration-200">
           <div className="flex flex-col gap-4">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`text-xl font-bold py-3 border-b border-gray-100 ${
                    isActive(link.path) ? `text-${link.color}-600` : 'text-gray-800'
                  }`}
                >
                  {link.name}
                </Link>
              ))}
              
              {!auth.isAuthenticated ? (
                <Link
                  to="/auth"
                  className="mt-4 w-full py-4 text-center font-bold text-white bg-black rounded-xl"
                >
                  Login
                </Link>
              ) : (
                <>
                  <Link
                    to="/profile"
                    className="text-xl font-bold py-3 border-b border-gray-100 text-gray-800"
                  >
                    Profile ({auth.user?.username})
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="text-xl font-bold py-3 text-red-600 text-left"
                  >
                    Logout
                  </button>
                </>
              )}
           </div>
        </div>
      )}
    </>
  );
};

export default Navbar;