import express from 'express';

import { registerUser} from '../controlers/emailauthController.js';
import { loginUser } from '../controlers/emailauthController.js';
import { refreshToken} from '../controlers/emailauthController.js';
import { logoutUser } from '../controlers/emailauthController.js';



const router = express.Router();


//User registration end point
router.post('/register',registerUser);
// Login endpoint
router.post('/login',loginUser);


//  refresh token updation route
router.post('/refresh', refreshToken);

// Logout endpoint 
router.post('/logout', logoutUser);

export default router; 