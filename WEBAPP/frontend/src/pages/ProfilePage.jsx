import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from '../utils/axios.js';
import CalendarHeatmap from 'react-calendar-heatmap';
import 'react-calendar-heatmap/dist/styles.css';
import Navbar from '../components/ui/Navbar.jsx';

const ProfilePage = () => {
  const navigate = useNavigate();

  const [userInfo, setUserInfo] = useState({ username: '', email: '' });
  const [stats, setStats] = useState({});
  const [activityHeatmap, setActivityHeatmap] = useState([]);
  const [recentActivity, setRecentActivity] = useState([]);
  const [earnings, setEarnings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        setIsLoading(true);
        const [userRes, statsRes, streakRes, activityRes, earningsRes] = await Promise.all([
          axios.get('/api/profileplace/userinfo'),
          axios.get('/api/profileplace/stats'),
          axios.get('/api/profileplace/streak'),
          axios.get('/api/profileplace/recent-activity'),
          axios.get('/api/profileplace/my-earnings'),
        ]);

        setUserInfo(userRes.data);
        setStats(statsRes.data);
        setActivityHeatmap(
          streakRes.data.map(entry => ({
            date: entry.date,
            count: Number(entry.count),
          }))
        );
        setRecentActivity(activityRes.data);
        setEarnings(earningsRes.data);
        setIsLoading(false);
      } catch (err) {
        console.error('Error fetching profile data:', err);
        setIsLoading(false);
        localStorage.clear();
        navigate('/login', { replace: true });
      }
    };

    fetchProfileData();
  }, [navigate]);


  return (
    <>
        {isLoading ? (
       <div className="flex justify-center items-center min-h-screen">
  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
</div>

    ) : (
    <div>
    <div>
      <Navbar />
      <div className="max-w-7xl mx-auto px-6 py-10 bg-white min-h-screen">
        {/* User Info */}
        <div className="pt-20 mb-10">
          <h1 className="text-3xl font-bold text-black mb-1">👤 {userInfo.username}</h1>
          <p className="text-gray-700">📧 {userInfo.email}</p>
          <p className="text-gray-700">🪙 Skill Coins: <strong>{userInfo.skillcoins}</strong></p>
        </div>

        {/* Combined Profile Stats + Heatmap */}
        <div className="bg-white shadow-lg rounded-2xl p-8 mb-10 border border-gray-100">
          <h2 className="text-2xl font-bold mb-8 text-gray-800 flex items-center gap-2">
            📊 Profile Stats & Activity
          </h2>

          <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
            {/* Left - Stats */}
            <div className="xl:col-span-2 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Courses Card */}
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-5 rounded-xl border border-blue-200">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-2xl">📘</span>
                    <h3 className="font-semibold text-blue-800">Courses</h3>
                  </div>
                  <div className="space-y-2 text-sm text-blue-700">
                    <div className="flex justify-between">
                      <span>Total:</span>
                      <span className="font-semibold">{stats.totalCourses}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>This Month:</span>
                      <span className="font-semibold">{stats.monthlyCourses}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Avg Rating:</span>
                      <span className="font-semibold">{stats.avgCourseRating}</span>
                    </div>
                  </div>
                </div>

                {/* Doubts Card */}
                <div className="bg-gradient-to-br from-pink-50 to-pink-100 p-5 rounded-xl border border-pink-200">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-2xl">❓</span>
                    <h3 className="font-semibold text-pink-800">Doubts Replied</h3>
                  </div>
                  <div className="space-y-2 text-sm text-pink-700">
                    <div className="flex justify-between">
                      <span>Total:</span>
                      <span className="font-semibold">{stats.totalDoubts}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>This Month:</span>
                      <span className="font-semibold">{stats.monthlyDoubts}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Avg Rating:</span>
                      <span className="font-semibold">{stats.avgDoubtRating}</span>
                    </div>
                  </div>
                </div>

                {/* Marketplace Earnings Card */}
                <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 p-5 rounded-xl border border-yellow-200">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-2xl">🛒</span>
                    <h3 className="font-semibold text-yellow-800">Marketplace</h3>
                  </div>
                  <div className="space-y-2 text-sm text-yellow-700">
                    <div className="flex justify-between">
                      <span>Lifetime:</span>
                      <span className="font-semibold">🪙{stats.lifetimeEarningsMarketplace}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>This Month:</span>
                      <span className="font-semibold">🪙{stats.monthlyEarningsMarketplace}</span>
                    </div>
                  </div>
                </div>

                {/* Doubt Earnings Card */}
                <div className="bg-gradient-to-br from-green-50 to-green-100 p-5 rounded-xl border border-green-200">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-2xl">💡</span>
                    <h3 className="font-semibold text-green-800">Doubt Earnings</h3>
                  </div>
                  <div className="space-y-2 text-sm text-green-700">
                    <div className="flex justify-between">
                      <span>Lifetime:</span>
                      <span className="font-semibold">🪙{stats.lifetimeEarningsDoubt}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>This Month:</span>
                      <span className="font-semibold">🪙{stats.monthlyEarningsDoubt}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right - Heatmap */}
            <div className="xl:col-span-1">
              <div className="bg-gradient-to-br from-gray-50 to-gray-100 p-5 rounded-xl border border-gray-200 h-full">
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-2xl">🔥</span>
                  <h3 className="font-semibold text-gray-800">Activity Streak</h3>
                </div>
                <div className="heatmap-container">
                  <style >{`
                    .heatmap-container .react-calendar-heatmap {
                      width: 100% !important;
                      max-width: 100% !important;
                    }
                    
                    .heatmap-container .react-calendar-heatmap svg {
                      width: 100% !important;
                      height: auto !important;
                      max-width: 100% !important;
                    }
                    
                    .heatmap-container .react-calendar-heatmap .react-calendar-heatmap-month-label {
                      font-size: 10px !important;
                      fill: #6B7280 !important;
                    }
                    
                    .heatmap-container .react-calendar-heatmap .react-calendar-heatmap-weekday-label {
                      font-size: 9px !important;
                      fill: #9CA3AF !important;
                    }
                    
                    .heatmap-container .react-calendar-heatmap .color-empty {
                      fill: #EBEDF0 !important;
                    }
                    
                    .heatmap-container .react-calendar-heatmap .color-scale-1 {
                      fill: #C6E48B !important;
                    }
                    
                    .heatmap-container .react-calendar-heatmap .color-scale-2 {
                      fill: #7BC96F !important;
                    }
                    
                    .heatmap-container .react-calendar-heatmap .color-scale-3 {
                      fill: #239A3B !important;
                    }
                    
                    .heatmap-container .react-calendar-heatmap .color-scale-4 {
                      fill: #196127 !important;
                    }
                  `}</style>
                  <CalendarHeatmap
                    startDate={new Date(new Date().setMonth(new Date().getMonth() - 3))}
                    endDate={new Date()}
                    values={activityHeatmap}
                    classForValue={(value) => {
                      if (!value || value.count === 0) return 'color-empty';
                      if (value.count === 1) return 'color-scale-1';
                      if (value.count === 2) return 'color-scale-2';
                      if (value.count >= 3) return 'color-scale-3';
                    }}
                    tooltipDataAttrs={(value) => {
                      if (!value || !value.date) return null;
                      return { 'data-tip': `${value.date}: ${value.count} contributions` };
                    }}
                    showWeekdayLabels={true}
                  />
                </div>
                <div className="mt-3 flex items-center justify-between text-xs text-gray-600">
                  <span>Less</span>
                  <div className="flex gap-1">
                    <div className="w-2 h-2 bg-gray-200 rounded-sm"></div>
                    <div className="w-2 h-2 bg-green-200 rounded-sm"></div>
                    <div className="w-2 h-2 bg-green-400 rounded-sm"></div>
                    <div className="w-2 h-2 bg-green-600 rounded-sm"></div>
                    <div className="w-2 h-2 bg-green-800 rounded-sm"></div>
                  </div>
                  <span>More</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Activity and Earnings */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Activity */}
          <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
            <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-4">
              <h2 className="text-xl font-semibold text-white flex items-center gap-2">
                🕒 Recent Activity
              </h2>
            </div>
            <div className="p-6 h-64 overflow-y-auto">
              {recentActivity.length === 0 ? (
                <div className="flex items-center justify-center h-full text-gray-500">
                  <div className="text-center">
                    <div className="text-4xl mb-2">📭</div>
                    <p>No activity yet</p>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  {recentActivity.map((item, idx) => (
                    <div key={idx} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg border-l-4 border-blue-400">
                      <div className="flex-1">
                        <div className="font-medium text-blue-600 text-sm">{item.type}</div>
                        <div className="text-gray-700 text-sm mt-1">{item.activity}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Earnings */}
          <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
            <div className="bg-gradient-to-r from-green-500 to-green-600 p-4">
              <h2 className="text-xl font-semibold text-white flex items-center gap-2">
                🪙 Earnings (Last 30 Days)
              </h2>
            </div>
            <div className="p-6 h-64 overflow-y-auto">
              {earnings.length === 0 ? (
                <div className="flex items-center justify-center h-full text-gray-500">
                  <div className="text-center">
                    <div className="text-4xl mb-2">💰</div>
                    <p>No earnings yet</p>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  {earnings.map((entry, idx) => (
                    <div key={idx} className="p-3 bg-green-50 border border-green-400 rounded-lg border-l-4">
                      <div className="text-green-700 text-sm font-medium">{entry}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>  )}
  </>
  );
};

export default ProfilePage;