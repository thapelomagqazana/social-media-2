/**
 * @file ForgotPasswordForm.tsx
 * @description Forgot password form for requesting a reset link.
 */

import React, { useState } from "react";
import { Box, TextField, Button, Typography, Snackbar, Alert, CircularProgress } from "@mui/material";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
// import { requestPasswordReset } from "../services/authService";

// Validation schema using Yup
const schema = yup.object().shape({
  email: yup.string().email("Enter a valid email address.").required("Email is required."),
});

/**
 * @component ForgotPasswordForm
 * @description Handles user input for requesting a password reset link.
 */
const ForgotPasswordForm: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" as "success" | "error" });

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: { email: "" },
  });

  /**
   * Handles form submission for password reset.
   * @param formData - Contains the user's email.
   */
  const onSubmit = async (formData: { email: string }) => {
    setLoading(true);
    try {
    //   const message = await requestPasswordReset(formData.email.trim().toLowerCase());
      setSnackbar({ open: true, message, severity: "success" });
    } catch (error: any) {
      setSnackbar({ open: true, message: error, severity: "error" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit(onSubmit)} sx={{ maxWidth: 400, mx: "auto", mt: 5, p: 3, borderRadius: 2, boxShadow: 2 }}>
      <Typography variant="h5" fontWeight={600} gutterBottom>
        Forgot Password?
      </Typography>
      <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
        Enter your registered email address, and we will send you a password reset link.
      </Typography>

      {/* Email Input Field */}
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

      {/* Submit Button */}
      <Button type="submit" variant="contained" color="primary" fullWidth sx={{ mt: 2 }} disabled={loading}>
        {loading ? <CircularProgress size={24} color="inherit" /> : "Send Reset Link"}
      </Button>

      {/* Snackbar for success/error messages */}
      <Snackbar open={snackbar.open} autoHideDuration={3000} onClose={() => setSnackbar({ ...snackbar, open: false })}>
        <Alert severity={snackbar.severity} onClose={() => setSnackbar({ ...snackbar, open: false })}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default ForgotPasswordForm;
