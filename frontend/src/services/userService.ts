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
  name?: string;
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

/**
 * Logs in the user.
 * @param email - The user's email.
 * @param password - The user's password.
 * @param rememberMe - Boolean flag for session persistence.
 * @returns Promise resolving user token or error message.
 */
export const loginUser = async (credentials: { email: string, password: string, rememberMe: boolean }) => {
    const response = await api.post("/api/auth/signin", credentials);

    if (response.status === 200) {
      // Store token based on "Remember Me" option
      if (credentials.rememberMe) {
        localStorage.setItem("token", response.data.token);
      } else {
        sessionStorage.setItem("token", response.data.token);
      }
    }
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

// Fetch a user by userId
export const fetchUserById = async (userId: string) => {
    const response = await api.get(`/api/users/${userId}`);
    return response.data.user;
};
  

// Fetch all users (Admin only)
export const fetchUsers = async () => {
  const response = await api.get("/api/users");
  // console.log(response.data.users);
  return response.data.users;
};

/**
 * Update user profile.
 * Accepts either `UserProfileUpdate` (JSON) or `FormData` (for file upload).
 */
export const updateUser = async (userId: string, updates: UserProfileUpdate | FormData) => {
  // const isFormData = updates instanceof FormData;
  // console.log(updates);

  return api.put(`/api/users/${userId}`, updates, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  
    }).then(response => response.data)
    .catch(error => {
      throw error;
    });
};


// Delete a user
export const deleteUser = async (userId: string) => {
  const response = await api.delete(`/api/users/${userId}`);
  return response.data;
};
