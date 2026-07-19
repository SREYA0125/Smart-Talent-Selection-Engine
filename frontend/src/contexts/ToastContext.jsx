import { createContext, useContext, useState, useCallback } from "react";
import { CheckCircle2, XCircle, AlertTriangle, Info, X } from "lucide-react";

const ToastContext = createContext(null);

/*
|--------------------------------------------------------------------------
| Toast Notification Context & Component System
|--------------------------------------------------------------------------
| Provides global, non-blocking notification alerts (success, error, warning,
| info) with animated, premium toast slide-ins.
|--------------------------------------------------------------------------
*/

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const showToast = useCallback((message, type = "success") => {
    const id = Date.now() + Math.random().toString(36).substr(2, 9);
    
    // Add new toast
    setToasts((prev) => [...prev, { id, message, type }]);

    // Remove toast after 3.5 seconds
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3500);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // Icon mapping
  const getIcon = (type) => {
    switch (type) {
      case "success":
        return <CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0" />;
      case "error":
        return <XCircle className="h-5 w-5 text-rose-500 shrink-0" />;
      case "warning":
        return <AlertTriangle className="h-5 w-5 text-amber-500 shrink-0" />;
      case "info":
      default:
        return <Info className="h-5 w-5 text-blue-500 shrink-0" />;
    }
  };

  // Border and background mapping
  const getStyles = (type) => {
    switch (type) {
      case "success":
        return "bg-emerald-50 border-emerald-200 text-emerald-900";
      case "error":
        return "bg-rose-50 border-rose-200 text-rose-900";
      case "warning":
        return "bg-amber-50 border-amber-200 text-amber-900";
      case "info":
      default:
        return "bg-blue-50 border-blue-200 text-blue-900";
    }
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}

      {/* Floating Toasts Portal Container */}
      <div className="fixed top-4 right-4 z-[9999] flex flex-col gap-3 w-full max-w-sm pointer-events-none">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            role="alert"
            className={`flex items-start gap-3 border p-4 rounded-xl shadow-lg pointer-events-auto transition-all duration-300 transform translate-y-0 opacity-100 animate-slide-in ${getStyles(
              toast.type
            )}`}
          >
            {getIcon(toast.type)}
            <div className="flex-1 text-sm font-medium pr-2 break-words">
              {toast.message}
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="text-gray-400 hover:text-gray-700 transition"
              aria-label="Close notification"
            >
              <X className="h-4 w-4 shrink-0" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
}
