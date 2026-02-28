import { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

useEffect(() => {
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role"); // Ensure this matches what Login saves
  const name = localStorage.getItem("name");
  const id = localStorage.getItem("id");

  if (token) {
    // If role is missing in localStorage, it might default to 'user'
    setUser({ token, role: role || "user", name, id });
  }
  setLoading(false);
}, []);

const login = (userData) => {
  localStorage.setItem("token", userData.token);
  localStorage.setItem("role", userData.role); // 👈 Critical: Save the role!
  localStorage.setItem("name", userData.name);
  localStorage.setItem("id", userData.id);
  
  setUser(userData);
};

  const logout = () => {
    localStorage.clear();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export default AuthProvider;