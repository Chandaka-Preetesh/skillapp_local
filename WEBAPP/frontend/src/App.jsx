import React from 'react';
import {
  BrowserRouter as Router,
  Routes,
  Route,
} from "react-router-dom";



import HomePage from "./pages/HomePage";
import RegisterPage from './pages/RegisterPage';
import LoginPage from './pages/LoginPage';
import UserHomePage from './pages/UserHomePage';
import ProtectedRoute from './components/ProtectedRoute';
import Marketplace from './pages/Marketplace';
import DoubtPlace from './pages/DoubtPage';
import ProfilePage from './pages/ProfilePage';


function App() {

  return (
    <div>
       <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
         <Route path="/login" element={<LoginPage />} />
         <Route path="/register" element={<RegisterPage />} />
             <Route 
          path="/user-home" 
          element={
            <ProtectedRoute>
              <UserHomePage />
            </ProtectedRoute>
          } 
        />
        {
          <Route 
          path="/marketplace" 
          element={
            <ProtectedRoute>
              <Marketplace />
            </ProtectedRoute>
          } 
        />
       }
          <Route 
          path="/doubt" 
          element={
            <ProtectedRoute>
              <DoubtPlace/>
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/profile" 
          element={
            <ProtectedRoute>
              <ProfilePage />
            </ProtectedRoute>
          } 
        />
      </Routes>
    </Router>
    </div>
  )
};

export default App
