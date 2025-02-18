import { Avatar, Box, Typography, Chip } from "@mui/material";

interface ProfileCardProps {
  user: {
    name: string;
    displayName?: string;
    bio?: string;
    profilePicture?: string;
    role: "admin" | "user"; // Role field added
  };
}

/**
 * ProfileCard Component: Displays the user's profile picture, name, role, and bio.
 */
const ProfileCard = ({ user }: ProfileCardProps) => {
  return (
    <Box textAlign="center" mt={4}>
      {/* Profile Picture */}
      <Avatar
        src={user.profilePicture || "/default-avatar.png"} // Fallback to a default avatar
        alt="Profile Picture"
        sx={{ width: 120, height: 120, mx: "auto" }}
      />

      {/* Display Name & Role */}
      <Typography variant="h5" mt={2} fontWeight="bold">
        {user.displayName || user.name} {/* Prioritize displayName if available */}
      </Typography>

      {/* Role Indicator */}
      <Chip
        label={user.role === "admin" ? "Admin" : "User"}
        color={user.role === "admin" ? "secondary" : "default"}
        sx={{ mt: 1 }}
      />

      {/* Bio */}
      {user.bio && (
        <Typography variant="body1" color="textSecondary" mt={1}>
          {user.bio}
        </Typography>
      )}
    </Box>
  );
};

export default ProfileCard;
