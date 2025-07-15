import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, X } from 'lucide-react';
import { useEffect, useState } from 'react';

interface CartToastProps {
  isVisible: boolean;
  onClose: () => void;
  productName: string;
}

export function CartToast({ isVisible, onClose, productName }: CartToastProps) {
  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(() => {
        onClose();
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [isVisible, onClose]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: -50, scale: 0.8 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -50, scale: 0.8 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          className="fixed top-4 right-4 z-50 bg-white rounded-lg shadow-xl border-2 border-green-500 p-4 min-w-[300px] max-w-sm"
        >
          <div className="flex items-center gap-3">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, duration: 0.3 }}
              className="flex-shrink-0"
            >
              <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-white" />
              </div>
            </motion.div>
            
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900 text-sm">
                Aggiunto al carrello
              </h3>
              <p className="text-gray-600 text-xs mt-1">
                {productName} è stato aggiunto con successo
              </p>
            </div>
            
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          
          {/* Animated progress bar */}
          <motion.div
            initial={{ width: "100%" }}
            animate={{ width: "0%" }}
            transition={{ duration: 3, ease: "linear" }}
            className="absolute bottom-0 left-0 h-1 bg-green-500 rounded-bl-lg"
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}