import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Activity, Wifi, Clock } from 'lucide-react';

interface PerformanceMetrics {
  loadTime: number;
  networkSpeed: 'fast' | 'medium' | 'slow';
  memoryUsage: number;
  isOnline: boolean;
}

export function PerformanceMonitor() {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    loadTime: 0,
    networkSpeed: 'fast',
    memoryUsage: 0,
    isOnline: true
  });
  const [showMetrics, setShowMetrics] = useState(false);

  useEffect(() => {
    // Monitor page load time
    const loadTime = performance.now();
    
    // Monitor network status
    const updateOnlineStatus = () => {
      setMetrics(prev => ({ ...prev, isOnline: navigator.onLine }));
    };
    
    window.addEventListener('online', updateOnlineStatus);
    window.addEventListener('offline', updateOnlineStatus);
    
    // Estimate network speed based on load time
    const estimateNetworkSpeed = () => {
      const connection = (navigator as any).connection;
      if (connection) {
        const speed = connection.downlink;
        return speed > 10 ? 'fast' : speed > 2 ? 'medium' : 'slow';
      }
      return loadTime < 1000 ? 'fast' : loadTime < 3000 ? 'medium' : 'slow';
    };

    // Monitor memory usage (if available)
    const updateMemoryUsage = () => {
      if ('memory' in performance) {
        const memory = (performance as any).memory;
        const usage = (memory.usedJSHeapSize / memory.jsHeapSizeLimit) * 100;
        setMetrics(prev => ({ ...prev, memoryUsage: usage }));
      }
    };

    setMetrics({
      loadTime,
      networkSpeed: estimateNetworkSpeed(),
      memoryUsage: 0,
      isOnline: navigator.onLine
    });

    updateMemoryUsage();
    const interval = setInterval(updateMemoryUsage, 5000);

    return () => {
      window.removeEventListener('online', updateOnlineStatus);
      window.removeEventListener('offline', updateOnlineStatus);
      clearInterval(interval);
    };
  }, []);

  const getNetworkColor = () => {
    switch (metrics.networkSpeed) {
      case 'fast': return 'text-green-500';
      case 'medium': return 'text-yellow-500';
      case 'slow': return 'text-red-500';
      default: return 'text-gray-500';
    }
  };

  const getMemoryColor = () => {
    if (metrics.memoryUsage < 50) return 'text-green-500';
    if (metrics.memoryUsage < 80) return 'text-yellow-500';
    return 'text-red-500';
  };

  if (process.env.NODE_ENV === 'production') return null;

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <motion.button
        onClick={() => setShowMetrics(!showMetrics)}
        className="bg-black/80 text-white p-3 rounded-full backdrop-blur-sm hover:bg-black/90 transition-colors"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <Activity className="w-5 h-5" />
      </motion.button>

      <AnimatePresence>
        {showMetrics && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.8 }}
            className="absolute bottom-16 right-0 bg-white/95 backdrop-blur-md rounded-lg shadow-xl p-4 min-w-[200px] border border-gray-200"
          >
            <h3 className="font-semibold text-gray-900 mb-3">Metriche Performance</h3>
            
            <div className="space-y-2 text-sm">
              <div className="flex items-center justify-between">
                <span className="flex items-center">
                  <Clock className="w-4 h-4 mr-2 text-blue-500" />
                  Caricamento
                </span>
                <span className="font-mono">{metrics.loadTime.toFixed(0)}ms</span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="flex items-center">
                  <Wifi className={`w-4 h-4 mr-2 ${getNetworkColor()}`} />
                  Rete
                </span>
                <span className={`font-mono ${getNetworkColor()}`}>
                  {metrics.networkSpeed}
                </span>
              </div>
              
              {metrics.memoryUsage > 0 && (
                <div className="flex items-center justify-between">
                  <span className="flex items-center">
                    <Activity className={`w-4 h-4 mr-2 ${getMemoryColor()}`} />
                    Memoria
                  </span>
                  <span className={`font-mono ${getMemoryColor()}`}>
                    {metrics.memoryUsage.toFixed(1)}%
                  </span>
                </div>
              )}
              
              <div className="flex items-center justify-between">
                <span>Stato</span>
                <span className={`font-mono ${metrics.isOnline ? 'text-green-500' : 'text-red-500'}`}>
                  {metrics.isOnline ? 'Online' : 'Offline'}
                </span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}