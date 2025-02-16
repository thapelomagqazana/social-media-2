/**
 * Main application component.
 *
 * - Defines routes using React Router.
 * - Includes common components like the Menu.
 */

import React from "react";
import { Routes, Route } from "react-router-dom";
import LandingPage from "./pages/LandingPage";
// import Home from "./pages/Home";
import OnboardingPage from "./pages/OnboardingPage";
import SignUpPage from "./pages/SignUpPage";
import SignInPage from "./pages/SignInPage";
import UsersListPage from "./pages/UsersListPage";
import ViewProfilePage from "./pages/ViewProfilePage";
import EditProfilePage from "./pages/EditProfilePage";
import DashboardPage from "./pages/DashboardPage";
import ForgotPassword from "./pages/ForgotPassword";
import Menu from "./components/Menu";
// import Navbar from "./components/Navbar";

const App: React.FC = () => {
  return (
    <>
      {/* Navigation Menu */}
      <Menu />
      {/* <Navbar /> */}

      {/* Define application routes */}
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/signup" element={<SignUpPage />} />
        <Route path="/onboarding" element={<OnboardingPage />} />
        <Route path="/signin" element={<SignInPage />} />
        <Route path="/reset-password" element={<ForgotPassword />} />
        <Route path="/users" element={<UsersListPage />} />
        <Route path="/profile/:userId" element={<ViewProfilePage />} />
        <Route path="/profile/edit/:userId" element={<EditProfilePage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
      </Routes>
    </>
  );
};

export default App;
