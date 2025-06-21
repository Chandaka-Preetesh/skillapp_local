import express from 'express';
import { authenticateToken } from '../middleware/auth.js';

import { getTopics } from '../controlers/marketController.js';

import { getDoubts } from '../controlers/doubtController.js';
import { createDoubt } from '../controlers/doubtController.js';

import { getUserDoubts } from '../controlers/doubtController.js';

import { getReplies } from '../controlers/doubtController.js';

import { addReply } from '../controlers/doubtController.js';

import { toggleReplyLike } from '../controlers/doubtController.js';
import { updateReplyRating } from '../controlers/doubtController.js';

import { getAverageReplyRating } from '../controlers/doubtController.js';

const router = express.Router();

router.get('/topics', getTopics);

router.get("/doubts",authenticateToken,getDoubts);


router.post("/doubts",authenticateToken,createDoubt);



// Get user's posted doubts
router.get('/my-doubts', authenticateToken,getUserDoubts);

// GET /api/doubts/:doubtid/replies
router.get('/doubts/:doubtid/replies',authenticateToken ,getReplies);

// POST /api/doubts/:doubtid/replies  
router.post('/doubts/:doubtid/replies', authenticateToken,addReply);


//posted related

router.post('/update-reply-rating',authenticateToken,updateReplyRating);
router.post('/toggle-reply-like',authenticateToken,toggleReplyLike);

//average related 

router.get('/get-average-reply-rating',getAverageReplyRating);


export default router;