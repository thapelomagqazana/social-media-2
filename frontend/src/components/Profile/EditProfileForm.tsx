import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { fetchUserById, updateUser } from "../../services/userService";
import {
  TextField,
  Button,
  Avatar,
  Box,
  Typography,
  CircularProgress,
  Snackbar,
  Alert,
  Chip,
  Grid,
} from "@mui/material";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";

// Define User Type
interface User {
  id: string;
  name: string;
  displayName: string;
  email: string;
  bio?: string;
  profilePicture?: string;
  role: string;
  interests: string[];
}

// List of available interests
const interestsList = [
  "Technology",
  "Health & Wellness",
  "Sports",
  "Art",
  "Music",
  "Finance",
  "Education",
  "Gaming",
];

/**
 * @component EditProfileForm
 * @description Allows users to update their profile picture, name, display name, bio, and interests.
 */
const EditProfileForm = () => {
  const { userId } = useParams<{ userId?: string }>(); // Ensure optional param
  const navigate = useNavigate();

  const [user, setUser] = useState<User | null>(null);
  const [name, setName] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [bio, setBio] = useState("");
  const [profilePicture, setProfilePicture] = useState<File | null>(null);
  const [interests, setInterests] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [fetchingUser, setFetchingUser] = useState(true);
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });

  useEffect(() => {
    /**
     * Fetch user details when the component mounts.
     */
    const loadUserProfile = async () => {
      if (!userId) {
        setSnackbar({ open: true, message: "User ID is missing!", severity: "error" });
        return;
      }

      setFetchingUser(true);
      try {
        const userData: User = await fetchUserById(userId);
        setUser(userData);
        setName(userData.name);
        setDisplayName(userData.displayName);
        setBio(userData.bio || "");
        setInterests(userData.interests || []);
      } catch {
        setSnackbar({ open: true, message: "Failed to fetch user profile.", severity: "error" });
      } finally {
        setFetchingUser(false);
      }
    };

    loadUserProfile();
  }, [userId]);

  /**
   * Handles profile picture upload.
   */
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    if (!file) return;
    if (!["image/jpeg", "image/png"].includes(file.type)) {
      setSnackbar({ open: true, message: "Invalid file type. Only JPG/PNG allowed.", severity: "error" });
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setSnackbar({ open: true, message: "File exceeds 5MB limit.", severity: "error" });
      return;
    }

    setProfilePicture(file);
  };

  /**
   * Handles selection and deselection of interests.
   */
  const handleInterestToggle = (interest: string) => {
    setInterests((prev) =>
      prev.includes(interest) ? prev.filter((i) => i !== interest) : [...prev, interest]
    );
  };

  const handleSubmit = async () => {
    if (!user || !userId) {
      setSnackbar({ open: true, message: "Invalid User ID!", severity: "error" });
      return;
    }
  
    setLoading(true);
  
    try {
      const formData = new FormData();
  
      // Ensure `interests` is sent as an array, NOT as a string
      const formattedInterests = JSON.stringify(interests); // Convert to JSON string
  
      // Only append fields that have values
      if (name.trim()) formData.append("name", name);
      if (displayName.trim()) formData.append("displayName", displayName);
      if (bio.trim()) formData.append("bio", bio);
      if (profilePicture) formData.append("profilePicture", profilePicture);
      formData.append("interests", formattedInterests);
  
      // console.log("🚀 Sending FormData:", Object.fromEntries(formData.entries())); // Debugging
  
      const updatedUser = await updateUser(userId, formData);
      setUser(updatedUser);
  
      setSnackbar({ open: true, message: "Profile updated successfully!", severity: "success" });
      setTimeout(() => navigate(`/profile/${user.id}`), 2000);
    } catch (error: unknown) {
      if (error instanceof Error && "response" in error) {
        const axiosError = error as { response?: { data?: { message?: string } } };
        setSnackbar({
          open: true,
          message: axiosError.response?.data?.message || "Something went wrong. Please try again.",
          severity: "error",
        });
      } else {
        setSnackbar({
          open: true,
          message: "An unexpected error occurred",
          severity: "error",
        });
      }
    } finally {
      setLoading(false);
    }
  };  

  return (
    <Box display="flex" flexDirection="column" gap={3} mt={4}>
      <Typography variant="h5" fontWeight={600}>
        Edit Profile
      </Typography>

      {fetchingUser ? (
        <CircularProgress sx={{ mx: "auto", my: 3 }} />
      ) : user ? (
        <>
          <Box textAlign="center">
            <input type="file" hidden id="upload" accept="image/*" onChange={handleFileUpload} />
            <label htmlFor="upload">
              <Avatar
                src={profilePicture ? URL.createObjectURL(profilePicture) : user.profilePicture}
                sx={{ width: 100, height: 100, cursor: "pointer", mx: "auto" }}
              />
              <Button component="span" variant="contained" color="primary" startIcon={<CloudUploadIcon />} sx={{ mt: 1 }}>
                Upload Picture
              </Button>
            </label>
          </Box>

          {/* Non-editable fields */}
          <TextField label="Email" value={user.email} fullWidth disabled />
          <TextField label="Role" value={user.role} fullWidth disabled />

          {/* Editable fields */}
          <TextField label="Full Name" value={name} onChange={(e) => setName(e.target.value)} fullWidth required />
          <TextField label="Display Name" value={displayName} onChange={(e) => setDisplayName(e.target.value)} fullWidth />
          <TextField label="Bio" value={bio} onChange={(e) => setBio(e.target.value)} fullWidth multiline rows={3} inputProps={{ maxLength: 150 }} />

          {/* Interests Selection */}
          <Typography variant="subtitle1">Select Your Interests</Typography>
          <Grid container spacing={1}>
            {interestsList.map((interest) => (
              <Grid item key={interest}>
                <Chip label={interest} clickable color={interests.includes(interest) ? "primary" : "default"} onClick={() => handleInterestToggle(interest)} />
              </Grid>
            ))}
          </Grid>

          <Button variant="contained" color="primary" fullWidth disabled={loading || !name.trim()} onClick={handleSubmit}>
            {loading ? <CircularProgress size={24} color="inherit" /> : "Save Changes"}
          </Button>
        </>
      ) : (
        <Typography variant="body1" textAlign="center" sx={{ mt: 4 }}>
          No user profile found.
        </Typography>
      )}

      <Snackbar open={snackbar.open} autoHideDuration={3000} onClose={() => setSnackbar({ ...snackbar, open: false })}>
        <Alert severity={snackbar.severity}>{snackbar.message}</Alert>
      </Snackbar>
    </Box>
  );
};

export default EditProfileForm;
