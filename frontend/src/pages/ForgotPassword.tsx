/**
 * @file ForgotPassword.tsx
 * @description Page for users to request a password reset.
 */

import React from "react";
import { Container } from "@mui/material";
import ForgotPasswordForm from "../components/Reset/ForgotPasswordForm";

/**
 * @component ForgotPassword
 * @description Page containing the Forgot Password form.
 */
const ForgotPassword: React.FC = () => {
  return (
    <Container>
      <ForgotPasswordForm />
    </Container>
  );
};

export default ForgotPassword;
