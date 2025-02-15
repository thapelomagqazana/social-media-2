/**
 * @file InterestsSelection.tsx
 * @description Component for selecting user interests.
 */

import { Typography, Grid, Chip } from "@mui/material";

interface InterestsSelectionProps {
  interests: string[];
  selectedInterests: string[];
  onSelect: (interest: string) => void;
  error?: string;
}

/**
 * @component InterestsSelection
 * @description Allows users to select their interests.
 */
const InterestsSelection: React.FC<InterestsSelectionProps> = ({ interests, selectedInterests, onSelect, error }) => (
  <>
    <Typography variant="subtitle1">Select Your Interests</Typography>
    <Grid container spacing={1}>
      {interests.map((interest) => (
        <Grid item key={interest}>
          <Chip
            label={interest}
            clickable
            color={selectedInterests.includes(interest) ? "primary" : "default"}
            onClick={() => onSelect(interest)}
          />
        </Grid>
      ))}
    </Grid>
    {error && <Typography color="error">{error}</Typography>}
  </>
);

export default InterestsSelection;
