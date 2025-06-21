import express from 'express';
import { authenticateToken } from '../middleware/auth.js';
import { sql } from '../config/idb.js';

import {getCourses} from "../controlers/marketController.js";
import { getTopics } from '../controlers/marketController.js';
import  {createCourse} from "../controlers/marketController.js";
import { getPurchasedCourses } from '../controlers/marketController.js';
import  {getSkillCoins } from "../controlers/marketController.js";
import { getUserPosted } from '../controlers/marketController.js';
import { purchaseCourses } from '../controlers/marketController.js';

import {updateCourseRating} from "../controlers/marketController.js";
import { toggleCourseLike } from '../controlers/marketController.js';

import {getAverageCourseRating} from "../controlers/marketController.js";

const router = express.Router();

router.get('/topics', getTopics);

// Get all problems with optional topic filter
router.get('/courses', authenticateToken,getCourses);

// Create a new problem
router.post('/courses', authenticateToken,createCourse);




// Get user's purchased courses
router.get('/purchases', authenticateToken, getPurchasedCourses);

// Get user's skill coin balance
router.get('/skill-coins', authenticateToken,getSkillCoins);

// Get user's posted courses
router.get('/my-courses', authenticateToken,getUserPosted);

// Purchase a course with SkillCoins
router.post('/courses/:courseid/purchase', authenticateToken, purchaseCourses);

// Get transaction history
router.get('/transactions', authenticateToken, async (req, res) => {
  try {
    res.json("transactions response");
    const userId = req.user.id;
    
    const transactions = await sql`
      SELECT 
        t.*,
        sender.full_name as sender_name,
        receiver.full_name as receiver_name,
        c.title as course_title
      FROM skill_coin_transactions t
      LEFT JOIN users sender ON t.sender_id = sender.id
      LEFT JOIN users receiver ON t.receiver_id = receiver.id
      LEFT JOIN marketplace_courses c ON t.course_id = c.id
      WHERE t.sender_id = ${userId} OR t.receiver_id = ${userId}
      ORDER BY t.created_at DESC
    `;
    
   // res.json(transactions);
  } catch (error) {
    console.error('Error fetching transactions:', error);
    res.status(500).json({ error: 'Failed to fetch transactions' });
  }
});


//posted related

router.post('/update-course-rating',authenticateToken,updateCourseRating);
router.post('/toggle-course-like',authenticateToken,toggleCourseLike);

//average related

router.get('/get-average-course-rating',getAverageCourseRating);


export default router;