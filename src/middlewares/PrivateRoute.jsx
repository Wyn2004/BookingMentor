import React from "react";
import { Navigate } from "react-router-dom";
import { useUserStore } from "../store/useUserStore";
import { toast } from "react-toastify";

const PrivateRoute = ({ children, role }) => {
  const { isLoggedIn } = useUserStore();
  if (!isLoggedIn) {
    return <Navigate to="/public/login" />;
  }

  console.log(children.type.name);

  if (children.type.name.toUpperCase().includes(role.toUpperCase())) {
    return children;
  }
  return <Navigate to={"/"} />;
};

export default PrivateRoute;
