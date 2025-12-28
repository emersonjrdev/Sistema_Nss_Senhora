import { useState, useCallback } from "react";

export function useToast() {
  const [toasts, setToasts] = useState([]);

  const showToast = useCallback((message, type = "success", duration = 3000) => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, message, type, duration }]);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const success = useCallback((message) => showToast(message, "success"), [showToast]);
  const error = useCallback((message) => showToast(message, "error", 4000), [showToast]);
  const warning = useCallback((message) => showToast(message, "warning"), [showToast]);
  const info = useCallback((message) => showToast(message, "info"), [showToast]);

  return {
    toasts,
    showToast,
    removeToast,
    success,
    error,
    warning,
    info,
  };
}

