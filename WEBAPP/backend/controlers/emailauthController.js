import bcrypt from 'bcrypt';
import jwt  from 'jsonwebtoken';

import { createAccessToken } from './tokenController.js';
import { createRefreshToken } from './tokenController.js';

import { checkEmailExists } from '../config/loginAndRegisterQueries.js';
import { createUser } from '../config/loginAndRegisterQueries.js';
import { findUser } from '../config/loginAndRegisterQueries.js';
import { updateLastLogin } from '../config/loginAndRegisterQueries.js';
import { getUserById } from '../config/loginAndRegisterQueries.js';



// To check minimum criteria meet for a string to be password or not.
  const validatePassword = (password) => {
  const minLength = 8;
  let hasLowerCaseLetter=false;
  let hasUpperCaseLetter=false;
  let hasNumber=false;
  let hasOtherCharacter=false;
  for(let i=0;i<password.length;i++) {
      if(password[i]>='0' && password[i]<='9') {hasNumber=true;}
      else if (password[i]>='a' && password[i]<='z') {hasLowerCaseLetter=true;}
      else if (password[i]>='A' && password[i]<='Z') {hasUpperCaseLetter=true;}
      else {hasOtherCharacter=true;}
  }
  const errors = [];
  if (password.length < minLength) {
    errors.push('Password must have a atleast 8 characters');
  }
  if (!hasUpperCaseLetter) {
    errors.push('Password must have at least one uppercase letter');
  }
  if (!hasLowerCaseLetter) {
    errors.push('Password must have at least one lowercase letter');
  }
  if (!hasNumber) {
    errors.push('Password must have at least one number');
  }
  if(!hasOtherCharacter) {
    errors.push('Password must have at least special character.')
  }
  return errors;
};


    export const registerUser=async (req, res) => {
  try {
    const { email, password, full_name } = req.body;

    //Checking if any thing is null.
    if (!email || !password || !full_name) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: 'Invalid email format' });
    }

    // Validate password
    const passwordErrors = validatePassword(password);
    if (passwordErrors.length > 0) {
      return res.status(400).json({ error: 'Password validation failed', details: passwordErrors });
    }

    // Check if email already exists
    const emailExists = await checkEmailExists(email);
    if (emailExists) {
      return res.status(400).json({ error: 'Email already registered' });
    }

    // Hash password
    const saltRound=10;
    const hashed_password = await bcrypt.hash(password, saltRound);

    // To insert new user details to database.
    const user = await createUser({ email, full_name, hashed_password });

    const token = createAccessToken(user);
    //if success return user details and jwt token and a message of success sent.
    res.status(201).json({
      message: 'User registered successfully',
      user: {
        userid: user.userid,
        email: user.email,
        full_name: user.full_name,
        google_id:null
      },
      token
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Error registering user' });
  }
};





export const loginUser= async (req, res) => {
  try {
    const { email, password } = req.body;

    // If either email or password null return error.
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    // Finding user from database
    const user = await findUser(email);
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Check if this is a Google-authenticated user
    if (user.google_id) {
      return res.status(401).json({ 
        error: 'This account uses Google authentication. Please sign in with Google.'
      });
    }

    // Verify password
    const validPassword = await bcrypt.compare(password, user.hashed_password);
    if (!validPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Update last login
    await updateLastLogin(user.id);

    // Create tokens
    const accessToken = createAccessToken(user);//15m
    const refreshToken = createRefreshToken(user);//7d

    // Set refresh token in HTTP-only cookie
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });

    res.json({
      message: 'Login successful',
      user: {
        userid: user.userid,
        email: user.email,
        full_name: user.full_name,
        google_id: user.google_id,
      },
      token: accessToken
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Error logging in' });
  }
};




export const refreshToken=async (req, res) => {
  const refreshToken = req.cookies.refreshToken;
  
  if (!refreshToken) {
    return res.status(401).json({ error: 'No refresh token' });
  }
//if not found error send
//if found verify 

  try {
    const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
    const user = await getUserById(decoded.userid);
    
    //if token valid but user may not be found .
    //user may be deleted 
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Generating new token and updating chache
    const accessToken = createAccessToken(user);
    const newRefreshToken = createRefreshToken(user);

    // A new refresh token updated in cookie
    res.cookie('refreshToken', newRefreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });

    res.json({
      
       token: accessToken });
  } catch (error) {
    console.error('Error while refreshing token:', error);
    res.status(401).json({ error: 'Invalid refresh token' });
  }
};

export const logoutUser=(req, res) => {
  //clearing cookies
  res.clearCookie('refreshToken');
  res.json({ message: 'Logged out successfully' });
};