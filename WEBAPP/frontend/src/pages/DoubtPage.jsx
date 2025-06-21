import React, { useState, useEffect } from 'react';
import Navbar from '../components/ui/Navbar';
import axios from '../utils/axios.js';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import StarRating from '../components/StarRating';
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import ReactMarkdown from "react-markdown";

const Doubts = () => {
  const navigate = useNavigate();
  const [doubts, setDoubts] = useState([]);
  const [topics, setTopics] = useState([]);
  const [selectedTopic, setSelectedTopic] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showPostForm, setShowPostForm] = useState(false);
  const [myDoubts, setMyDoubts] = useState([]);
  const [expandedDoubt, setExpandedDoubt] = useState(null);
  const [replies, setReplies] = useState({});
  const [replyText, setReplyText] = useState('');

  const [formData, setFormData] = useState({
    title: '',
    question: '',
    topic: ''
  });

  useEffect(() => {
    const fetchAndUpdateDoubts = async () => {
      try {
        setIsLoading(true);
        const [doubtsResponse, topicsResponse, myDoubtsResponse] = await Promise.all([
          axios.get('/api/doubtplace/doubts'),
          axios.get('/api/doubtplace/topics'),
          axios.get('/api/doubtplace/my-doubts')
        ]);
        setDoubts(doubtsResponse.data);
        console.log(doubtsResponse.data);
        setTopics(topicsResponse.data);
        setMyDoubts(myDoubtsResponse.data);
        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching data:', error);
        localStorage.clear();
        setIsLoading(false);
        navigate('/login', { replace: true });
      }
    };
    fetchAndUpdateDoubts();
  }, [navigate]);

  const filteredDoubts = selectedTopic
    ? doubts.filter(doubt => doubt.topic === selectedTopic)
    : doubts;

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    const toastid = toast.loading('Posting your Question...');
    e.preventDefault();
    try {
      const response = await axios.post('/api/doubtplace/doubts', formData);
      setDoubts(prev => [response.data, ...prev]);
      setMyDoubts(prev => [response.data, ...prev]);
      setShowPostForm(false);
      setFormData({ title: '', question: '', topic: '' });
      toast.success('Doubt posted successfully!', { id: toastid });
    } catch (err) {
      console.error('Error creating doubt:', err);
      toast.error('Unable to post your Question!', { id: toastid });
      setError('Failed to create doubt. Please try again.');
    }
  };

  const handleExpandDoubt = async (doubtid) => {
    if (expandedDoubt === doubtid) {
      setExpandedDoubt(null);
      return;
    }

    try {
      const response = await axios.get(`/api/doubtplace/doubts/${doubtid}/replies`);
      setReplies(prev => ({
        ...prev,
        [doubtid]: response.data
      }));
      setExpandedDoubt(doubtid);
    } catch (err) {
      console.error('Error fetching replies:', err);
      setError('Failed to load replies. Please try again.');
    }
  };

  const handleReplySubmit = async (doubtid) => {
    const toastId = toast.loading('Posting your Reply...');
    try {
      await axios.post(`/api/doubtplace/doubts/${doubtid}/replies`, {
        reply: replyText
      });
      const updatedReplies = await axios.get(`/api/doubtplace/doubts/${doubtid}/replies`);
      setReplies(prev => ({
        ...prev,
        [doubtid]: updatedReplies.data
      }));
      setReplyText('');
      toast.success('Your Reply is posted successfully', { id: toastId });
    } catch (err) {
      console.error('Error posting reply:', err);
      toast.error('Unable to post your Reply', { id: toastId });
      setError('Failed to post reply. Please try again.');
    }
  };

  const isCreator = (doubt) => {
    return myDoubts.some(myDoubt => myDoubt.userid === doubt.userid);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

const AIReply = ({ aiReply }) => (
  <div className="bg-blue-50 rounded-md p-4 mb-4">
    <div className="flex items-center justify-between mb-2">
      <div className="flex items-center">
        <div className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center text-white text-xs font-bold mr-2">
          AI
        </div>
        <span className="text-sm font-medium text-gray-800">
          {aiReply.model_name} AI
        </span>
        <span className="ml-2 px-2 py-0.5 bg-blue-100 text-blue-800 text-xs rounded">
          AI Generated
        </span>
      </div>
      <span className="text-xs text-gray-500">{formatDate(aiReply.createdat)}</span>
    </div>

    {/* Render markdown reply */}
    <ReactMarkdown>
      {aiReply.reply}
    </ReactMarkdown>
  </div>
);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="container mx-auto px-4 py-8 pt-20">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-800">Doubts & Questions</h1>
          <Button 
          className="bg-blue-600 hover:bg-blue-700 text-white"
          onClick={() => setShowPostForm(!showPostForm)}>
            {showPostForm ? 'Cancel' : 'Ask New Question'}
          </Button>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        {showPostForm && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <h2 className="text-xl font-semibold mb-4">Ask a New Question</h2>
            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-gray-700 mb-2" htmlFor="title">Title</label>
                  <input
                    type="text"
                    id="title"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    required
                  />
                </div>
                <div>
                  <label className="block text-gray-700 mb-2" htmlFor="topic">Topic</label>
                  <select
                    id="topic"
                    name="topic"
                    value={formData.topic}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    required
                  >
                    <option value="">Select a topic</option>
                    {topics.map((topic, index) => (
                      <option key={index} value={topic.topic_name}>
                        {topic.topic_name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 mb-2" htmlFor="question">Question</label>
                <Textarea
                  id="question"
                  name="question"
                  value={formData.question}
                  onChange={handleInputChange}
                  rows={5}
                  required
                />
              </div>
              <div className="flex justify-end">
                <Button
                className="bg-blue-600 hover:bg-blue-700 text-white"
                type="submit">Post Question</Button>
              </div>
            </form>
          </div>
        )}

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

        {/* 2 Column Layout */}
        <div className="flex flex-col lg:flex-row gap-6 w-full">
          {/* My Questions - 30% */}
          <div className="lg:w-[30%]">
            <div className="bg-white rounded-lg shadow-md p-4 mb-6">
              <h2 className="text-xl font-semibold mb-4 text-gray-800">My Questions</h2>
              {myDoubts.length > 0 ? (
                <div className="space-y-4">
                  {myDoubts.map(doubt => (
                    <div key={doubt.doubtid} className="border-b pb-3 last:border-0">
                      <h3 className="font-medium text-gray-800">{doubt.title}</h3>
                      <p className="text-sm text-gray-500 mb-1">{doubt.topic || 'General'}</p>
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-gray-500">{formatDate(doubt.createdat)}</span>
                        <span className="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded-full">
                          Asked
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-4">You haven't asked any questions yet.</p>
              )}
            </div>
          </div>

          {/* All Questions - 70% */}
          <div className="lg:w-[70%] space-y-6">
            {isLoading ? (
              <div className="flex justify-center items-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
              </div>
            ) : filteredDoubts.length > 0 ? (
              filteredDoubts.map((doubt, index) => (
                <div
                  key={index}
                  className="bg-white rounded-lg shadow-md w-full p-6"
                >
                  <div className="flex justify-between mb-2">
                    <div>
                      <span className="px-2 py-1 text-xs font-semibold bg-blue-100 text-blue-800 rounded-full">
                        {doubt.topic || 'General'}
                      </span>
                      <h3 className="text-xl font-bold text-gray-800 mt-1">{doubt.title}</h3>
                    </div>
                    <div className="text-sm text-gray-500">{formatDate(doubt.createdat)}</div>
                  </div>
                  <p className="text-gray-600 mb-4">{doubt.question}</p>
                  <div className="flex justify-between items-center">
                    <div className="flex items-center">
                    <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center overflow-hidden mr-2">
  <span className="text-xs font-medium text-gray-600">
    {doubt.author?.trim().charAt(0).toUpperCase() || 'U'}
  </span>
</div>
{console.log(doubt.author+"from frontend")}
                      <span className="text-sm text-gray-600">{doubt.author}</span>
                    </div>
                    <div className="flex gap-2">
                      {isCreator(doubt) && (
                        <span className="px-3 py-1 bg-purple-100 text-purple-800 text-sm font-medium rounded-full">
                          My Question
                        </span>
                      )}
                      <Button 
                       className="bg-blue-600 hover:bg-blue-700 text-white"
                      onClick={() => handleExpandDoubt(doubt.doubtid)}>
                        {expandedDoubt === doubt.doubtid ? 'Hide Replies' : 'View Replies'}
                      </Button>
                    </div>
                  </div>

                  {expandedDoubt === doubt.doubtid && (
                    <div className="mt-6 border-t pt-4">
                      <h4 className="text-lg font-semibold mb-4">Replies</h4>
                      <Textarea
                        value={replyText}
                        onChange={(e) => setReplyText(e.target.value)}
                        placeholder="Write your reply..."
                        rows={3}
                        className="mb-2"
                      />
                      <div className="flex justify-end mb-6">

                        <Button
                        className="bg-green-600 hover:bg-green-700 text-white"
                        onClick={() => handleReplySubmit(doubt.doubtid)}>Post Reply</Button>
                      </div>

                      {/* AI Reply */}
                      {replies[doubt.doubtid]?.ai_reply && (
                        <>
                          <h5 className="text-md font-medium text-gray-700 mb-2 flex items-center">
                            <span className="w-4 h-4 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full mr-2"></span>
                            AI Responses
                          </h5>
                          <AIReply aiReply={replies[doubt.doubtid].ai_reply} />
                        </>
                      )}

                      {/* User Replies */}
                      <div className="space-y-6">
                        {replies[doubt.doubtid]?.user_replies?.length > 0 ? (
                          replies[doubt.doubtid].user_replies.map((reply, index) => (
                            <div key={index} className="bg-green-50 rounded-lg p-4">
                              <div className="flex justify-between items-center mb-2">
                                <div className="flex items-center">
                                  <div className="w-6 h-6 rounded-full bg-gray-300 flex items-center justify-center overflow-hidden mr-2">
                                    <span className="text-xs font-medium text-gray-600">
                                      {reply.author?.charAt(0)?.toUpperCase() || 'U'}
                                    </span>
                                  </div>
                                  <span className="text-sm font-medium text-gray-700">{reply.author}</span>
                                </div>
                                <span className="text-xs text-gray-500">{formatDate(reply.createdat)}</span>
                                <StarRating
                                  initialIsLiked={reply.is_liked}
                                  initialRating={reply.rating}
                                  replyid={reply.doubt_replies_id}
                                />
                              </div>
                              <p className="text-gray-600">{reply.reply}</p>
                            </div>
                          ))
                        ) : (
                          <p className="text-gray-500 text-center py-4">No replies yet. Be the first to help!</p>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ))
            ) : (
              <div className="bg-white rounded-lg shadow-md p-8 text-center">
                <h3 className="text-xl font-semibold text-gray-700 mb-2">No questions found</h3>
                <p className="text-gray-500">
                  {selectedTopic
                    ? `No questions available for ${selectedTopic}. Try another topic or be the first to ask one!`
                    : 'No questions available yet. Be the first to ask a question!'}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Doubts;
