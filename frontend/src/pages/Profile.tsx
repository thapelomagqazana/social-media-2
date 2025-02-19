import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { fetchUserById } from "../services/userService";
import ProfileHeader from "../components/Profile/ProfileHeader";
// import PostsGrid from "../components/Profile/PostsGrid";
import { CircularProgress, Button, Typography } from "@mui/material";

/**
 * Profile Page Component
 * 
 * Displays a user's profile including their bio, followers, posts, and follow button.
 */
const Profile: React.FC = () => {
  const { userId } = useParams<{ userId: string }>();

  // State management
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isFollowing, setIsFollowing] = useState<boolean>(false);

  /**
   * Fetch the user's profile when the component mounts
   */
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const data = await fetchUserById(userId!);
        setProfile(data);
        setIsFollowing(data.isFollowing);
      } catch {
        setError("User not found. The profile may have been deleted or the username is incorrect.");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [userId]);

  /**
   * Handle Follow/Unfollow actions
   */
  const handleFollow = async () => {
    try {
      // await followUser(userId!);
      setIsFollowing(true);
    } catch {
      alert("Could not follow user. Please try again.");
    }
  };

  const handleUnfollow = async () => {
    try {
      // await unfollowUser(userId!);
      setIsFollowing(false);
    } catch {
      alert("Could not unfollow user. Please try again.");
    }
  };

  if (loading) return <CircularProgress className="mt-10" />;
  if (error) return <Typography color="error">{error}</Typography>;

  return (
    <div className="max-w-3xl mx-auto p-6 bg-white shadow-lg rounded-lg">
      <ProfileHeader profile={profile} />

      {/* Follow/Unfollow Button */}
      <div className="mt-4">
        {isFollowing ? (
          <Button variant="outlined" color="secondary" onClick={handleUnfollow}>
            Unfollow
          </Button>
        ) : (
          <Button variant="contained" color="primary" onClick={handleFollow}>
            Follow
          </Button>
        )}
      </div>

      {/* User’s Posts Section */}
      <div className="mt-6">
        <Typography variant="h6" className="mb-2">
          Posts by {profile.name}
        </Typography>
        {/* <PostsGrid userId={userId!} /> */}
      </div>
    </div>
  );
};

export default Profile;
