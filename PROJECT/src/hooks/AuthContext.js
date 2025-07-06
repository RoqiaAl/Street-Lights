import React, { createContext, useState, useEffect } from "react";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true); // New loading state

  useEffect(() => {
    const loggedUser = localStorage.getItem("user");
    console.log("Logged user from localStorage:", loggedUser); // Debug
    if (loggedUser) {
      setUser(JSON.parse(loggedUser));
    }
    setLoading(false); // Done checking localStorage
  }, []);

  const login = (userData) => {
    console.log("UserData in login:", userData);
    setUser(userData);
    localStorage.setItem("user", JSON.stringify(userData));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("user");
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
