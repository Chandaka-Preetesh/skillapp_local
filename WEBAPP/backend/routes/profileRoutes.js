import express from 'express';
import { authenticateToken } from '../middleware/auth.js';

import {getUserInfo} from '../controlers/profileController.js';

import {getStats} from '../controlers/profileController.js';

import { getStreak} from '../controlers/profileController.js';

import {getRecentActivity} from '../controlers/profileController.js';

import {getEarnings} from '../controlers/profileController.js';

const router = express.Router();

router.get('/userinfo',authenticateToken,getUserInfo);

router.get('/stats',authenticateToken,getStats);

router.get('/streak',authenticateToken,getStreak);

router.get('/recent-activity',authenticateToken,getRecentActivity);

router.get('/my-earnings',authenticateToken,getEarnings);


export default router;