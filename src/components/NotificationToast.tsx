import React, { useEffect } from 'react';
import { AppNotification } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { X, AlertTriangle, AlertCircle, Info, ExternalLink } from 'lucide-react';

interface NotificationToastProps {
  notifications: AppNotification[];
  onDismiss: (id: string) => void;
  onLocate: (intersectionId: string) => void;
}

export default function NotificationToast({
  notifications,
  onDismiss,
  onLocate
}: NotificationToastProps) {
  // Get active toasts (unread and added in the last 15 seconds)
  // Let's filter the ones that are not read and have some flag or we just display the latest 3 notifications that are unread
  const visibleToasts = React.useMemo(() => {
    // Only show unread notifications that were generated, limiting to latest 3
    return notifications.filter(n => !n.read).slice(0, 3);
  }, [notifications]);

  return (
    <div 
      className="fixed bottom-12 right-6 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none"
      id="notification_toasts_container"
    >
      <AnimatePresence>
        {visibleToasts.map((toast) => (
          <ToastItem 
            key={toast.id} 
            toast={toast} 
            onDismiss={onDismiss} 
            onLocate={onLocate} 
          />
        ))}
      </AnimatePresence>
    </div>
  );
}

interface ToastItemProps {
  key?: string;
  toast: AppNotification;
  onDismiss: (id: string) => void;
  onLocate: (intersectionId: string) => void;
}

function ToastItem({ toast, onDismiss, onLocate }: ToastItemProps) {
  // Auto dismiss after 6 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      onDismiss(toast.id);
    }, 6000);
    return () => clearTimeout(timer);
  }, [toast.id, onDismiss]);

  const config = React.useMemo(() => {
    switch (toast.severity) {
      case 'critical':
        return {
          border: 'border-l-4 border-red-500 bg-red-50/95 text-red-900 shadow-red-200/50',
          icon: <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
        };
      case 'warn':
        return {
          border: 'border-l-4 border-amber-500 bg-amber-50/95 text-amber-950 shadow-amber-250/30',
          icon: <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
        };
      case 'info':
      default:
        return {
          border: 'border-l-4 border-blue-500 bg-blue-50/95 text-blue-900 shadow-blue-200/30',
          icon: <Info className="w-5 h-5 text-blue-600 shrink-0" />
        };
    }
  }, [toast.severity]);

  return (
    <motion.div
      initial={{ transform: 'translateY(50px) scale(0.9)', opacity: 0 }}
      animate={{ transform: 'translateY(0) scale(1)', opacity: 1 }}
      exit={{ transform: 'translateY(-20px) scale(0.95)', opacity: 0 }}
      transition={{ type: 'spring', damping: 15, stiffness: 200 }}
      className={`p-4 rounded-xl shadow-lg border border-slate-200/50 backdrop-blur-md pointer-events-auto flex gap-3 items-start ${config.border}`}
      id={`toast_${toast.id}`}
    >
      {config.icon}
      
      <div className="flex-1 min-w-0">
        <h5 className="text-xs font-bold leading-none mb-1">{toast.title}</h5>
        <p className="text-[11px] opacity-90 leading-tight font-normal">{toast.message}</p>
        
        {toast.intersectionId && (
          <div className="mt-2.5 flex items-center justify-between">
            <span className="text-[9px] font-mono opacity-65 bg-slate-200/55 text-slate-800 px-1 py-0.2 rounded font-semibold">
              路口: {toast.intersectionId}
            </span>
            <button
              onClick={() => onLocate(toast.intersectionId!)}
              className="text-[10px] text-blue-600 font-bold flex items-center gap-0.5 hover:underline cursor-pointer"
            >
              <span>前往該路口定位</span>
              <ExternalLink className="w-2.5 h-2.5" />
            </button>
          </div>
        )}
      </div>

      <button
        onClick={() => onDismiss(toast.id)}
        className="p-0.5 hover:bg-slate-200/50 rounded transition cursor-pointer text-slate-400 hover:text-slate-700"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </motion.div>
  );
}
