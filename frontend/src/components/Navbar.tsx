/**
 * @file Menu.tsx
 * @description Navigation bar with user profile dropdown and logout functionality.
 */

import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AppBar, Toolbar, Button, Typography, Avatar, IconButton, Menu, MenuItem } from "@mui/material";
import LogoutModal from "./LogoutModal";
import { useAuth } from "../context/AuthContext";
import { FaBars } from "react-icons/fa";

const Navbar: React.FC = () => {
  // State for dropdown menu
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [logoutModalOpen, setLogoutModalOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Context for authentication
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  // Open/Close profile dropdown
  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  // Open/Close mobile menu
  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  return (
    <AppBar position="static" color="primary">
      <Toolbar className="flex justify-between items-center">
        {/* Logo */}
        <Typography variant="h6" className="font-bold">
          MyApp
        </Typography>

        {/* Navigation Links (Desktop) */}
        <div className="hidden md:flex space-x-4">
          <Button color="inherit" component={Link} to="/home">Home</Button>
          <Button color="inherit" component={Link} to="/about">About</Button>
          <Button color="inherit" component={Link} to="/services">Services</Button>
        </div>

        {/* Profile Section */}
        <div className="flex items-center">
          {user ? (
            <>
              {/* Profile Avatar with Dropdown */}
              <IconButton onClick={handleMenuOpen}>
                <Avatar src={user.profilePicture || "/assets/avatar.png"} alt="Profile" />
              </IconButton>
              <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleMenuClose}
              >
                <MenuItem component={Link} to="/profile">Profile</MenuItem>
                <MenuItem component={Link} to="/settings">Settings</MenuItem>
                <MenuItem onClick={() => setLogoutModalOpen(true)}>Logout</MenuItem>
              </Menu>
            </>
          ) : (
            <Link to="/signin">
              <Button variant="contained" color="secondary">Sign In</Button>
            </Link>
          )}
        </div>

        {/* Mobile Menu Icon */}
        <div className="md:hidden">
          <IconButton onClick={toggleMobileMenu}>
            <FaBars className="text-white text-xl" />
          </IconButton>
        </div>
      </Toolbar>

      {/* Mobile Navigation Links */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-primary flex flex-col space-y-2 py-2 px-4">
          <Button color="inherit" component={Link} to="/home" onClick={toggleMobileMenu}>Home</Button>
          <Button color="inherit" component={Link} to="/about" onClick={toggleMobileMenu}>About</Button>
          <Button color="inherit" component={Link} to="/services" onClick={toggleMobileMenu}>Services</Button>
        </div>
      )}

      {/* Logout Confirmation Modal */}
      <LogoutModal open={logoutModalOpen} onClose={() => setLogoutModalOpen(false)} onConfirm={() => {
        logout();
        navigate("/signin");
        setAnchorEl(null);
      }} />
    </AppBar>
  );
};

export default Navbar;
