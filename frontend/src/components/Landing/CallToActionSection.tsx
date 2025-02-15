/**
 * @file CallToActionSection.tsx
 * @description Displays a strong call-to-action for users to sign up.
 */

import { Box, Button, Typography, Container } from "@mui/material";

/**
 * @component CallToActionSection
 * @description Encourages users to sign up with a final push.
 * @param {Object} props - Component properties
 * @param {(path: string) => void} props.navigate - Function to handle navigation
 */
export const CallToActionSection = ({ navigate }: { navigate: (path: string) => void }) => (
  <Box
    sx={{
      textAlign: "center",
      py: 8, // Padding for spacing
      background: "#1DA1F2", // Consistent with theme color
      color: "white",
    }}
  >
    <Container>
      {/* Call-to-action message */}
      <Typography variant="h4" fontWeight="bold">
        Join Today and Start Connecting!
      </Typography>

      {/* Sign-up button */}
      <Button
        variant="contained"
        color="secondary"
        size="large"
        sx={{ mt: 3, borderRadius: "25px", px: 4 }}
        onClick={() => navigate("/signup")}
      >
        Sign Up Now
      </Button>
    </Container>
  </Box>
);
