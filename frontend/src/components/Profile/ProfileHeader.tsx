import React from "react";
import { Avatar, Typography, Box, IconButton } from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import "../../styles/profile/ProfileHeader.css";

/**
 * Profile Header Component
 * 
 * Displays user's profile picture, name, username, bio, and stats.
 * If the profile belongs to the authenticated user, an edit icon is shown.
 */
const ProfileHeader: React.FC<{ profile: any }> = ({ profile }) => {
  const { user } = useAuth(); // Get the authenticated user
  const navigate = useNavigate();

  return (
    <Box className="profile-header">
      {/* Profile Picture */}
      <Avatar
        src={profile.profilePicture || "/default-avatar.png"}
        alt={profile.name}
        className="profile-avatar"
      />

      {/* Edit Profile Icon (Only visible for the logged-in user) */}
      {user?.id === profile._id && (
        <IconButton className="edit-profile-icon" onClick={() => navigate(`/profile/edit/${profile._id}`)}>
          <EditIcon />
        </IconButton>
      )}

      {/* Name & Bio */}
      <Typography className="profile-name">{profile.name}</Typography>
      <Typography className="profile-username">@{profile.displayName}</Typography>
      <Typography className="profile-bio">
        {profile.bio || "This user hasn't added a bio yet."}
      </Typography>

      {/* Followers & Following Count */}
      <Box className="profile-stats">
        <Box className="stat-box">
          <Typography className="stat-value">{profile.followers.length}</Typography>
          <Typography className="stat-label">Followers</Typography>
        </Box>
        <Box className="stat-box">
          <Typography className="stat-value">{profile.following.length}</Typography>
          <Typography className="stat-label">Following</Typography>
        </Box>
      </Box>
    </Box>
  );
};

export default ProfileHeader;
