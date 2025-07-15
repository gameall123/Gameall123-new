import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { RefreshCw, Shield } from 'lucide-react';
import { motion } from 'framer-motion';

interface CaptchaData {
  captchaId: string;
  challenge: string;
}

interface CaptchaWidgetProps {
  onCaptchaChange: (captchaId: string, solution: string) => void;
  className?: string;
}

export function CaptchaWidget({ onCaptchaChange, className }: CaptchaWidgetProps) {
  const [solution, setSolution] = useState('');
  const [captchaData, setCaptchaData] = useState<CaptchaData | null>(null);

  const { data, refetch, isLoading } = useQuery({
    queryKey: ['/api/captcha'],
    queryFn: async () => {
      const response = await apiRequest('GET', '/api/captcha');
      return response.json();
    },
    refetchOnWindowFocus: false,
  });

  useEffect(() => {
    if (data) {
      setCaptchaData(data);
      setSolution('');
    }
  }, [data]);

  useEffect(() => {
    if (captchaData && solution) {
      onCaptchaChange(captchaData.captchaId, solution);
    }
  }, [captchaData, solution, onCaptchaChange]);

  const handleRefresh = () => {
    refetch();
  };

  const handleSolutionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSolution(e.target.value);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={className}
    >
      <Card className="bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700">
        <CardContent className="p-4">
          <div className="flex items-center gap-2 mb-3">
            <Shield className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Verifica di sicurezza
            </Label>
          </div>
          
          <div className="flex items-center gap-3 mb-3">
            <div className="flex-1 bg-white dark:bg-gray-900 rounded-lg p-3 border border-gray-200 dark:border-gray-600">
              <div className="text-center">
                {isLoading ? (
                  <div className="flex items-center justify-center">
                    <RefreshCw className="w-4 h-4 animate-spin text-gray-400" />
                    <span className="ml-2 text-sm text-gray-500">Caricamento...</span>
                  </div>
                ) : (
                  <span className="text-lg font-mono font-bold text-gray-900 dark:text-gray-100">
                    {captchaData?.challenge || 'Errore nel caricamento'}
                  </span>
                )}
              </div>
            </div>
            
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              disabled={isLoading}
              className="shrink-0"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            </Button>
          </div>

          <div className="space-y-2">
            <Label htmlFor="captcha-solution" className="text-sm text-gray-600 dark:text-gray-400">
              Inserisci il risultato:
            </Label>
            <Input
              id="captcha-solution"
              type="text"
              placeholder="Risposta"
              value={solution}
              onChange={handleSolutionChange}
              className="text-center font-mono"
              disabled={isLoading || !captchaData}
            />
          </div>
          
          <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
            Risolvi l'operazione matematica per continuare
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}