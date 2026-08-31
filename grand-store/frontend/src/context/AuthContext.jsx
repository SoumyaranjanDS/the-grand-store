import React, { createContext, useContext, useState, useEffect } from "react";
import api from '../api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const userInfo = localStorage.getItem("userInfo");
    if (userInfo) {
      setUser(JSON.parse(userInfo));
    }

    const handleUnauthorized = () => {
      setUser(null);
    };
    window.addEventListener('auth-unauthorized', handleUnauthorized);
    
    return () => {
      window.removeEventListener('auth-unauthorized', handleUnauthorized);
    };
  }, []);

  const login = async (email, password) => {
    try {
      const res = await api.post(`/auth/login`, { email, password });
      const data = res.data;

      localStorage.setItem("userInfo", JSON.stringify(data));
      setUser(data);
      return data;
    } catch (error) {
      throw new Error(error.response?.data?.message || "Login failed");
    }
  };

  const register = async (name, email, password, referralCode) => {
    try {
      const res = await api.post(`/auth/register`, { name, email, password, referralCode });
      const data = res.data;

      localStorage.setItem("userInfo", JSON.stringify(data));
      setUser(data);
      return data;
    } catch (error) {
      throw new Error(error.response?.data?.message || "Registration failed");
    }
  };

  const googleLogin = async (token, role = 'customer', referralCode) => {
    try {
      const res = await api.post(`/auth/google`, { token, role, referralCode });
      const data = res.data;

      localStorage.setItem("userInfo", JSON.stringify(data));
      setUser(data);
      return data;
    } catch (error) {
      throw new Error(error.response?.data?.message || "Google Authentication failed");
    }
  };

  const logout = async () => {
    try {
      await api.post('/auth/logout');
    } catch (error) {
      console.error('Logout failed:', error);
    }
    localStorage.removeItem("userInfo");
    setUser(null);
  };

  const updateUser = (userData) => {
    setUser((currentUser) => {
      const mergedUser = { ...(currentUser || {}), ...userData };
      localStorage.setItem("userInfo", JSON.stringify(mergedUser));
      return mergedUser;
    });
  };

  const refreshUser = async () => {
    const res = await api.get('/auth/profile');
    updateUser(res.data);
    return res.data;
  };

  return (
    <AuthContext.Provider value={{ user, login, register, googleLogin, logout, updateUser, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
