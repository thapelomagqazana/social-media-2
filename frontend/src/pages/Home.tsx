import React from "react";
import UsersList from "../components/Users/UsersList";

/**
 * Home Page
 * Displays the UsersList component along with other UI sections.
 */
const Home: React.FC = () => {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold">Welcome to MERN Social</h1>
      <UsersList />
    </div>
  );
};

export default Home;
