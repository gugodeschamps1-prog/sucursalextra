import React from 'react';
import { useApp } from '../context/AppContext';
import { CheckCircle2, AlertTriangle, AlertCircle, Info, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export const Toast: React.FC = () => {
  const { toast, hideToast } = useApp();

  if (!toast) return null;

  const getIcon = () => {
    switch (toast.type) {
      case 'success': return <CheckCircle2 className="w-5 h-5 text-emerald-500 flex-shrink-0" />;
      case 'warning': return <AlertTriangle className="w-5 h-5 text-amber-500 flex-shrink-0" />;
      case 'error': return <AlertCircle className="w-5 h-5 text-rose-500 flex-shrink-0" />;
      default: return <Info className="w-5 h-5 text-indigo-500 flex-shrink-0" />;
    }
  };

  const getBorderColor = () => {
    switch (toast.type) {
      case 'success': return 'border-l-emerald-500';
      case 'warning': return 'border-l-amber-500';
      case 'error': return 'border-l-rose-500';
      default: return 'border-l-indigo-600';
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 20, scale: 0.95 }}
        transition={{ duration: 0.25 }}
        className={`fixed bottom-20 md:bottom-6 right-4 z-[9999] max-w-sm w-full bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-800 border-l-4 ${getBorderColor()} p-3.5 font-mono`}
      >
        <div className="flex items-start gap-3">
          {getIcon()}
          <div className="flex-1 min-w-0">
            <h4 className="font-bold text-xs uppercase tracking-wider text-slate-900 dark:text-white">{toast.title}</h4>
            <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-0.5 leading-relaxed line-clamp-3">
              {toast.body}
            </p>
          </div>
          <button
            onClick={hideToast}
            className="text-slate-400 hover:text-slate-700 dark:hover:text-slate-300 transition-colors p-0.5 rounded"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};
