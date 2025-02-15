/**
 * @file LandingPage.tsx
 * @description This is the main landing page of the application. It includes the Hero Section and 
 * a Call-To-Action section to encourage user sign-ups.
 */

import { Box } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { HeroSection } from "../components/Landing/HeroSection";
import { CallToActionSection } from "../components/Landing/CallToActionSection";
import { FeaturesSection } from "../components/Landing/FeaturesSection";

/**
 * @component LandingPage
 * @description Displays the landing page with a hero section and call-to-action.
 */
const LandingPage = () => {
  const navigate = useNavigate(); // Navigation hook to redirect users

  return (
    <Box>
      {/* Hero Section with introductory message and CTA buttons */}
      <HeroSection />

      {/* Features Section */}
      <FeaturesSection />

      {/* Call-to-Action Section encouraging sign-ups */}
      <CallToActionSection navigate={navigate} />
    </Box>
  );
};

export default LandingPage;
