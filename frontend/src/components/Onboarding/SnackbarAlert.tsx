/**
 * @file SnackbarAlert.tsx
 * @description Displays notifications using Snackbar.
 */

import { Snackbar, Alert } from "@mui/material";

interface SnackbarAlertProps {
  open: boolean;
  message: string;
  severity: "success" | "error";
  onClose: () => void;
}

/**
 * @component SnackbarAlert
 * @description Displays a snackbar notification.
 */
const SnackbarAlert: React.FC<SnackbarAlertProps> = ({ open, message, severity, onClose }) => (
  <Snackbar open={open} autoHideDuration={3000} onClose={onClose}>
    <Alert severity={severity} onClose={onClose}>
      {message}
    </Alert>
  </Snackbar>
);

export default SnackbarAlert;
