import React, { useEffect, useState } from "react";
import { getUserPosts } from "../../services/userService";
import { Card, CardContent, Typography } from "@mui/material";

/**
 * 📌 Posts Grid Component
 * 
 * Displays a list of posts for a user.
 */
const PostsGrid: React.FC<{ userId: string }> = ({ userId }) => {
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const data = await getUserPosts(userId);
        setPosts(data);
      } catch {
        setError("This user hasn’t posted anything yet.");
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, [userId]);

  if (loading) return <Typography>Loading posts...</Typography>;
  if (error) return <Typography color="error">{error}</Typography>;

  return (
    <div className="space-y-4">
      {posts.map((post) => (
        <Card key={post._id} className="shadow-sm">
          <CardContent>
            <Typography>{post.content}</Typography>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default PostsGrid;
