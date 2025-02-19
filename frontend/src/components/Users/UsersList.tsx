import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { fetchUsers } from "../../services/userService";
import { Avatar, Card, CardContent, Typography, Button } from "@mui/material";
import { motion } from "framer-motion";

/**
 * UsersList Component
 * 
 * Displays a list of users with profile pictures, names, and follow buttons.
 * Users can click on a profile to navigate to `/profile/:userId`.
 */
const UsersList: React.FC = () => {
  // State for users, loading state, and error messages
  const [users, setUsers] = useState<{ _id: string; name: string; profilePicture: string }[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  /**
   * Fetch users when the component mounts
   */
  useEffect(() => {
    const loadUsers = async () => {
      try {
        const data = await fetchUsers();
        setUsers(data); // Update state with user data
      } catch {
        setError("Failed to load users. Please try again.");
      } finally {
        setLoading(false); // Hide loading spinner
      }
    };

    loadUsers();
  }, []);

  return (
    <Card className="max-w-md mx-auto shadow-lg rounded-lg bg-white p-4">
      <CardContent>
        <Typography variant="h5" className="mb-4 text-center font-semibold">
          Suggested Users
        </Typography>

        {/* Show loading spinner */}
        {loading && <Typography className="text-gray-500">Loading users...</Typography>}

        {/* Show error message if the API call fails */}
        {error && <Typography className="text-red-500">{error}</Typography>}

        {/* Render user list */}
        {!loading && !error && users.length > 0 ? (
          <div className="space-y-3">
            {users.map((user) => (
              <motion.div
                key={user._id}
                className="flex items-center space-x-4 p-2 border rounded-lg shadow-sm hover:shadow-md transition"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                {/* Profile Picture */}
                <Avatar
                  src={user.profilePicture || "/default-avatar.png"}
                  alt={`${user.name}'s profile`}
                  className="w-12 h-12 border"
                />

                {/* User Name & Link to Profile */}
                <div className="flex-1">
                  <Typography variant="body1">
                    <Link to={`/profile/${user._id}`} className="text-blue-500 hover:underline">
                      {user.name}
                    </Link>
                  </Typography>
                </div>

                {/* Follow Button (Placeholder for now) */}
                <Button variant="contained" color="primary" size="small">
                  Follow
                </Button>
              </motion.div>
            ))}
          </div>
        ) : (
          // Show "No Users Found" message
          !loading && <Typography className="text-gray-500">No users found. Try searching with a different name.</Typography>
        )}
      </CardContent>
    </Card>
  );
};

export default UsersList;
