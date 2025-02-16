/**
 * Navigation menu component.
 *
 * - Provides links to different pages.
 * - Uses Material-UI for styling.
 * - Dynamically updates menu options based on authentication status.
 */

import React from "react";
import { Link } from "react-router-dom";
import { AppBar, Toolbar, Button, Typography } from "@mui/material";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

const Menu: React.FC = () => {
  const { user, logout } = useAuth(); // Get user state and logout function
  const navigate = useNavigate();

  return (
    <AppBar position="static" color="primary">
      <Toolbar>
        <Typography variant="h6" sx={{ flexGrow: 1 }}>
          MERN Skeleton
        </Typography>

        {/* Dynamic Home Button */}
        <Button color="inherit" component={Link} to={user ? "/dashboard" : "/"}>
          Home
        </Button>

        {/* Show these buttons only if user is NOT logged in */}
        {!user ? (
          <>
            <Button color="inherit" component={Link} to="/signup">
              Sign Up
            </Button>
            <Button color="inherit" component={Link} to="/signin">
              Sign In
            </Button>
          </>
        ) : (
          /* Show Profile & Logout if user is logged in */
          <>
            <Button color="inherit" component={Link} to={"/users"}>
              Users
            </Button>
            <Button color="inherit" component={Link} to={`/profile/${user.id}`}>
              Profile
            </Button>
            <Button color="inherit" onClick={() => { logout(); navigate("/signin"); }}>
              Logout
            </Button>
          </>
        )}
      </Toolbar>
    </AppBar>
  );
};

export default Menu;
