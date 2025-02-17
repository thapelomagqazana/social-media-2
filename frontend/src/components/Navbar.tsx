/**
 * Navigation menu component.
 *
 * - Provides links to different pages.
 * - Uses Material-UI for styling.
 * - Dynamically updates menu options based on authentication status.
 * - Includes a responsive hamburger menu for mobile view.
 * - Displays a logout confirmation modal before signing out.
 */

import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  AppBar,
  Toolbar,
  Button,
  Typography,
  IconButton,
  Menu,
  MenuItem,
  Avatar,
  Drawer,
  List,
  ListItem,
  ListItemText,
  Dialog,
  DialogTitle,
  DialogActions,
  DialogContent,
  useMediaQuery
} from "@mui/material";
import { Menu as MenuIcon } from "@mui/icons-material";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "@mui/material/styles";

const Navbar: React.FC = () => {
  const { user, logout } = useAuth(); // Get user state and logout function
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  // State for dropdown menu (Profile, Settings, Logout)
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  // State for mobile drawer
  const [mobileOpen, setMobileOpen] = useState(false);

  // State for logout confirmation modal
  const [logoutModalOpen, setLogoutModalOpen] = useState(false);

  /**
   * Handle user menu open (Profile, Settings, Logout)
   */
  const handleMenuOpen = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  /**
   * Handle user menu close
   */
  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  /**
   * Handle logout confirmation
   */
  const handleLogout = () => {
    setLogoutModalOpen(true);
  };

  /**
   * Confirm logout and clear session
   */
  const confirmLogout = () => {
    logout();
    navigate("/signin");
    setLogoutModalOpen(false);
  };

  /**
   * Toggle mobile drawer (hamburger menu)
   */
  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  return (
    <AppBar position="static" color="primary">
      <Toolbar>
        {/* Branding */}
        <Typography variant="h6" sx={{ flexGrow: 1 }}>
          MERN Skeleton
        </Typography>

        {/* Hamburger Menu for Mobile View */}
        {isMobile ? (
          <>
            <IconButton color="inherit" onClick={handleDrawerToggle}>
              <MenuIcon />
            </IconButton>
            <Drawer
              anchor="left"
              open={mobileOpen}
              onClose={handleDrawerToggle}
            >
              <List>
                <ListItem button component={Link} to={user ? "/dashboard" : "/"}>
                  <ListItemText primary="Home" />
                </ListItem>
                {!user ? (
                  <>
                    <ListItem button component={Link} to="/signup">
                      <ListItemText primary="Sign Up" />
                    </ListItem>
                    <ListItem button component={Link} to="/signin">
                      <ListItemText primary="Sign In" />
                    </ListItem>
                  </>
                ) : (
                  <>
                    <ListItem button component={Link} to={"/users"}>
                      <ListItemText primary="Users" />
                    </ListItem>
                    <ListItem button component={Link} to={`/profile/${user.id}`}>
                      <ListItemText primary="Profile" />
                    </ListItem>
                    <ListItem button onClick={handleLogout}>
                      <ListItemText primary="Logout" />
                    </ListItem>
                  </>
                )}
              </List>
            </Drawer>
          </>
        ) : (
          <>
            {/* Desktop Navigation */}
            <Button color="inherit" component={Link} to={user ? "/dashboard" : "/"}>
              Home
            </Button>

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
              <>
                <Button color="inherit" component={Link} to={"/users"}>
                  Users
                </Button>

                {/* Avatar Button to Open User Dropdown */}
                <IconButton onClick={handleMenuOpen} color="inherit">
                  <Avatar alt={user.name} src={user.profilePicture || ""} />
                </IconButton>

                {/* Dropdown Menu for User Options */}
                <Menu
                  anchorEl={anchorEl}
                  open={open}
                  onClose={handleMenuClose}
                >
                  <MenuItem
                    component={Link}
                    to={`/profile/${user.id}`}
                    onClick={handleMenuClose}
                  >
                    Profile
                  </MenuItem>
                  <MenuItem onClick={handleMenuClose}>Settings</MenuItem>
                  <MenuItem onClick={handleLogout}>Logout</MenuItem>
                </Menu>
              </>
            )}
          </>
        )}
      </Toolbar>

      {/* Logout Confirmation Modal */}
      <Dialog
        open={logoutModalOpen}
        onClose={() => setLogoutModalOpen(false)}
      >
        <DialogTitle>Confirm Logout</DialogTitle>
        <DialogContent>
          Are you sure you want to log out?
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setLogoutModalOpen(false)} color="primary">
            Stay Logged In
          </Button>
          <Button onClick={confirmLogout} color="error">
            Yes, Log Out
          </Button>
        </DialogActions>
      </Dialog>
    </AppBar>
  );
};

export default Navbar;
