/**
 * @file HeroSection.tsx
 * @description Displays the main introduction to the platform with a call-to-action.
 */

import { Box, Button, Typography, Container } from "@mui/material";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

/**
 * @component HeroSection
 * @description Displays a hero section with a welcome message and call-to-action buttons.
 */
export const HeroSection = () => {
  const navigate = useNavigate(); // Navigation hook for button redirection

  return (
    <Box
      component={motion.div} // Adds a fade-in animation on load
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1 }}
      sx={{
        background: "linear-gradient(135deg, #1DA1F2, #007bb5)", // Gradient background
        color: "white",
        textAlign: "center",
        py: 10, // Vertical padding for spacing
      }}
    >
      <Container>
        {/* Main heading */}
        <Typography variant="h2" fontWeight="bold">
          Connect, Share, and Engage
        </Typography>

        {/* Subheading */}
        <Typography variant="h5" sx={{ mt: 2 }}>
          Join a community where your voice matters.
        </Typography>

        {/* Call-to-action buttons */}
        <Box sx={{ mt: 4 }}>
          <Button
            variant="contained"
            color="secondary"
            size="large"
            sx={{ mx: 1, borderRadius: "25px", px: 4 }}
            onClick={() => navigate("/signup")}
          >
            Get Started
          </Button>
          <Button
            variant="outlined"
            color="inherit"
            size="large"
            sx={{ mx: 1, borderRadius: "25px", px: 4, borderColor: "white" }}
            onClick={() => navigate("/signin")}
          >
            Sign In
          </Button>
        </Box>
      </Container>
    </Box>
  );
};
