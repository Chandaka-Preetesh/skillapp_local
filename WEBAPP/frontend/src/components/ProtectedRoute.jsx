import { Navigate, useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react';
import axios from '../utils/axios';

export default function ProtectedRoute({ children, allowedRoles = [] }) {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const location = useLocation();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Check for token in URL (Google OAuth callback)
        const params = new URLSearchParams(location.search);
        const token = params.get('token');
        const oauthUserData = params.get('user');

        if (token && oauthUserData) {
          // Store the token and user data
          localStorage.setItem('token', token);
          localStorage.setItem('user', decodeURIComponent(oauthUserData));
          setUser(JSON.parse(decodeURIComponent(oauthUserData)));
          setLoading(false);
          return;
        }

        // Check for existing token
        const existingToken = localStorage.getItem('token');
        if (!existingToken) {
          setLoading(false);
          return;
        }

        // Verify token with backend
        const response = await axios.get('/api/auth/verify');
        const { user: verifiedUser, token: newToken } = response.data;

        // Update token and user data
        localStorage.setItem('token', newToken);
        localStorage.setItem('user', JSON.stringify(verifiedUser));
        setUser(verifiedUser);

        // Clear URL parameters if they exist
        if (location.search) {
          window.history.replaceState({}, document.title, location.pathname);
        }
      } catch (error) {
        console.error('Auth check failed:', error);
        // Clear invalid data
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();

    // Set up interval to refresh token
    const refreshInterval = setInterval(async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const response = await axios.get('/api/auth/verify');
          localStorage.setItem('token', response.data.token);
          localStorage.setItem('user', JSON.stringify(response.data.user));
          setUser(response.data.user);
        } catch (error) {
          console.error('Token refresh failed:', error);
          clearInterval(refreshInterval);
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          setUser(null);
        }
      }
    }, 14 * 60 * 1000); // Refresh every 14 minutes

    return () => clearInterval(refreshInterval);
  }, [location]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user) {
    // Save the attempted URL
    localStorage.setItem('redirectUrl', location.pathname);
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    return <Navigate to="/user-home" replace />;
  }

  return children;
} 