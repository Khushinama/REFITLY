import { Navigate, useLocation } from "react-router-dom";
import React from 'react';
import { useSelector } from 'react-redux';

const PrivateRoute = ({ children }) => {
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  // Users are routed to /onboarding upon login if they are missing data, 
  // but they are allowed to skip it and navigate freely afterwards.

  return children;
};

export default PrivateRoute;