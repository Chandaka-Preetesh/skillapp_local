import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import jwt from 'jsonwebtoken';
import { linkGoogleAccount } from "../config/loginAndRegisterQueries.js";

// Configure passport strategies
export const configurePassport = () => {
  // Serialize and deserialize user
  passport.serializeUser((user, done) => {
    done(null, user);
  });

  passport.deserializeUser((user, done) => {
    done(null, user);
  });

  // Google Strategy if credentials are available
  if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
    passport.use(new GoogleStrategy({
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: "/api/googleauth/google/callback",
        scope: ["profile", "email"]
      },
      //After getting details tries to link account and return a callback to passport serialsize
      async function(accessToken, refreshToken, profile, cb) {
        try {
          // Create or update user in database
          const user = await linkGoogleAccount({
            email: profile.emails[0].value,
            full_name: profile.displayName,
            google_id: profile.id
          });

          return cb(null, user);
        } catch (error) {
          return cb(error);
        }
      }
    ));
  } else {
    console.log('Google OAuth credentials not found in environment variables.');
    console.log('To enable Google login, please set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET in your .env file.');
  }
};

// Controller for initiating Google authentication
export const googleAuth = (req, res, next) => {
  passport.authenticate('google', { scope: ['profile', 'email'] })(req, res, next);
};

// Controller for Google authentication callback
export const googleAuthCallback = (req, res, next) => {
  passport.authenticate('google', { failureRedirect: '/login?error=Google%20authentication%20failed' })(req, res, (err) => {
    if (err) return next(err);
    
    try {
      if (!req.user) {
        console.error('OAuth callback error: No user data in request');
        return res.redirect(`${process.env.CLIENT_URL || 'http://localhost:5173'}/login?error=Authentication%20failed%20-%20No%20user%20data`);
      }

      console.log('OAuth user data:', req.user); 

      // Create JWT token
      const token = jwt.sign(
        { 
          userid: req.user.userid, 
          email: req.user.email,
          googleId: req.user.google_id,
          isGoogleAuth: true
        },
        process.env.ACCESS_TOKEN_SECRET,
        { expiresIn: '24h' }
      );

      // Encode user data
      const userData = encodeURIComponent(JSON.stringify({
        userid: req.user.userid,
        email: req.user.email,
        full_name: req.user.full_name,
        google_id: req.user.google_id
      }));

      // Debug log
      console.log('Redirecting with token and user data');

      res.redirect(`${process.env.CLIENT_URL}/login?token=${token}&user=${userData}`);
    } catch (error) {
      console.error('OAuth callback error:', error);
      res.redirect(`${process.env.CLIENT_URL}/login?error=Authentication%20failed`);
    }
  });
};