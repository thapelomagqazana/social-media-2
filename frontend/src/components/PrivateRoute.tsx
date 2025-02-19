import { Navigate, Outlet } from "react-router-dom";

/**
 * @component PrivateRoute
 * @description Restricts access to authenticated users only. Redirects to login if unauthenticated.
 */
const PrivateRoute = () => {
  const user  = localStorage.getItem("user");

  if (user === null) {
    return <Navigate to="/signin" replace />;
  }

  return <Outlet />;
};

export default PrivateRoute;
