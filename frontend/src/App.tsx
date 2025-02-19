/**
 * Main application component.
 *
 * - Defines routes using React Router.
 * - Includes common components like the Menu.
 */

import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import LandingPage from "./pages/LandingPage";
import OnboardingPage from "./pages/OnboardingPage";
import SignUpPage from "./pages/SignUpPage";
import SignInPage from "./pages/SignInPage";
import UsersList from "./components/Users/UsersList";
import Profile from "./pages/Profile";
import EditProfilePage from "./pages/EditProfile";
import Home from "./pages/Home";
import ForgotPassword from "./pages/ForgotPassword";
import Navbar from "./components/Navbar";
import PrivateRoute from "./components/PrivateRoute";

const App: React.FC = () => {
  return (
    <>
      {/* Navigation Menu */}
      <Navbar />

      {/* Define application routes */}
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/signup" element={<SignUpPage />} />
        <Route path="/signin" element={<SignInPage />} />
        <Route path="/reset-password" element={<ForgotPassword />} />
        <Route path="/users" element={<UsersList />} />

        {/* Protected Routes */}
        <Route element={<PrivateRoute />}>
          <Route path="/profile/:userId" element={<Profile />} />
          <Route path="/profile/edit/:userId" element={<EditProfilePage />} />
          <Route path="/home" element={<Home />} />
          <Route path="/onboarding" element={<OnboardingPage />} />
        </Route>

        {/* Catch-all Route */}
        <Route path="*" element={<Navigate to="/signin" />} />
      </Routes>
    </>
  );
};

export default App;
