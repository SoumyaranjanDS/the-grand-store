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

  const adminLogin = async (email, password) => {
    try {
      const res = await api.post(`/auth/admin-login`, { email, password });
      const data = res.data;

      localStorage.setItem("userInfo", JSON.stringify(data));
      setUser(data);
      return data;
    } catch (error) {
      throw new Error(error.response?.data?.message || "Administrative login failed");
    }
  };

  const register = async (name, email, password, referralCode) => {
    try {
      const res = await api.post(`/auth/register`, { name, email, password, referralCode });
      return res.data; // Now returns { message: '...' }
    } catch (error) {
      throw new Error(error.response?.data?.message || "Registration failed");
    }
  };

  const googleLogin = async (tokenOrCredential, role = 'customer', referralCode) => {
    try {
      let token = tokenOrCredential;
      let email = undefined;
      let name = undefined;
      let uid = undefined;
      let photoURL = undefined;

      if (tokenOrCredential && typeof tokenOrCredential === 'object') {
        if (tokenOrCredential.user) {
          // Firebase UserCredential
          token = await tokenOrCredential.user.getIdToken();
          email = tokenOrCredential.user.email;
          name = tokenOrCredential.user.displayName;
          uid = tokenOrCredential.user.uid;
          photoURL = tokenOrCredential.user.photoURL;
        } else if (tokenOrCredential.credential || tokenOrCredential.access_token) {
          token = tokenOrCredential.credential || tokenOrCredential.access_token;
        }
      }

      const res = await api.post(`/auth/google`, { 
        token, 
        email, 
        name, 
        uid, 
        photoURL, 
        role, 
        referralCode 
      });
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
    <AuthContext.Provider value={{ user, login, adminLogin, register, googleLogin, logout, updateUser, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
