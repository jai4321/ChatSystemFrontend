"use client";
import { createContext, ReactNode, useContext, useState } from "react";
import ToastProvider from "./ToastContext";
interface AuthContextProps {
  user: string | null;
  login: (username: string) => void;
  logout: () => void;
}
const AuthContext = createContext<AuthContextProps | undefined>(undefined);
export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<string | null>(null);
  const login = (username: string) => setUser(username);
  const logout = () => setUser(null);
  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      <ToastProvider>{children}</ToastProvider>
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
};
