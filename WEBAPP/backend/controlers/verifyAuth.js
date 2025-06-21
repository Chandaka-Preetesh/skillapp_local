import jwt from "jsonwebtoken";
import { getUserById } from "../config/loginAndRegisterQueries.js";

import dotenv from "dotenv";
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Get the directory path of the current module
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

//To get environamental varibiles from .env i
dotenv.config({ path: join(__dirname, '../.env') });

export const verifyAuth= async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    let decoded;
    try {
      // Use ACCESS_TOKEN_SECRET to verify current token
      decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    } catch (e) {
        return res.status(401).json({ error: 'Invalid token' });
    }

    // Get user data from database
    const user = await getUserById(decoded.userid);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Return user data with token refresh
    const newToken = jwt.sign(
      { 
        userid: user.userid, 
        email: user.email,
        google_id: user.googleid,
      },
      process.env.ACCESS_TOKEN_SECRET,
      { expiresIn: '24h' }
    );
    //a json responcse 
    res.json({
      user: {
        userid: user.userid,
        email: user.email,
        full_name: user.full_name,
        google_id: user.googleid
      },
      token: newToken
    });
  } catch (error) {
    console.error('Token verification error:', error);
    res.status(401).json({ error: 'Invalid token' });
  }
};

