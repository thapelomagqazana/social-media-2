/**
 * @file SignIn.tsx
 * @description The sign-in page component.
 */

import { Container, Typography, Link } from "@mui/material";
import SignInForm from "../components/Auth/SignInForm";

/**
 * Sign-in page component.
 */
const SignInPage = () => {
  return (
    <Container maxWidth="xs" style={{ marginTop: "3rem", textAlign: "center" }}>
      <Typography variant="h4" fontWeight={600}>Welcome Back!</Typography>
      <Typography variant="body1" color="textSecondary">Sign in to connect with friends.</Typography>
      <SignInForm />
      <Link href="/reset-password" underline="hover" style={{ display: "block", marginTop: "1rem" }}>
        Forgot Password?
      </Link>
      <Typography variant="body2" style={{ marginTop: "1rem" }}>
        New here? <Link href="/signup">Create an account</Link>
      </Typography>
    </Container>
  );
};

export default SignInPage;
