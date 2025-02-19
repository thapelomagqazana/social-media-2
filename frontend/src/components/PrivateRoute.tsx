import { Navigate, Outlet } from "react-router-dom";
import { CircularProgress, Box, Typography } from "@mui/material";
import { useAuth } from "../context/AuthContext";

/**
 * @component PrivateRoute
 * @description Restricts access to authenticated users only. Redirects to login if unauthenticated.
 */
const PrivateRoute = () => {
  const { user } = useAuth(); // Get user state and logout function

  if (user === undefined) {
    // Show loading spinner while authentication state is being determined
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="100vh">
        <CircularProgress />
        <Typography variant="body1" sx={{ ml: 2 }}>
          Checking authentication...
        </Typography>
      </Box>
    );
  }

  return user ? <Outlet /> : <Navigate to="/signin" replace />;
};

export default PrivateRoute;
