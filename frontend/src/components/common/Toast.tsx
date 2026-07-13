import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, XCircle, AlertCircle, Info, X } from 'lucide-react';
import { useNotificationStore } from '../../store/useNotificationStore';
import type { NotificationType } from '../../store/useNotificationStore';

const icons: Record<NotificationType, React.ReactNode> = {
  success: <CheckCircle className="w-5 h-5 text-brand-success" />,
  error: <XCircle className="w-5 h-5 text-brand-error" />,
  warning: <AlertCircle className="w-5 h-5 text-orange-500" />,
  info: <Info className="w-5 h-5 text-blue-500" />,
};

const Toast: React.FC = () => {
  const { notifications, removeNotification } = useNotificationStore();

  return (
    <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-[110] flex flex-col gap-3 w-full max-w-md px-4">
      <AnimatePresence>
        {notifications.map((n) => (
          <motion.div
            key={n.id}
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
            className="bg-white dark:bg-gray-800 rounded-2xl shadow-premium border border-gray-100 dark:border-gray-700 p-4 flex items-center gap-3"
          >
            <div className="shrink-0">{icons[n.type]}</div>
            <p className="flex-1 text-sm font-semibold text-gray-800 dark:text-gray-100">
              {n.message}
            </p>
            <button
              onClick={() => removeNotification(n.id)}
              className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              <X className="w-4 h-4 text-gray-400" />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};

export default Toast;
