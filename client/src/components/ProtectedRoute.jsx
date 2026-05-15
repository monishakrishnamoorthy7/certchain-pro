import { Navigate } from "react-router-dom";
import useAuth from "../hooks/useAuth.js";

export default function ProtectedRoute({ children }) {
  const { authState } = useAuth();
  if (!authState.isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  return children;
}
