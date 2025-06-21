import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'react-hot-toast';

const DashboardNavBar = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    // TODO: Implement logout logic here
    // Clear user session/token
   localStorage.removeItem('token');
  localStorage.removeItem('user');
    toast.success('Logged out successfully!');
      navigate('/');
  };

  const isActiveLink = (path) => {
    return location.pathname === path ? 'text-blue-600' : 'text-gray-600 hover:text-blue-600';
  };

  return (
    <nav className="bg-white shadow-lg fixed w-full top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Left side - Navigation Links */}
          <div className="hidden md:flex items-center space-x-8">
            <Link
              to="/marketplace"
              className={`font-medium transition-colors ${isActiveLink('/marketplace')}`}
            >
              Marketplace
            </Link>
            <Link
              to="/doubt"
              className={`font-medium transition-colors ${isActiveLink('/doubt')}`}
            >
              Doubtplace
            </Link>
            <Link
              to="/profile"
              className={`font-medium transition-colors ${isActiveLink('/explore')}`}
            >
              Profile
            </Link>
          </div>

          {/* Center - Logo */}
          <Link to="/explore" className="text-2xl font-bold text-blue-600">
            SkillHub
          </Link>

          {/* Right side - Profile & Logout */}
          <div className="flex items-center space-x-6">
            <Link
              to="/profile"
              className="flex items-center space-x-1 text-gray-600 hover:text-blue-600 transition-colors"
            >
              <div className="relative">
                <svg
                  className="w-8 h-8"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                  />
                </svg>
                {/* Achievement badge indicator */}
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-yellow-400 rounded-full border-2 border-white" />
              </div>
            </Link>
            
            <button
              onClick={handleLogout}
              className="flex items-center space-x-1 text-gray-600 hover:text-red-600 transition-colors"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default DashboardNavBar; 