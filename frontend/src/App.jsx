import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import Login from './pages/Login'
import Signup from './pages/Signup'
import ResetPassword from "./pages/ResetPassword";
import Wardrobe from "./pages/Wardrobe";
import OnboardingQuiz from "./pages/OnboardingQuiz";
import PrivateRoute from "./components/PrivateRoute";
import Dashboard from './pages/Dashboard'
import Profile from './pages/Profile'
import OutfitDiscoveryPage from './pages/OutfitDiscoveryPage'
import HistoryPage from './pages/HistoryPage'
import ToastNotification from './components/ToastNotification'

const App = () => {
  return (
    <>
      <Router>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/reset-password/:token" element={<ResetPassword />} />

          {/* Protected Route */}
          <Route
            path="/wardrobe"
            element={
              <PrivateRoute>
                <Wardrobe/>
              </PrivateRoute>
            }
          />
          <Route
            path="/dashboard"
            element={
              <PrivateRoute>
                <Dashboard/>
              </PrivateRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <PrivateRoute>
                <Profile />
              </PrivateRoute>
            }
          />
          <Route
            path="/onboarding"
            element={
              <PrivateRoute>
                <OnboardingQuiz />
              </PrivateRoute>
            }
          />
          <Route
            path="/outfits"
            element={
              <PrivateRoute>
                <OutfitDiscoveryPage />
              </PrivateRoute>
            }
          />
          <Route
            path="/history"
            element={
              <PrivateRoute>
                <HistoryPage />
              </PrivateRoute>
            }
          />
        </Routes>
      </Router>
      <ToastNotification />
    </>
  )
}

export default App;