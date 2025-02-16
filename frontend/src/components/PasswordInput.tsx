/**
 * @file PasswordInput.tsx
 * @description Custom password input component with show/hide toggle.
 */

import React, { useState } from "react";
import { TextField, IconButton, InputAdornment } from "@mui/material";
import { Visibility, VisibilityOff } from "@mui/icons-material";

/**
 * @interface PasswordInputProps
 * Defines the props for the PasswordInput component.
 */
interface PasswordInputProps {
  label: string;
  error?: boolean;
  helperText?: string;
  value: string;
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

/**
 * @component PasswordInput
 * @description A password input field with visibility toggle.
 */
const PasswordInput: React.FC<PasswordInputProps> = ({ label, error, helperText, value, onChange }) => {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <TextField
      fullWidth
      label={label}
      type={showPassword ? "text" : "password"}
      variant="outlined"
      error={error}
      helperText={helperText}
      value={value}
      onChange={onChange}
      margin="normal"
      InputProps={{
        endAdornment: (
          <InputAdornment position="end">
            <IconButton onClick={() => setShowPassword(!showPassword)} edge="end">
              {showPassword ? <VisibilityOff /> : <Visibility />}
            </IconButton>
          </InputAdornment>
        ),
      }}
    />
  );
};

export default PasswordInput;
