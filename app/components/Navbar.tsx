import React, { useState, useEffect, useRef } from 'react'; // Thêm lại useState, useEffect, useRef
import { Link, useLocation, useNavigate } from 'react-router';
import { usePuterStore } from '~/lib/puter';

const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { auth, isLoading } = usePuterStore();

  const [isHidden, setIsHidden] = useState(false);
  const lastScrollY = useRef(0);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      // Logic: Ẩn khi cuộn xuống (scrollY hiện tại > scrollY cũ)
      // Và chỉ ẩn khi đã cuộn qua một ngưỡng (ví dụ: 100px)
      if (currentScrollY > lastScrollY.current && currentScrollY > 100) {
        setIsHidden(true);
      } else {
        // Hiện khi cuộn lên
        setIsHidden(false);
      }

      // Cập nhật vị trí cuộn cuối cùng
      lastScrollY.current = currentScrollY;
    };

    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []); // Chỉ chạy 1 lần khi mount

  const isActive = (path: string) => location.pathname === path;

  const handleLogout = async () => {
    try {
      await auth.signOut();
      navigate('/auth');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <nav
      className={`fixed top-4 left-1/2 -translate-x-1/2 z-50 
                 bg-white/80 backdrop-blur-xl shadow-lg rounded-full
                 transition-all duration-300 ease-in-out
                 ${
                   isHidden
                     ? '-translate-y-24 opacity-0 pointer-events-none'
                     : 'translate-y-0 opacity-100'
                 }`}
    >
      <div className="flex items-center justify-between px-5 py-2">
        <Link to="/" className="flex items-center gap-2 group">
          <h1 className="text-2xl scale-50 font-extrabold bg-clip-text text-transparent group-hover:tracking-wide transition-all">
            RESUMIND
          </h1>
        </Link>
        <div className="flex items-center gap-6">
          <Link
            to="/match-jd"
            className={`relative font-semibold px-3 py-2 rounded-lg group transition-all ${
              isActive('/match-jd')
                ? 'text-purple-600'
                : 'text-gray-700 hover:text-purple-600'
            }`}
          >
            Match JD
            <span className="absolute left-0 -bottom-0.5 h-0.5 w-0 bg-purple-600 transition-all duration-300 group-hover:w-full pointer-events-none"></span>
          </Link>

          <Link
            to="/analyze-cv"
            className={`relative font-semibold px-3 py-2 rounded-lg group transition-all ${
              isActive('/analyze-cv')
                ? 'text-blue-600'
                : 'text-gray-700 hover:text-blue-600'
            }`}
          >
            Analyze CV
            <span className="absolute left-0 -bottom-0.5 h-0.5 w-0 bg-blue-600 transition-all duration-300 group-hover:w-full pointer-events-none"></span>
          </Link>

          {!auth.isAuthenticated ? (
            <Link
              to="/auth"
              className="px-5 py-2 font-semibold rounded-full bg-black  text-white shadow-md hover:shadow-lg hover:scale-105 transition-all"
            >
              {isLoading ? 'Loading...' : 'Login'}
            </Link>
          ) : (
            <div className="relative group">
              <button className="flex items-center gap-2 px-4 py-2 bg-gray-200 rounded-full duration-300 ease-in-out hover:bg-black transition-all shadow text-gray-800 hover:text-white transition-all duration-300 ease-in-out cursor-pointer">
                <span className="font-semibold">
                  {auth.user?.username || 'User'}
                </span>
              </button>

              <div className="absolute right-0  w-40 bg-white rounded-xl shadow-lg py-2 opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition-all duration-300">
                <Link
                  to="/profile"
                  className="block px-4 py-2 text-gray-700 hover:bg-gray-100"
                >
                  Profile
                </Link>

                <button
                  onClick={handleLogout}
                  className="w-full text-left px-4 py-2 font-bold text-red-600 hover:bg-red-50"
                  disabled={isLoading}
                >
                  {isLoading ? 'Logging out...' : 'Logout'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;