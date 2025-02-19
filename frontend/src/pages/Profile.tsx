import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { fetchUserById } from "../services/userService";
import ProfileHeader from "../components/Profile/ProfileHeader";
// import PostsGrid from "../components/Profile/PostsGrid";
import { CircularProgress, Button, Typography } from "@mui/material";
import { useAuth } from "../context/AuthContext";
import "../styles/profile/Profile.css";

/**
 * Profile Page Component
 * 
 * Displays a user's profile including their bio, followers, posts, and follow button.
 */
const Profile: React.FC = () => {
  const { userId } = useParams<{ userId: string }>();
  const { user } = useAuth(); // Get the authenticated user

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
    <div className="profile-container">
      <ProfileHeader profile={profile} />

      {/* Follow/Unfollow Button (Only visible if profile does not belong to me) */}
      {user?.id !== profile._id && (
        <div className="follow-btn-container">
          {isFollowing ? (
            <Button className="unfollow-btn" onClick={handleUnfollow}>
              Unfollow
            </Button>
          ) : (
            <Button className="follow-btn" onClick={handleFollow}>
              Follow
            </Button>
          )}
        </div>
      )}

      {/* User’s Posts Section */}
      <div className="posts-section">
        <Typography className="posts-title">Posts by {profile.name}</Typography>
        {/* <PostsGrid userId={userId!} /> */}
        {profile.posts?.length === 0 && <p className="no-posts">This user hasn’t posted anything yet.</p>}
      </div>
    </div>
  );
};

export default Profile;
