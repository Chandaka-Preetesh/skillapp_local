import express from 'express';

import {recentActivity} from "../controlers/userController.js"

const router = express.Router();

router.get("/getRecentActivity",recentActivity);


export default router; 