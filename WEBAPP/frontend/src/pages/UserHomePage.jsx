import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Navbar from '../components/ui/Navbar';
import axios from '../utils/axios.js';

const RecentActivities = () => {
  console.log("reached user page");
  const navigate = useNavigate();
  const [activities, setActivities] = useState([]);

  useEffect(() => {
    const fetchAndUpdateActivities = async () => {
      try {
        console.log("calling route to fetch activity");
        const response = await axios.get("/api/me/getRecentActivity");
        setActivities(response.data.recentActivity);
        console.log("got activities");
      } catch (error) {
        console.error('Error while getting user details or updating activities:', error);
        localStorage.clear();
        navigate('/login', { replace: true });
      }
    };

    fetchAndUpdateActivities();
  }, [navigate]);

  return (
    <div className="bg-white rounded-2xl shadow-md p-6 mb-10">
      <h2 className="text-2xl font-semibold mb-4 text-gray-800">Recent Activities</h2>
      <div className="flex space-x-4 overflow-x-auto pb-2">
        {activities.map((activity, index) => (
          <div
            key={index}
            className="flex-shrink-0 w-64 bg-gray-50 rounded-lg p-4 hover:shadow-lg transition-shadow border"
          >
            <p className="text-gray-800 font-medium">{activity.activity}</p>
            <span className="text-sm text-gray-500">{activity.time}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

const FeatureCard = ({ title, description, icon, linkTo, color, bgColor }) => (
  <Link
    to={linkTo}
    className={`group bg-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 overflow-hidden`}
  >
    <div className={`${bgColor} h-20 flex items-center justify-center`}>
      <span className="text-4xl text-white">{icon}</span>
    </div>
    <div className="p-6">
      <h3 className={`text-xl font-bold mb-2 text-${color}-600`}>{title}</h3>
      <p className="text-gray-600 mb-4 text-sm min-h-[60px]">{description}</p>
      <div className={`flex items-center font-semibold text-${color}-500 group-hover:text-${color}-700 transition-colors`}>
        <span>Explore Now</span>
        <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
        </svg>
      </div>
    </div>
  </Link>
);

const UserHomePage = () => {
  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />
      <div className="container mx-auto px-4 py-8 pt-20">
        <h1 className="text-4xl font-bold text-gray-800 mb-2">Welcome Back!</h1>
        <p className="text-gray-600 mb-8">Continue your learning journey and explore new opportunities.</p>

        <RecentActivities />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <FeatureCard
            title="Course Marketplace"
            description="Browse and enroll in courses to enhance your expertise or share your knowledge by creating your own."
            icon="🎓"
            linkTo="/marketplace"
            color="blue"
            bgColor="bg-blue-500"
          />
          <FeatureCard
            title="Doubtplace"
            description="Ask doubts, help others, and earn SkillCoins."
            icon="💬"
            linkTo="/doubt"
            color="green"
            bgColor="bg-green-500"
          />
        </div>
      </div>
    </div>
  );
};

export default UserHomePage;
