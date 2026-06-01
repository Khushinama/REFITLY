import { Navigate, useLocation } from "react-router-dom";
import React from 'react';
import { useSelector } from 'react-redux';

const PrivateRoute = ({ children }) => {
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  const isMissingOnboarding = !user?.onboardingCompleted || user?.gender === "Prefer not to say" || !user?.gender;
  
  if (isMissingOnboarding && location.pathname !== "/onboarding") {
    return <Navigate to="/onboarding" />;
  }

  return children;
};

export default PrivateRoute;