import { useState } from "react";
import { Switch } from "@mui/material";

export default function ThemeToggle({ toggleTheme }: { toggleTheme: () => void }) {
  const [checked, setChecked] = useState(false);

  return (
    <Switch
      checked={checked}
      onChange={() => {
        setChecked(!checked);
        toggleTheme();
      }}
    />
  );
}
