import React, { createContext, useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import authService from "../services/authService";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          setUser(null);
          setLoading(false);
          return;
        }
        const data = await authService.getMe();
        setUser(data.user || data);
      } catch {
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, []);

  const login = async (email, password) => {
    try {
      const data = await authService.login(email, password);
      const user = data.user || data;
      setUser(user);
      if (data.token) localStorage.setItem("token", data.token);
      return { success: true, user };
    } catch (error) {
      return { success: false, error: error.response?.data?.message || error.message };
    }
  };

  const registerUser = async (userData) => {
    try {
      const data = await authService.register(userData);
      const user = data.user || data;
      setUser(user);
      if (data.token) localStorage.setItem("token", data.token);
      return { success: true, user };
    } catch (error) {
      return { success: false, error: error.response?.data?.message || error.message };
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("token");
    navigate("/login");
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        setUser,
        logout,
        registerUser,
        loading,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
