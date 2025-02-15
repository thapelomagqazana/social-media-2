import api from "./api";

/**
 * UserService - API functions for user authentication and management.
 */

// TypeScript interface for user objects
export interface User {
  id: string;
  name: string;
  email: string;
  password?: string;
  displayName?: string;
  profilePicture?: string;
  bio?: string;
  interests?: string[];
}

// Type for updating user profile
export interface UserProfileUpdate {
  displayName?: string;
  bio?: string;
  interests?: string[];
  profilePicture?: File | null;
}


// Register a new user
export const registerUser = async (userData: Partial<User>) => {
  const response = await api.post("/api/auth/signup", userData);
  return response.data;
};

// Login user
export const loginUser = async (credentials: { email: string; password: string }) => {
  const response = await api.post("/api/auth/signin", credentials);
  return response.data;
};

// Log out user
export const logoutUser = async () => {
    const token = localStorage.getItem("token");
    if (!token) return; // Prevent unnecessary API calls
  
    const response = await api.get("/api/auth/signout",{
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  
    return response.data;
};

// Fetch the current logged-in user
// Fetch a user by userId
export const fetchCurrentUser = async (userId: string) => {
    const response = await api.get(`/api/users/${userId}`);
    return response.data.user;
};
  

// Fetch all users (Admin only)
export const fetchUsers = async () => {
  const response = await api.get("/api/users");
  return response.data;
};

// Update user profile
export const updateUser = async (userId: string, updates: UserProfileUpdate) => {
  const response = await api.put(`/api/users/${userId}`, updates);
  return response.data;
};

// Delete a user
export const deleteUser = async (userId: string) => {
  const response = await api.delete(`/api/users/${userId}`);
  return response.data;
};
