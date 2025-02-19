import React from "react";
import { Avatar, Typography, Box } from "@mui/material";

/**
 * Profile Header Component
 * 
 * Displays user's profile picture, name, username, bio, and stats with improved styling.
 */
const ProfileHeader: React.FC<{ profile: any }> = ({ profile }) => {
  return (
    <Box className="flex flex-col items-center text-center p-6 bg-white shadow-md rounded-lg">
      {/* Profile Picture */}
      <Avatar
        src={profile.profilePicture || "/default-avatar.png"}
        alt={profile.name}
        sx={{
          width: 96,
          height: 96,
          border: "3px solid #1DA1F2",
          transition: "transform 0.3s ease-in-out",
          "&:hover": {
            transform: "scale(1.1)",
          },
        }}
      />

      {/* Name & Bio */}
      <Typography variant="h5" fontWeight="bold" className="mt-3">
        {profile.name}
      </Typography>
      <Typography
        variant="body2"
        className="text-gray-500 hover:text-blue-500 cursor-pointer transition"
      >
        @{profile.displayName}
      </Typography>
      <Typography className="mt-2 text-gray-700">
        {profile.bio || "This user hasn't added a bio yet."}
      </Typography>

      {/* Followers & Following Count */}
      <Box className="mt-4 grid grid-cols-2 gap-4">
        <Box className="flex flex-col items-center">
          <Typography variant="h6" fontWeight="bold">
            {profile.followersCount}
          </Typography>
          <Typography variant="caption" color="textSecondary">
            Followers
          </Typography>
        </Box>
        <Box className="flex flex-col items-center">
          <Typography variant="h6" fontWeight="bold">
            {profile.followingCount}
          </Typography>
          <Typography variant="caption" color="textSecondary">
            Following
          </Typography>
        </Box>
      </Box>
    </Box>
  );
};

export default ProfileHeader;
