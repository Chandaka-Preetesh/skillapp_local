import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';


// Get the directory path of the current module
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

//To get environamental varibiles from .env i
dotenv.config({ path: join(__dirname, '../.env') });

// Create access token
export const createAccessToken = (user) => {
  let secretKey=process.env.ACCESS_TOKEN_SECRET ;
  return jwt.sign(
    { 
      userid: user.userid, 
      email: user.email,
      google_id:user.google_id
    },
     secretKey,
    { expiresIn: '15m' }
  );
};


// Create refresh token
export const createRefreshToken = (user) => {
  let secretKey=process.env.ACCESS_TOKEN_SECRET;
  return jwt.sign(
    { userid: user.userid },
    secretKey,
    { expiresIn: '7d' }
  );
};
