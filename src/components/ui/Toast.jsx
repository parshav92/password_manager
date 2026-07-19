// Reusable Toast notification component

import { useState, useEffect, useCallback, createContext, useContext } from 'react';
import { CheckCircle, AlertCircle, Info, X } from 'lucide-react';

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = 'info', duration = 3000) => {
    const id = crypto.randomUUID();
    setToasts(prev => [...prev, { id, message, type, duration }]);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={addToast}>
      {children}
      <div className="fixed bottom-6 right-6 z-[200] flex flex-col gap-2 max-md:bottom-20 max-md:right-4 max-md:left-4" role="alert" aria-live="polite">
        {toasts.map(toast => (
          <ToastItem key={toast.id} toast={toast} onDismiss={removeToast} />
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const addToast = useContext(ToastContext);
  return {
    success: (msg) => addToast(msg, 'success'),
    error: (msg) => addToast(msg, 'error'),
    info: (msg) => addToast(msg, 'info'),
  };
}

function ToastItem({ toast, onDismiss }) {
  const [exiting, setExiting] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setExiting(true);
      setTimeout(() => onDismiss(toast.id), 200);
    }, toast.duration);

    return () => clearTimeout(timer);
  }, [toast, onDismiss]);

  const icons = {
    success: <CheckCircle size={16} />,
    error: <AlertCircle size={16} />,
    info: <Info size={16} />,
  };

  const colorMap = {
    success: 'text-ok',
    error: 'text-bad',
    info: 'text-accent',
  };

  return (
    <div className={`flex items-center gap-2.5 px-4 py-3 bg-surface border border-border rounded-xl transition-all duration-200 ${exiting ? 'opacity-0 translate-x-4' : 'animate-slide-in-right'}`}>
      <span className={colorMap[toast.type]}>{icons[toast.type]}</span>
      <span className="text-sm text-txt flex-1">{toast.message}</span>
      <button
        className="flex items-center justify-center w-5 h-5 rounded-md border-none bg-transparent text-txt-tertiary cursor-pointer transition-all duration-150 hover:text-txt hover:bg-overlay shrink-0"
        onClick={() => {
          setExiting(true);
          setTimeout(() => onDismiss(toast.id), 200);
        }}
        aria-label="Dismiss"
      >
        <X size={12} />
      </button>
    </div>
  );
}
