/**
 * @file DisplayNameInput.tsx
 * @description Input field for entering the display name.
 */

import { TextField } from "@mui/material";
import { Controller } from "react-hook-form";

interface DisplayNameInputProps {
  control: any;
  error?: string;
}

/**
 * @component DisplayNameInput
 * @description Allows users to enter a display name.
 */
const DisplayNameInput: React.FC<DisplayNameInputProps> = ({ control, error }) => (
  <Controller
    name="displayName"
    control={control}
    render={({ field }) => (
      <TextField {...field} label="Display Name" fullWidth error={!!error} helperText={error} />
    )}
  />
);

export default DisplayNameInput;
