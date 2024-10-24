import React from "react";
import { Navigate } from "react-router-dom";
import { useUserStore } from "../store/useUserStore";
import { toast } from "react-toastify";

// const PrivateRoute = ({ children, role }) => {
//   const { isLoggedIn } = useUserStore();
//   if (!isLoggedIn) {
//     return <Navigate to="/public/login" />;
//   }

//   if (!children.type.name.toUpperCase().includes(role.toUpperCase())) {
//     return <Navigate to={'/'} />;
//   }

//   return children;
// };

const PrivateRoute = ({ children, role }) => {
  const { isLoggedIn } = useUserStore();

  if (!isLoggedIn) {
    return <Navigate to="/public/login" />;
  }

  // Kiểm tra an toàn để đảm bảo children là một component có type và name
  if (children && children.type && children.type.name) {
    if (!children.type.name.toUpperCase().includes(role.toUpperCase())) {
      return <Navigate to="/" />;
    }
  } else {
    // Nếu children không phải là component hoặc không có name (có thể là HTML element)
    console.warn(
      "Child component does not have a type or name. Skipping role check."
    );
  }

  return children;
};

export default PrivateRoute;
