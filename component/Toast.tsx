import { use, useEffect } from "react";

interface ToastProps {
  message: string;
  status: number;
  onClose: () => void;
}

export default function Toast({ message, status, onClose }: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 3000); // Close the toast after 3 seconds

    return () => clearTimeout(timer); // Cleanup the timer on unmount
  }, [onClose]);

  const className = "toast toast-" + status;
  return (
    <div className={className}>
      <p>{message}</p>
      <p className="toastProgress"></p>
    </div>
  );
}