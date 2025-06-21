import jwt from 'jsonwebtoken';

export const authenticateToken = (req, res, next) => {
  //getting token
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1];

  //if unable to get token returns 401
  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }

  try {
    //we get user information stored in token which is assigned as payload
    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

    // Ensure we have the required user data
    req.user = {
      userid: decoded.userid ,
      email: decoded.email,
      googleId: decoded.googleId,
    };
    next();
  } catch (error) {
    console.error('Token verification error:', error.message);
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token expired' });
    }
    return res.status(403).json({ error: 'Invalid token' });
  }
}; 