/**
 * @file DropdownMenu.tsx
 * @description Dropdown menu for user profile actions (Profile, Settings, Logout).
 */

import { Link } from "react-router-dom";

interface DropdownProps {
  logout: () => void;
}

const DropdownMenu: React.FC<DropdownProps> = ({ logout }) => {
  return (
    <div className="absolute right-0 mt-2 w-48 bg-white text-gray-700 shadow-md rounded-md z-50">
      <ul className="py-2">
        <li>
          <Link to="/profile" className="block px-4 py-2 hover:bg-gray-100">Profile</Link>
        </li>
        <li>
          <Link to="/settings" className="block px-4 py-2 hover:bg-gray-100">Settings</Link>
        </li>
        <li>
          <button
            onClick={logout}
            className="w-full text-left px-4 py-2 hover:bg-gray-100"
          >
            Logout
          </button>
        </li>
      </ul>
    </div>
  );
};

export default DropdownMenu;
