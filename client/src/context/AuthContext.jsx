import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { decodeToken, getToken, isTokenValid, loginWithWallet, logout } from "../services/auth.js";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [authState, setAuthState] = useState({
    address: null,
    token: null,
    isAuthenticated: false,
    status: "idle",
    error: null
  });

  const handleLogin = async () => {
    try {
      setAuthState((prev) => ({ ...prev, status: "loading", error: null }));
      const { address, token } = await loginWithWallet();
      setAuthState({
        address,
        token,
        isAuthenticated: true,
        status: "authenticated",
        error: null
      });
      // After successful login, navigate to dashboard (avoid loops)
      try {
        if (location.pathname !== "/dashboard") navigate("/dashboard");
      } catch (e) {
        // ignore navigation errors
      }
    } catch (error) {
      setAuthState((prev) => ({
        ...prev,
        status: "error",
        error: error?.message || "Login failed"
      }));
    }
  };

  const handleLogout = async () => {
    await logout();
    setAuthState({
      address: null,
      token: null,
      isAuthenticated: false,
      status: "idle",
      error: null
    });
  };

  useEffect(() => {
    const token = getToken();
    if (!token || !isTokenValid(token)) {
      return;
    }
    const decoded = decodeToken(token);
    setAuthState({
      address: decoded?.address || null,
      token,
      isAuthenticated: true,
      status: "authenticated",
      error: null
    });
    // If user is already authenticated and on /login, redirect to dashboard
    try {
      if (location.pathname === "/login") navigate("/dashboard");
    } catch (e) {
      // ignore
    }
  }, []);

  const value = useMemo(
    () => ({ authState, login: handleLogin, logout: handleLogout }),
    [authState]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuthContext() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuthContext must be used within AuthProvider");
  }
  return context;
}
