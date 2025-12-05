// src/contexts/AuthContext.jsx
import React, { createContext, useState, useEffect } from "react";

export const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const raw = localStorage.getItem("as_user");
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  });

  // keep auth state in sync with storage (optional)
  useEffect(() => {
    const onStorage = () => {
      try {
        const raw = localStorage.getItem("as_user");
        setUser(raw ? JSON.parse(raw) : null);
      } catch {
        setUser(null);
      }
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  function signIn({ token, user }) {
    try {
      localStorage.setItem("as_token", token);
      localStorage.setItem("as_user", JSON.stringify(user));
    } catch (e) { console.warn(e); }
    setUser(user);
  }

  function signOut() {
    try {
      localStorage.removeItem("as_token");
      localStorage.removeItem("as_user");
    } catch (e) { console.warn(e); }
    setUser(null);
    // programmatic redirect using location (safe)
    window.location.href = "/login";
  }

  return (
    <AuthContext.Provider value={{ user, signIn, signOut, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
}
