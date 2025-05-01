'use client';
import Toast from "@/component/Toast";
import { createContext, ReactNode, useContext, useState } from "react";

interface ToastContextProps {
  showToast: (message: string, status: number) => void;
}
const ToastContext = createContext<ToastContextProps | undefined>(undefined);
export default function ToastProvider({ children }: { children: ReactNode }) {
  const [toast, setToast] = useState<{
    message: string;
    status: number;
  } | null>(null);
  const showToast = (message: string, status: number) => {
    setToast({ message, status });
  };
  const handleClose = () => {
    setToast(null);
  };
  return (
    <ToastContext.Provider value={{ showToast }}>
      {toast && (
        <Toast
          message={toast.message}
          status={toast.status}
          onClose={handleClose}
        />
      )}
      {children}
    </ToastContext.Provider>
  );
}

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) throw new Error("useToast must be used within ToastProvider");
  return context;
};
