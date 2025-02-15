/**
 * @file SignInForm.tsx
 * @description Sign-in form component handling user authentication with validation.
 */

import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { TextField, Button, Checkbox, FormControlLabel, Snackbar, Alert } from "@mui/material";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { loginUser } from "../../services/userService";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";

// Validation Schema
const schema = yup.object().shape({
  email: yup.string().email("Enter a valid email address").required("Email is required"),
  password: yup.string().min(8, "Password must be at least 8 characters").required("Password is required"),
  rememberMe: yup.boolean(),
});

/**
 * Sign-in form component with validation and authentication.
 */
const SignInForm = () => {
  const navigate = useNavigate();
  const { authUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" as "success" | "error" });

  const { control, handleSubmit, formState: { errors } } = useForm({
    resolver: yupResolver(schema),
    defaultValues: { email: "", password: "", rememberMe: false },
  });

  /**
   * Handles form submission for user login.
   */
  const onSubmit = async (formData: any) => {
    setLoading(true);
    try {
      const response = await loginUser({ email: formData.email, password: formData.password, rememberMe: formData.rememberMe });
      authUser(response);
      setSnackbar({ open: true, message: response.message, severity: "success" });
      setTimeout(() => navigate("/home"), 2000);
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
    <form onSubmit={handleSubmit(onSubmit)} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
      <Controller
        name="email"
        control={control}
        render={({ field }) => <TextField {...field} label="Email" fullWidth error={!!errors.email} helperText={errors.email?.message} />}
      />
      <Controller
        name="password"
        control={control}
        render={({ field }) => <TextField {...field} label="Password" type="password" fullWidth error={!!errors.password} helperText={errors.password?.message} />}
      />
      <Controller
        name="rememberMe"
        control={control}
        render={({ field }) => <FormControlLabel control={<Checkbox {...field} />} label="Remember Me" />}
      />
      <Button type="submit" variant="contained" color="primary" fullWidth disabled={loading}>
        {loading ? "Signing In..." : "Sign In"}
      </Button>
      <Snackbar open={snackbar.open} autoHideDuration={3000} onClose={() => setSnackbar({ ...snackbar, open: false })}>
        <Alert severity={snackbar.severity}>{snackbar.message}</Alert>
      </Snackbar>
    </form>
  );
};

export default SignInForm;
