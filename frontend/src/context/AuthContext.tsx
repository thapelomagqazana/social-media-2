import React, { createContext, useContext, useState, useEffect } from "react";
import { jwtDecode } from "jwt-decode";
import { logoutUser } from "../services/userService";

// Define user type
interface User {
  id: string;
  name: string;
  email: string;
  profilePicture?: string;
}

// Define AuthContext type
interface AuthContextType {
  user: User | null;
  authUser: (data: any) => void;
  logout: () => void;
}

// Create AuthContext
const AuthContext = createContext<AuthContextType | null>(null);

// Custom hook to use AuthContext
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

// Type for decoded JWT token
interface DecodedToken {
  exp: number; // Expiration time in seconds
  id: string;
}

/**
 * @component AuthProvider
 * @description Manages authentication state and user persistence.
 */
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);

  /**
   * Function to check if the token is expired
   */
  const isTokenExpired = (token: string) => {
    try {
      const decoded: DecodedToken = jwtDecode(token);
      return decoded.exp * 1000 < Date.now(); // Convert exp to milliseconds
    } catch {
      return true; // Assume expired if decoding fails
    }
  };

  /**
   * Retrieve credentials from localStorage on page reload
   */
  useEffect(() => {
    const token = localStorage.getItem("token");
    const storedUser = localStorage.getItem("user");

    if (!token || !storedUser || isTokenExpired(token)) {
      logout(); // Expired or missing token → log out
      return;
    }

    setUser(JSON.parse(storedUser)); // Restore user data from localStorage
  }, []);

  /**
   * Save credentials on successful login
   */
  const authUser = (data: any) => {
    localStorage.setItem("token", data.token);
    localStorage.setItem("user", JSON.stringify(data.user)); // Store user object
    setUser(data.user);
  };

  /**
   * Delete credentials on logout
   */
  const logout = () => {
    logoutUser();
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
  };

  return <AuthContext.Provider value={{ user, authUser, logout }}>{children}</AuthContext.Provider>;
};

// Export AuthContext & useAuth properly
export { AuthContext };
