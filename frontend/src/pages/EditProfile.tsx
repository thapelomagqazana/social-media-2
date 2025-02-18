import EditProfileForm from "../components/Profile/EditProfileForm";
import { Container } from "@mui/material";

/**
 * EditProfile Page: Renders the Edit Profile Form.
 */
const EditProfile = () => {
  return (
    <Container maxWidth="sm">
      <EditProfileForm />
    </Container>
  );
};

export default EditProfile;
