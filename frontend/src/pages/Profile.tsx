import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import ProfileCard from "../components/Profile/ProfileCard";
import { Button, Container, CircularProgress, Typography, Alert } from "@mui/material";
import { fetchUserById } from "../services/userService";

// Define User Type
interface User {
  id: string;
  name: string;
  displayName?: string;
  email: string;
  profilePicture?: string;
  bio?: string;
  interests?: string[];
}

/**
 * @component Profile
 * @description Displays user profile information with an "Edit Profile" button.
 */
const Profile = () => {
  const { userId } = useParams<{ userId: string }>(); // Get userId from the URL
  const navigate = useNavigate();
  const [profileData, setProfileData] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    /**
     * Fetches the user profile using `fetchUserById`
     */
    const loadUserProfile = async () => {
      if (!userId) {
        setError("User ID not found. Please log in again.");
        return;
      }

      setLoading(true);
      setError(null);
      try {
        const userData: User = await fetchUserById(userId);
        setProfileData(userData);
      } catch {
        setError("Failed to fetch user profile. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    loadUserProfile();
  }, [userId]);

  return (
    <Container maxWidth="sm">
      {loading ? (
        <CircularProgress sx={{ display: "block", mx: "auto", mt: 4 }} />
      ) : error ? (
        <Alert severity="error" sx={{ mt: 2 }}>
          {error}
        </Alert>
      ) : profileData ? (
        <>
          <ProfileCard user={profileData} />
          <Button
            variant="contained"
            color="primary"
            fullWidth
            onClick={() => navigate(`/profile/edit/${userId}`)}
            sx={{ mt: 2 }}
          >
            Edit Profile
          </Button>
        </>
      ) : (
        <Typography variant="body1" textAlign="center" sx={{ mt: 4 }}>
          No profile data available.
        </Typography>
      )}
    </Container>
  );
};

export default Profile;
