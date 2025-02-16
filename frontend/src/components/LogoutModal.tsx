/**
 * @file LogoutModal.tsx
 * @description Logout confirmation modal for better UX.
 */

import { Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Button } from "@mui/material";

interface LogoutModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

const LogoutModal: React.FC<LogoutModalProps> = ({ open, onClose, onConfirm }) => {
  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>Confirm Logout</DialogTitle>
      <DialogContent>
        <DialogContentText>
          Are you sure you want to log out?
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="primary">Cancel</Button>
        <Button onClick={onConfirm} color="secondary">Logout</Button>
      </DialogActions>
    </Dialog>
  );
};

export default LogoutModal;
