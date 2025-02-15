/**
 * @file ProfileUpload.tsx
 * @description Handles profile picture upload and preview.
 */

import { useState } from "react";
import { Box, Avatar, Button, Typography } from "@mui/material";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";

interface ProfileUploadProps {
  onFileSelect: (file: File | null) => void;
  error?: string;
}

/**
 * @component ProfileUpload
 * @description Allows users to upload and preview a profile picture.
 */
const ProfileUpload: React.FC<ProfileUploadProps> = ({ onFileSelect, error }) => {
  const [profilePic, setProfilePic] = useState<File | null>(null);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] || null;
    setProfilePic(file);
    onFileSelect(file);
  };

  return (
    <Box textAlign="center">
      <input type="file" accept="image/*" hidden id="profile-upload" onChange={handleFileUpload} />
      <label htmlFor="profile-upload">
        <Avatar sx={{ width: 100, height: 100, cursor: "pointer", margin: "auto" }} src={profilePic ? URL.createObjectURL(profilePic) : ""} />
        <Button component="span" variant="contained" color="primary" startIcon={<CloudUploadIcon />} sx={{ mt: 1 }}>
          Upload Picture
        </Button>
      </label>
      {error && <Typography color="error">{error}</Typography>}
    </Box>
  );
};

export default ProfileUpload;
