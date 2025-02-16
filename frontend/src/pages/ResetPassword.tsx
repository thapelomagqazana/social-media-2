/**
 * @file ResetPassword.tsx
 * @description Handles password reset functionality, allowing users to set a new password.
 *
 * - Uses React Hook Form for validation.
 * - Sends request to backend to update the password.
 * - Displays inline validation errors and success messages.
 */

import React, { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { useParams, useNavigate } from "react-router-dom";
import { resetPassword } from "../services/authService";
import {
  Box,
  Button,
  Typography,
  Snackbar,
  Alert,
  CircularProgress,
} from "@mui/material";
import PasswordInput from "../components/PasswordInput";

/**
 * @interface ResetPasswordFormValues
 * Defines the structure for form data.
 */
interface ResetPasswordFormValues {
  password: string;
  confirmPassword: string;
}

// Validation schema for password reset form
const schema = yup.object().shape({
  password: yup
    .string()
    .min(8, "Password must be at least 8 characters")
    .required("New password is required"),
  confirmPassword: yup
    .string()
    .oneOf([yup.ref("password")], "Passwords do not match")
    .required("Confirm password is required"),
});

/**
 * @component ResetPassword
 * @description Page component for resetting a user's password.
 */
const ResetPassword: React.FC = () => {
  const { token } = useParams(); // Get reset token from URL
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" as "success" | "error" });

  const { control, handleSubmit, formState: { errors } } = useForm<ResetPasswordFormValues>({
    resolver: yupResolver(schema),
    defaultValues: { password: "", confirmPassword: "" },
  });

  /**
   * @function onSubmit
   * @description Handles form submission to reset the password.
   */
  const onSubmit = async (data: ResetPasswordFormValues) => {
    setLoading(true);
    try {
      await resetPassword(token!, data.password);
      setSnackbar({ open: true, message: "Password reset successful!", severity: "success" });
      setTimeout(() => navigate("/signin"), 3000); // Redirect after success
    } catch (error: unknown) {
        if (error instanceof Error && "response" in error) {
          const axiosError = error as { response?: { data?: { message?: string } } }; // Proper type assertion
          setSnackbar({
            open: true,
            message: axiosError.response?.data?.message || "Signin failed",
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
    <Box component="form" onSubmit={handleSubmit(onSubmit)} sx={{ maxWidth: 400, mx: "auto", mt: 5 }}>
      <Typography variant="h5" fontWeight={600} gutterBottom>
        Reset Your Password
      </Typography>

      {/* Password Input */}
      <Controller
        name="password"
        control={control}
        render={({ field }) => <PasswordInput {...field} label="New Password" error={!!errors.password} helperText={errors.password?.message} />}
      />

      {/* Confirm Password Input */}
      <Controller
        name="confirmPassword"
        control={control}
        render={({ field }) => <PasswordInput {...field} label="Confirm Password" error={!!errors.confirmPassword} helperText={errors.confirmPassword?.message} />}
      />

      {/* Submit Button */}
      <Button type="submit" variant="contained" color="primary" fullWidth disabled={loading} sx={{ mt: 2 }}>
        {loading ? <CircularProgress size={24} color="inherit" /> : "Reset Password"}
      </Button>

      {/* Snackbar Feedback */}
      <Snackbar open={snackbar.open} autoHideDuration={3000} onClose={() => setSnackbar({ ...snackbar, open: false })}>
        <Alert severity={snackbar.severity} onClose={() => setSnackbar({ ...snackbar, open: false })}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default ResetPassword;
