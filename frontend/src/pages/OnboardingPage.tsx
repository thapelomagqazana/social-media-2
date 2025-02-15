/**
 * @file OnboardingPage.tsx
 * @description Handles first-time onboarding, allowing users to upload a profile picture, set a display name, add a bio, select interests, and optionally skip onboarding.
 */

import { useState } from "react";
import {
  Box,
  Button,
  TextField,
  Avatar,
  Typography,
  Snackbar,
  Alert,
  Chip,
  Grid,
  CircularProgress,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import { updateUser } from "../services/UserService";

// Define type for user profile updates
interface UserProfileUpdate {
  displayName: string;
  bio: string;
  interests: string[];
  profilePicture: File | null;
}

// Interest options
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

// Validation Schema
const schema = yup.object().shape({
  displayName: yup.string().min(3, "Display Name must be at least 3 characters").required("Display Name is required."),
  bio: yup.string().max(150, "Bio must be at most 150 characters."),
  interests: yup.array().min(1, "Select at least one interest.").required(),
  profilePicture: yup.mixed().required("Profile picture is required."),
});

/**
 * @component OnboardingPage
 * @description Displays an onboarding form with profile picture upload, display name input, bio, interests selection, and an option to skip onboarding.
 */
const OnboardingPage = () => {
  const navigate = useNavigate();
  const [profilePic, setProfilePic] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" as "success" | "error" });

  const {
    control,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<UserProfileUpdate>({
    resolver: yupResolver(schema),
    defaultValues: {
      displayName: "",
      bio: "",
      interests: [],
      profilePicture: null,
    },
  });

  const interests = watch("interests") ?? [];

  /**
   * @function handleFileUpload
   * @description Handles profile picture selection and preview.
   */
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] || null;
    setProfilePic(file);
    setValue("profilePicture", file);
  };

  /**
   * @function handleInterestToggle
   * @description Toggles selection of interest tags.
   */
  const handleInterestToggle = (interest: string) => {
    const updatedInterests = interests.includes(interest)
      ? interests.filter((i) => i !== interest)
      : [...interests, interest];
    setValue("interests", updatedInterests);
  };

  /**
   * @function onSubmit
   * @description Handles onboarding form submission.
   */
  const onSubmit = async (formData: UserProfileUpdate) => {
    setLoading(true);
    try {
      await updateUser("userId", {
        displayName: formData.displayName,
        bio: formData.bio,
        interests: formData.interests,
        profilePicture: profilePic, // Placeholder for actual file upload implementation
      });

      setSnackbar({ open: true, message: "Profile completed successfully!", severity: "success" });
      setTimeout(() => navigate("/dashboard"), 2000);
    } catch (error: unknown) {
      if (error instanceof Error && "response" in error) {
        const axiosError = error as { response?: { data?: { message?: string } } };
        setSnackbar({
          open: true,
          message: axiosError.response?.data?.message || "Signup failed",
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

  /**
   * @function handleSkip
   * @description Allows users to skip the onboarding process and go directly to the dashboard.
   */
  const handleSkip = () => {
    navigate("/dashboard");
  };

  return (
    <Box component="form" onSubmit={handleSubmit(onSubmit)} sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
      <Typography variant="h5" fontWeight={600}>
        Complete Your Profile
      </Typography>

      {/* Profile Picture Upload */}
      <Box textAlign="center">
        <input type="file" accept="image/*" hidden id="profile-upload" onChange={handleFileUpload} />
        <label htmlFor="profile-upload">
          <Avatar
            sx={{ width: 100, height: 100, cursor: "pointer", margin: "auto" }}
            src={profilePic ? URL.createObjectURL(profilePic) : ""}
          />
          <Button component="span" variant="contained" color="primary" startIcon={<CloudUploadIcon />} sx={{ mt: 1 }}>
            Upload Picture
          </Button>
        </label>
        {errors.profilePicture && <Typography color="error">{errors.profilePicture.message}</Typography>}
      </Box>

      {/* Display Name */}
      <Controller
        name="displayName"
        control={control}
        render={({ field }) => (
          <TextField
            {...field}
            label="Display Name"
            fullWidth
            error={!!errors.displayName}
            helperText={errors.displayName?.message}
          />
        )}
      />

      {/* Bio */}
      <Controller
        name="bio"
        control={control}
        render={({ field }) => (
          <TextField
            {...field}
            label="Short Bio"
            multiline
            rows={3}
            fullWidth
            error={!!errors.bio}
            helperText={errors.bio?.message}
          />
        )}
      />

      {/* Interests Selection */}
      <Typography variant="subtitle1">Select Your Interests</Typography>
      <Grid container spacing={1}>
        {interestsList.map((interest) => (
          <Grid item key={interest}>
            <Chip
              label={interest}
              clickable
              color={interests.includes(interest) ? "primary" : "default"}
              onClick={() => handleInterestToggle(interest)}
            />
          </Grid>
        ))}
      </Grid>
      {errors.interests && <Typography color="error">{errors.interests.message}</Typography>}

      {/* Submit & Skip Buttons */}
      <Box display="flex" flexDirection="column" gap={2}>
        <Button type="submit" variant="contained" color="primary" fullWidth disabled={loading}>
          {loading ? <CircularProgress size={24} color="inherit" /> : "Complete Profile"}
        </Button>
        <Button variant="outlined" color="secondary" fullWidth onClick={handleSkip}>
          Skip for Now
        </Button>
      </Box>

      {/* Snackbar Feedback */}
      <Snackbar open={snackbar.open} autoHideDuration={3000} onClose={() => setSnackbar({ ...snackbar, open: false })}>
        <Alert severity={snackbar.severity} onClose={() => setSnackbar({ ...snackbar, open: false })}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default OnboardingPage;
