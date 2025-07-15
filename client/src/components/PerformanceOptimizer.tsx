import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Zap, RefreshCw, CheckCircle, AlertCircle } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';

interface PerformanceOptimization {
  id: string;
  name: string;
  description: string;
  status: 'active' | 'inactive' | 'optimizing';
  improvement: string;
}

export function PerformanceOptimizer() {
  const [optimizations, setOptimizations] = useState<PerformanceOptimization[]>([
    {
      id: 'cache',
      name: 'Cache Intelligente',
      description: 'Riduce il tempo di caricamento memorizzando i dati frequenti',
      status: 'active',
      improvement: '85% più veloce'
    },
    {
      id: 'debounce',
      name: 'Ricerche Ottimizzate',
      description: 'Evita ricerche troppo frequenti per migliorare le performance',
      status: 'active',
      improvement: '60% meno richieste'
    },
    {
      id: 'database',
      name: 'Query Database',
      description: 'Ottimizza le query del database con indici avanzati',
      status: 'active',
      improvement: '70% più veloce'
    },
    {
      id: 'compression',
      name: 'Compressione Dati',
      description: 'Riduce la dimensione dei dati trasferiti',
      status: 'optimizing',
      improvement: '40% meno banda'
    }
  ]);

  const [isOptimizing, setIsOptimizing] = useState(false);
  const [performanceScore, setPerformanceScore] = useState(92);

  const handleOptimize = () => {
    setIsOptimizing(true);
    
    // Simulazione ottimizzazione
    setTimeout(() => {
      setOptimizations(prev => prev.map(opt => 
        opt.status === 'optimizing' 
          ? { ...opt, status: 'active' as const }
          : opt
      ));
      setPerformanceScore(prev => Math.min(100, prev + 3));
      setIsOptimizing(false);
    }, 2000);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-500';
      case 'inactive': return 'bg-gray-500';
      case 'optimizing': return 'bg-yellow-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <CheckCircle className="h-4 w-4" />;
      case 'inactive': return <AlertCircle className="h-4 w-4" />;
      case 'optimizing': return <RefreshCw className="h-4 w-4 animate-spin" />;
      default: return <AlertCircle className="h-4 w-4" />;
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Zap className="h-5 w-5 text-yellow-500" />
          Ottimizzatore Performance
        </CardTitle>
        <CardDescription>
          Gestisci le ottimizzazioni per migliorare la velocità del sito
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Performance Score */}
        <div className="text-center">
          <div className="text-3xl font-bold text-green-600 mb-2">
            {performanceScore}/100
          </div>
          <div className="text-sm text-gray-600">
            Punteggio Performance
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
            <motion.div
              className="bg-green-500 h-2 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${performanceScore}%` }}
              transition={{ duration: 1 }}
            />
          </div>
        </div>

        {/* Ottimizzazioni */}
        <div className="space-y-3">
          {optimizations.map((optimization) => (
            <motion.div
              key={optimization.id}
              className="flex items-center justify-between p-3 border rounded-lg"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-full ${getStatusColor(optimization.status)}`}>
                  {getStatusIcon(optimization.status)}
                </div>
                <div>
                  <div className="font-medium">{optimization.name}</div>
                  <div className="text-sm text-gray-600">{optimization.description}</div>
                </div>
              </div>
              <div className="text-right">
                <Badge variant="secondary">
                  {optimization.improvement}
                </Badge>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Pulsante Ottimizza */}
        <Button
          onClick={handleOptimize}
          disabled={isOptimizing}
          className="w-full"
        >
          {isOptimizing ? (
            <>
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              Ottimizzando...
            </>
          ) : (
            <>
              <Zap className="h-4 w-4 mr-2" />
              Ottimizza Performance
            </>
          )}
        </Button>

        {/* Suggerimenti */}
        <div className="bg-blue-50 p-4 rounded-lg">
          <h4 className="font-medium text-blue-900 mb-2">💡 Suggerimenti</h4>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• La cache riduce i tempi di caricamento del 85%</li>
            <li>• Le query ottimizzate migliorano la velocità del database</li>
            <li>• Il debouncing riduce le richieste API non necessarie</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}