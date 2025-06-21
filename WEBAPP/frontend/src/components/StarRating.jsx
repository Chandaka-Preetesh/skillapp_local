import { useState, useEffect } from 'react';
import axios from "../utils/axios.js";

function StarRating({
  initialRating = 0,
  initialIsLiked = false,
  initialLikeCount = 0,
  size = 'text-xl',
  disabled = false,
  courseid = null,
  replyid = null
}) {
  const [rating, setRating] = useState(initialRating);
  const [hover, setHover] = useState(0);
  const [isLiked, setIsLiked] = useState(initialIsLiked);
  const [likeCount, setLikeCount] = useState(initialLikeCount);
  const [avgDisp,setAvgDisp]=useState(0);

  useEffect(() => {
    setRating(initialRating);
    setIsLiked(initialIsLiked);
    setLikeCount(initialLikeCount);
  }, [initialRating, initialIsLiked, initialLikeCount]);

  const handleRatingClick = (starValue) => {
    if (disabled) return;

    const newRating = rating === starValue ? 0 : starValue;
    setRating(newRating);
    updateRating(newRating);
  };

  const updateRating = async (newRating) => {
    try {
      console.log("came to update functions")
      if (courseid) {
        await axios.post("/api/marketplace/update-course-rating", {
          courseid,
          rating: newRating,
        });
        const response= await axios.get("/api/marketplace/get-average-course-rating", {params:{courseid} }); 
        console.log(response.data+"reponse resive");
        let averageRating=Number(response.data);
        setAvgDisp(averageRating || 0);
      } else if (replyid) {
        console.log("reaced api call for reply post"+newRating)
        await axios.post("/api/doubtplace/update-reply-rating", {
          replyid,
          rating: newRating,
        });
        const response=await axios.get("/api/doubtplace/get-average-reply-rating",{ params:{replyid} });
        console.log(response.data+"received while updation")
        let averageRating=Number(response.data);
        setAvgDisp(averageRating || 0);
      }
    } catch (err) {
      console.error("Failed to update rating:", err);
    }
  };

  const toggleLike = async () => {
    const newLikeStatus = !isLiked;
    setIsLiked(newLikeStatus);
    setLikeCount((prev) => prev + (newLikeStatus ? 1 : -1));

    try {
      if (courseid) {
        await axios.post("/api/marketplace/toggle-course-like", {
          courseid,
          isLiked: newLikeStatus,
        });
      } else if (replyid) {
        await axios.post("/api/doubtplace/toggle-reply-like", {
          replyid,
          isLiked: newLikeStatus,
        });
      }
    } catch (err) {
      console.error("Failed to toggle like:", err);
    }
  };

  useEffect(() => {
  async function fetchAverageRating() {
    try {
      console.log("while monuting get avg");
      if (courseid) {
        const response = await axios.get("/api/marketplace/get-average-course-rating", {
          params: { courseid }
        });
        console.log("while mounting"+response.data);
        setAvgDisp(response.data);
      } else if (replyid) {
        const response = await axios.get("/api/doubtplace/get-average-reply-rating", {
          params: { replyid }
        });
        setAvgDisp(response.data);
      }
    } catch (err) {
      console.error("Failed to fetch average rating:", err);
    }
  }

  fetchAverageRating();
}, [courseid, replyid]);

  return (
    <div className="flex flex-col gap-1 text-gray-700">
      {/* Star Rating */}
      <div className="flex items-center space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            onClick={() => handleRatingClick(star)}
            onMouseEnter={() => !disabled && setHover(star)}
            onMouseLeave={() => !disabled && setHover(0)}
            disabled={disabled}
            className={`${size} transition-all duration-150 ${
              disabled 
                ? 'cursor-not-allowed' 
                : 'hover:scale-110 active:scale-95 cursor-pointer'
            } ${
              star <= (hover || rating) 
                ? 'text-yellow-400 drop-shadow-sm' 
                : 'text-gray-300'
            } ${!disabled && 'hover:text-yellow-500'}`}
          >
            ★
          </button>
        ))}
        {rating > 0 && (
          <span className="ml-2 text-sm text-gray-600">
            ({rating}/5)
          </span>
        )}
      </div>

      {/* Average Rating */}
      <div className="text-sm text-gray-500">
        Avg: {avgDisp} 
      </div>

      {/* Like Button */}
      <div className="flex items-center space-x-2 mt-1">
        <button
          onClick={toggleLike}
          disabled={disabled}
          className={`text-lg ${isLiked ? 'text-red-500' : 'text-gray-400'} ${
            !disabled && 'hover:text-red-600'
          } transition-all`}
        >
          ♥
        </button>
        <span className="text-sm">{likeCount}</span>
      </div>
    </div>
  );
}

export default StarRating; 