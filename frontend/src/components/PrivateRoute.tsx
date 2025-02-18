import { Navigate, Outlet } from "react-router-dom";
import { CircularProgress, Box, Typography } from "@mui/material";

/**
 * @component PrivateRoute
 * @description Restricts access to authenticated users only. Redirects to login if unauthenticated.
 */
const PrivateRoute = () => {
  const user = localStorage.getItem("user");

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
