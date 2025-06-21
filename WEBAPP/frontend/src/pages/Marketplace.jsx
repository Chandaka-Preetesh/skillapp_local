import React from 'react';
import Navbar from '../components/ui/Navbar';
import axios from '../utils/axios.js';
import  { useState, useEffect } from 'react';
import StarRating  from '../components/StarRating';
import { toast } from 'react-hot-toast';

import { useNavigate } from 'react-router-dom';

const Marketplace = () => {
    const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const [topics, setTopics] = useState([]);
  const [selectedTopic, setSelectedTopic] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showPostForm, setShowPostForm] = useState(false);
  const [purchasedCourses, setPurchasedCourses] = useState([]);
  const [myCourses, setMyCourses] = useState([]);
  const [skillCoins, setSkillCoins] = useState(0);
  
  // Form state
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    topicName: '',
    duration: '',
    price: ''
  });

  // Fetch all data on component mounting
console.log("market comporendering");
 useEffect(() => {
  const fetchAndUpdateMarketPlace = async () => {
    try {
      setIsLoading(true);

      const courseResponse = await axios.get('/api/marketplace/courses');
      const topicsResponse = await axios.get('/api/marketplace/topics');
     const purchaseResponse = await axios.get('/api/marketplace/purchases');
     const myCoursesResponse = await axios.get('/api/marketplace/my-courses');
    const skillCoinsResponse = await axios.get('/api/marketplace/skill-coins');

      setCourses(courseResponse.data);
      setTopics(topicsResponse.data);
     setPurchasedCourses(purchaseResponse.data);
      setMyCourses(myCoursesResponse.data);
    setSkillCoins(skillCoinsResponse.data.balance);
      console.log("response sent from api calls")
      console.log(courseResponse.data);
      console.log(topicsResponse.data);
      console.log(purchaseResponse.data);
      console.log(myCoursesResponse.data);
      console.log(skillCoinsResponse.data);
      setIsLoading(false);
    } catch (error) {
      console.error('Error while getting marketplace details or updating activities:', error);
      localStorage.clear();
      setIsLoading(false);
      navigate('/login', { replace: true });
    }
  };

  fetchAndUpdateMarketPlace();
}, [navigate]);

  // Filter courses by topic

  
  const filteredCourses = selectedTopic
    ? courses.filter(course => course.type=== selectedTopic)
    : courses;

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'price' ? parseFloat(value) || '' : value
    }));
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    const toastid=toast.loading('Adding your course...');
    try {
      const response = await axios.post('/api/marketplace/courses', formData);
      console.log("while submition")
      console.log(formData);
      setCourses(prev => [response.data, ...prev]);
      setMyCourses(prev => [response.data, ...prev]);
      setShowPostForm(false);
      setFormData({
        title: '',
        description: '',
        topicName: '',
        duration: '',
        price: ''
      });
      toast.success('Course added Successfully',{id:toastid});
    } catch (err) {
      console.error('Error creating course:', err);
      toast.error('Unable to add your course',{id:toastid});
      setError('Failed to create course. Please try again.');
    }
  };

  // Handle course purchase
 const handlePurchase = async (courseid) => {
  const loadingToastId = toast.loading('Processing your purchase...'); // Show loading

  try {
    const response = await axios.post(`/api/marketplace/courses/${courseid}/purchase`);

    // Update purchased courses list
    const purchasedCourse = courses.find(c => c.courseid === courseid);
    setPurchasedCourses(prev => [...prev, purchasedCourse]);

    // Update skill coins balance
    setSkillCoins(response.data.newBalance);

    toast.success('Course purchased successfully!', { id: loadingToastId }); // Replace loading with success
  } catch (err) {
    console.error('Error purchasing course:', err);

    if (err.response?.status === 400) {
      if (err.response.data.error.includes('Insufficient')) {
        toast.error('Insufficient SkillCoins to purchase this course', { id: loadingToastId });
      } else if (err.response.data.error.includes('own course')) {
        toast.error('You cannot purchase your own course.', { id: loadingToastId });
      } else if (err.response.data.error.includes('already purchased')) {
        toast.error('You have already purchased this course.', { id: loadingToastId });
      } else {
        toast.error(err.response.data.error || 'Unknown error', { id: loadingToastId });
      }
    } else {
      toast.error('Failed to purchase course. Please try again.', { id: loadingToastId });
    }
  }
};

  // Check if user is the creator of a course
  const isCreator = (course) => {
    return myCourses.some(myCourse => myCourse.userid === course.userid);
  };

  // Check if user has purchased a course
  const isPurchased = (course) => {
    return purchasedCourses.some(purchased => purchased.courseid=== course.courseid);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="container mx-auto px-4 py-8 pt-20">
        {/* Header with SkillCoins balance */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-800">Learning Marketplace</h1>
          <div className="flex items-center gap-4">
            <div className="bg-yellow-100 px-4 py-2 rounded-lg flex items-center">
              <span className="text-yellow-600 font-bold mr-2">🪙</span>
              <span className="font-semibold">{skillCoins} SkillCoins</span>
            </div>
            <button
              onClick={() => setShowPostForm(!showPostForm)}
              className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
            >
              {showPostForm ? 'Cancel' : 'Post New Course'}
            </button>
          </div>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        {/* Post Course Form */}
        {showPostForm && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <h2 className="text-xl font-semibold mb-4">Post a New Course</h2>
            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-gray-700 mb-2" htmlFor="title">
                    Title
                  </label>
                  <input
                    type="text"
                    id="title"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-gray-700 mb-2" htmlFor="topicName">
                    Topic
                  </label>
                  <select
                    id="topicName"
                    name="topicName"
                    value={formData.topicName}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="">Select a topic</option>
                    {topics.map( (topic ,index)=> (
                      <option key={index} value={topic.topic_name}>
                        {topic.topic_name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-gray-700 mb-2" htmlFor="duration">
                    Duration (e.g., "4 weeks", "2 hours","30 minutes")
                  </label>
                  <input
                    type="text"
                    id="duration"
                    name="duration"
                    value={formData.duration}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-gray-700 mb-2" htmlFor="price">
                    Price (SkillCoins)
                  </label>
                  <input
                    type="number"
                    id="price"
                    name="price"
                    min="0"
                    step="1"
                    value={formData.price}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 mb-2" htmlFor="description">
                  Description
                </label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows="4"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                ></textarea>
              </div>
              <div className="flex justify-end">
                <button
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded-lg transition-colors"
                >
                  Post Course
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Filter Section */}
        <div className="bg-white rounded-lg shadow-md p-4 mb-6">
          <div className="flex flex-wrap items-center gap-4">
            <span className="font-medium text-gray-700">Filter by Topic:</span>
            <button
              onClick={() => setSelectedTopic('')}
              className={`px-3 py-1 rounded-full text-sm ${!selectedTopic ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800 hover:bg-gray-200'}`}
            >
              All Topics
            </button>
            {topics.map( (topic,index ) => (
              <button
                key={index}
                onClick={() => setSelectedTopic(topic.topic_name)}
                className={`px-3 py-1 rounded-full text-sm ${selectedTopic === topic.topic_name ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800 hover:bg-gray-200'}`}
              >
                {topic.topic_name}
              </button>
            ))}
          </div>
        </div>

        {/* Main Content with 3-column Layout */}
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Left Sidebar - Purchased Courses */}
          <div className="lg:w-1/4">
            <div className="bg-white rounded-lg shadow-md p-4 mb-6">
              <h2 className="text-xl font-semibold mb-4 text-gray-800">My Purchased Courses</h2>
              {purchasedCourses.length > 0 ? (
                <div className="space-y-4">
                  {purchasedCourses.map( (course ,index)=> (
                    <div key={index} className="border-b pb-3 last:border-0">
                      <h3 className="font-medium text-gray-800">{course.title}</h3>
                      <p className="text-sm text-gray-500 mb-1">{course.type || 'General'}</p>
                      <div className="flex justify-between items-center">
                        <StarRating
                        courseid={course.courseid}
                        initialRating={course.rating}
                        initialIsLiked={course.is_liked}
                        />
                        {console.log(course.userid+" is userid")}
                       
                        <span className="text-s text-gray-500"> Duration : {course.duration}</span>
                        
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-4">You haven't purchased any courses yet.</p>
              )}
            </div>
          </div>

          {/* Center - All Courses */}
          <div className="lg:w-2/4">
            {isLoading ? (
              <div className="flex justify-center items-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
              </div>
            ) : filteredCourses.length > 0 ? (
              <div className="space-y-6">
                {filteredCourses.map((course,index) => (
                  <div key={index} className="bg-white rounded-lg shadow-md overflow-hidden transition-transform hover:shadow-lg">
                    <div className="p-6">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <span className="inline-block px-2 py-1 text-xs font-semibold bg-blue-100 text-blue-800 rounded-full mb-2">
                            {course.type || 'General'}
                          </span>
                          <h3 className="text-xl font-bold text-gray-800">{course.title}</h3>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-bold text-yellow-600">🪙 {course.price}</p>
                          <p className="text-sm text-gray-500">Duration : {course.duration}</p>
                        </div>
                      </div>
                      <p className="text-gray-600 mb-4">{course.description}</p>
                      <div className="flex items-center justify-between mt-4">
                        <div className="flex items-center">
                       
                          <span className="text-sm text-gray-600">{course.author}</span>
                        </div>
                        {isCreator(course) ? (
                          <span className="px-3 py-1 bg-purple-100 text-purple-800 text-sm font-medium rounded-full">
                            Creator
                          </span>
                        ) : isPurchased(course) ? (
                          <span className="px-3 py-1 bg-green-100 text-green-800 text-sm font-medium rounded-full">
                            Purchased
                          </span>
                        ) : (
                          <button
                            onClick={() => handlePurchase(course.courseid)}
                            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors"
                          >
                            Buy Course
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow-md p-8 text-center">
                <h3 className="text-xl font-semibold text-gray-700 mb-2">No courses found</h3>
                <p className="text-gray-500">
                  {selectedTopic ? `No courses available for ${selectedTopic}. Try another topic or be the first to post one!` : 'No courses available yet. Be the first to post a course!'}
                </p>
              </div>
            )}
          </div>

          {/* Right Sidebar - My Posted Courses */}
          <div className="lg:w-1/4">
            <div className="bg-white rounded-lg shadow-md p-4">
              <h2 className="text-xl font-semibold mb-4 text-gray-800">My Posted Courses</h2>
              {myCourses.length > 0 ? (
                <div className="space-y-4">
                  {myCourses.map( (course,index ) => (
                    <div key={index} className="border-b pb-3 last:border-0">
                      <h3 className="font-medium text-gray-800">{course.title}</h3>
                      <p className="text-sm text-gray-500 mb-1">{course.type || 'General'}</p>
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-gray-500">{course.duration}</span>
                        <span className="text-xs text-yellow-600 font-medium">🪙 {course.price}</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-4">You haven't posted any courses yet.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Marketplace;