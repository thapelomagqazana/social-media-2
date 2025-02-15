import { createTheme, ThemeOptions } from "@mui/material/styles";
import { CSSObject } from "@mui/system"; 

// Define color palettes
const lightPalette: ThemeOptions["palette"] = {
  primary: { main: "#1DA1F2", contrastText: "#FFFFFF" },
  secondary: { main: "#FF4081" },
  background: { default: "#F5F8FA", paper: "#FFFFFF" },
  text: { primary: "#14171A", secondary: "#657786" },
  success: { main: "#17BF63" },
  error: { main: "#E0245E" },
  warning: { main: "#FFAD1F" },
};

const darkPalette: ThemeOptions["palette"] = {
  primary: { main: "#1DA1F2", contrastText: "#FFFFFF" },
  secondary: { main: "#FF4081" },
  background: { default: "#15202B", paper: "#192734" },
  text: { primary: "#E1E8ED", secondary: "#8899A6" },
  success: { main: "#17BF63" },
  error: { main: "#E0245E" },
  warning: { main: "#FFAD1F" },
};

// Define typography
const typography: ThemeOptions["typography"] = {
  fontFamily: "'Inter', sans-serif",
  h1: { fontSize: "2rem", fontWeight: 700 },
  h2: { fontSize: "1.75rem", fontWeight: 600 },
  h3: { fontSize: "1.5rem", fontWeight: 600 },
  body1: { fontSize: "1rem", fontWeight: 400 },
  body2: { fontSize: "0.875rem", fontWeight: 400, color: "#657786" },
  button: { fontSize: "0.875rem", fontWeight: 600, textTransform: "capitalize" }, // ✅ Fixed
};

// Define component overrides
const components: ThemeOptions["components"] = {
  MuiButton: {
    styleOverrides: {
      root: {
        borderRadius: "25px",
        textTransform: "capitalize",
        padding: "10px 20px",
      } as CSSObject,
    },
  },
  MuiCard: {
    styleOverrides: {
      root: {
        borderRadius: "15px",
        boxShadow: "0px 2px 10px rgba(0, 0, 0, 0.1)",
      } as CSSObject,
    },
  },
};

// Dark Mode Theme
export const darkTheme = createTheme({ palette: darkPalette, typography, components });

// Light Mode Theme
export const lightTheme = createTheme({ palette: lightPalette, typography, components });
