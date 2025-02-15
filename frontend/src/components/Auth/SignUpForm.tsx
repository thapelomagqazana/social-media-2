/**
 * @file SignUpForm.tsx
 * @description Handles user registration with validation, password strength, error handling, and Snackbar notifications.
 */

import { useState } from "react";
import {
  Box,
  TextField,
  Button,
  Checkbox,
  FormControlLabel,
  Typography,
  LinearProgress,
  Snackbar,
  Alert,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup"; // Yup Resolver
import * as yup from "yup"; // Validation Schema
import { registerUser } from "../../services/UserService"; // Import register function

// Validation Schema
const schema = yup.object().shape({
  name: yup.string().min(2, "Name must be at least 2 characters long.").required("Name is required."),
  email: yup.string().email("Please enter a valid email address.").required("Email is required."),
  password: yup
    .string()
    .min(6, "Password must be at least 6 characters long.")
    .required("Password is required."),
  confirmPassword: yup
    .string()
    .oneOf([yup.ref("password")], "Passwords do not match.")
    .required("Confirm Password is required."),
  agreed: yup.boolean().oneOf([true], "You must agree to the Terms & Conditions."),
});

// Password Strength Function
const getPasswordStrength = (password: string): string => {
  if (password.length < 6) return "Weak";
  if (password.length < 10) return "Medium";
  if (/[A-Z]/.test(password) && /\d/.test(password) && /[^A-Za-z0-9]/.test(password)) return "Strong";
  return "Medium";
};

/**
 * @component SignUpForm
 * @description Displays a sign-up form with validation, loading animation, Snackbar alerts, and password strength feedback.
 */
export const SignUpForm = () => {
  const navigate = useNavigate();
  const [passwordStrength, setPasswordStrength] = useState("");
  const [loading, setLoading] = useState(false); // Loading state
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success" as "success" | "error",
  });

  const {
    control,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: { name: "", email: "", password: "", confirmPassword: "", agreed: false },
  });

  const password = watch("password");

  /**
   * @function onSubmit
   * @description Handles form submission, validation, and API request using registerUser function.
   */
  const onSubmit = async (formData: any) => {
    setLoading(true); // Start loading state

    try {
      // Call API to register user
      await registerUser({ name: formData.name, email: formData.email, password: formData.password });

      setSnackbar({
        open: true,
        message: "Your account has been created successfully!",
        severity: "success",
      });
      setTimeout(() => navigate("/verify-email"), 2000); // Redirect after success
    } catch (error: unknown) {
      if (error instanceof Error && "response" in error) {
        const axiosError = error as { response?: { data?: { message?: string } } }; // Proper type assertion
        setSnackbar({
          open: true,
          message: axiosError.response?.data?.message || "Signup failed",
          severity: "error",
        });
      } else {
        setSnackbar({
          open: true,
          message: "An unexpected error occurred",
          severity: "error",
        });
      }
    } finally {
      setLoading(false); // Stop loading state
    }
  };

  return (
    <Box
      component="form"
      onSubmit={handleSubmit(onSubmit)}
      sx={{ display: "flex", flexDirection: "column", gap: 2 }}
    >
      {/* Name Field */}
      <Controller
        name="name"
        control={control}
        render={({ field }) => (
          <TextField
            {...field}
            label="Full Name"
            fullWidth
            error={!!errors.name}
            helperText={errors.name?.message}
          />
        )}
      />

      {/* Email Field */}
      <Controller
        name="email"
        control={control}
        render={({ field }) => (
          <TextField
            {...field}
            label="Email Address"
            type="email"
            fullWidth
            error={!!errors.email}
            helperText={errors.email?.message}
          />
        )}
      />

      {/* Password Field */}
      <Controller
        name="password"
        control={control}
        render={({ field }) => (
          <TextField
            {...field}
            label="Password"
            type="password"
            fullWidth
            onChange={(e) => {
              field.onChange(e);
              setPasswordStrength(getPasswordStrength(e.target.value));
            }}
            error={!!errors.password}
            helperText={errors.password?.message}
          />
        )}
      />
      <Typography
        variant="caption"
        color={
          passwordStrength === "Weak"
            ? "error"
            : passwordStrength === "Medium"
            ? "warning.main"
            : "success.main"
        }
      >
        Password Strength: {passwordStrength}
      </Typography>

      {/* Confirm Password Field */}
      <Controller
        name="confirmPassword"
        control={control}
        render={({ field }) => (
          <TextField
            {...field}
            label="Confirm Password"
            type="password"
            fullWidth
            error={!!errors.confirmPassword}
            helperText={errors.confirmPassword?.message}
          />
        )}
      />

      {/* Terms & Conditions */}
      <Controller
        name="agreed"
        control={control}
        render={({ field }) => (
          <FormControlLabel
            control={<Checkbox {...field} checked={field.value} />}
            label="I agree to the Terms & Conditions"
          />
        )}
      />
      {errors.agreed && <Typography color="error">{errors.agreed.message}</Typography>}

      {loading && <LinearProgress sx={{ mb: 1 }} />} {/* Show loading animation */}

      <Button type="submit" variant="contained" color="primary" fullWidth disabled={loading}>
        {loading ? "Signing Up..." : "Sign Up"}
      </Button>

      {/* Snackbar for feedback messages */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert
          severity={snackbar.severity}
          onClose={() => setSnackbar({ ...snackbar, open: false })}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};
