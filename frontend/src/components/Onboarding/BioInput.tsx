/**
 * @file BioInput.tsx
 * @description Text area for users to input a short bio.
 */

import { TextField } from "@mui/material";
import { Controller } from "react-hook-form";

interface BioInputProps {
  control: any;
  error?: string;
}

/**
 * @component BioInput
 * @description Allows users to enter a short bio.
 */
const BioInput: React.FC<BioInputProps> = ({ control, error }) => (
  <Controller
    name="bio"
    control={control}
    render={({ field }) => (
      <TextField {...field} label="Short Bio" multiline rows={3} fullWidth error={!!error} helperText={error} />
    )}
  />
);

export default BioInput;
