import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  CreditCard, 
  DollarSign, 
  Wallet, 
  Building2, 
  Smartphone, 
  Shield, 
  Check, 
  AlertCircle,
  Lock,
  Bitcoin,
  Banknote,
  QrCode,
  Clock,
  Star,
  Info,
  ChevronRight,
  Eye,
  EyeOff
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

interface PaymentMethod {
  id: string;
  name: string;
  type: 'card' | 'digital_wallet' | 'bank_transfer' | 'crypto' | 'cash_on_delivery' | 'bnpl';
  icon: React.ReactNode;
  description: string;
  fees?: string;
  processingTime: string;
  supported: boolean;
  popular?: boolean;
  secure?: boolean;
  instantApproval?: boolean;
}

interface PaymentFormData {
  method: string;
  cardNumber?: string;
  expiryDate?: string;
  cvv?: string;
  cardholderName?: string;
  email?: string;
  phoneNumber?: string;
  billingAddress?: {
    street: string;
    city: string;
    zipCode: string;
    country: string;
  };
}

interface PaymentSystemProps {
  amount: number;
  currency?: string;
  onPaymentComplete: (result: any) => void;
  onPaymentError: (error: string) => void;
}

export default function PaymentSystem({ 
  amount, 
  currency = 'EUR', 
  onPaymentComplete, 
  onPaymentError 
}: PaymentSystemProps) {
  const [selectedMethod, setSelectedMethod] = useState<string>('');
  const [formData, setFormData] = useState<PaymentFormData>({ method: '' });
  const [isProcessing, setIsProcessing] = useState(false);
  const [showCvv, setShowCvv] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [step, setStep] = useState<'method' | 'details' | 'confirmation'>('method');

  const paymentMethods: PaymentMethod[] = [
    {
      id: 'visa_mastercard',
      name: 'Carta di Credito/Debito',
      type: 'card',
      icon: <CreditCard className="h-6 w-6" />,
      description: 'Visa, Mastercard, American Express',
      processingTime: 'Immediato',
      supported: true,
      popular: true,
      secure: true,
      instantApproval: true
    },
    {
      id: 'paypal',
      name: 'PayPal',
      type: 'digital_wallet',
      icon: <Wallet className="h-6 w-6" />,
      description: 'Paga con il tuo account PayPal',
      processingTime: 'Immediato',
      supported: true,
      popular: true,
      secure: true,
      instantApproval: true
    },
    {
      id: 'apple_pay',
      name: 'Apple Pay',
      type: 'digital_wallet',
      icon: <Smartphone className="h-6 w-6" />,
      description: 'Paga con Touch ID o Face ID',
      processingTime: 'Immediato',
      supported: typeof window !== 'undefined' && 'ApplePaySession' in window,
      secure: true,
      instantApproval: true
    },
    {
      id: 'google_pay',
      name: 'Google Pay',
      type: 'digital_wallet',
      icon: <Smartphone className="h-6 w-6" />,
      description: 'Paga con Google Pay',
      processingTime: 'Immediato',
      supported: true,
      secure: true,
      instantApproval: true
    },
    {
      id: 'bank_transfer',
      name: 'Bonifico Bancario',
      type: 'bank_transfer',
      icon: <Building2 className="h-6 w-6" />,
      description: 'SEPA, bonifico istantaneo',
      processingTime: '1-3 giorni lavorativi',
      supported: true,
      fees: 'Gratuito'
    },
    {
      id: 'klarna',
      name: 'Klarna',
      type: 'bnpl',
      icon: <Clock className="h-6 w-6" />,
      description: 'Paga dopo 30 giorni o a rate',
      processingTime: 'Immediato',
      supported: true,
      popular: true
    },
    {
      id: 'bitcoin',
      name: 'Bitcoin',
      type: 'crypto',
      icon: <Bitcoin className="h-6 w-6" />,
      description: 'Paga con Bitcoin (BTC)',
      processingTime: '10-60 minuti',
      supported: true,
      fees: 'Network fees'
    },
    {
      id: 'cash_on_delivery',
      name: 'Contrassegno',
      type: 'cash_on_delivery',
      icon: <Banknote className="h-6 w-6" />,
      description: 'Paga alla consegna',
      processingTime: 'Alla consegna',
      supported: true,
      fees: '€3.99'
    }
  ];

  const handleMethodSelect = (methodId: string) => {
    setSelectedMethod(methodId);
    setFormData({ ...formData, method: methodId });
    setStep('details');
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (selectedMethod === 'visa_mastercard') {
      if (!formData.cardNumber || formData.cardNumber.replace(/\s/g, '').length < 16) {
        newErrors.cardNumber = 'Numero carta non valido';
      }
      if (!formData.expiryDate || !/^\d{2}\/\d{2}$/.test(formData.expiryDate)) {
        newErrors.expiryDate = 'Data scadenza non valida (MM/YY)';
      }
      if (!formData.cvv || formData.cvv.length < 3) {
        newErrors.cvv = 'CVV non valido';
      }
      if (!formData.cardholderName || formData.cardholderName.length < 2) {
        newErrors.cardholderName = 'Nome titolare richiesto';
      }
    }

    if (['paypal', 'klarna'].includes(selectedMethod)) {
      if (!formData.email || !/\S+@\S+\.\S+/.test(formData.email)) {
        newErrors.email = 'Email non valida';
      }
    }

    if (selectedMethod === 'bank_transfer') {
      if (!formData.email) {
        newErrors.email = 'Email richiesta per istruzioni bonifico';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const processPayment = async () => {
    if (!validateForm()) return;

    setIsProcessing(true);

    try {
      // Simulate payment processing
      await new Promise(resolve => setTimeout(resolve, 2000));

      const selectedMethodData = paymentMethods.find(m => m.id === selectedMethod);
      
      // Mock different payment responses based on method
      if (selectedMethod === 'visa_mastercard') {
        // Simulate card payment
        const result = {
          success: true,
          transactionId: generateTransactionId(),
          method: 'Credit Card',
          amount,
          currency,
          last4: formData.cardNumber?.slice(-4),
          status: 'completed'
        };
        onPaymentComplete(result);
      } else if (selectedMethod === 'paypal') {
        // Simulate PayPal redirect
        window.open('/api/payments/paypal/redirect', '_blank');
        const result = {
          success: true,
          transactionId: generateTransactionId(),
          method: 'PayPal',
          amount,
          currency,
          status: 'pending'
        };
        onPaymentComplete(result);
      } else if (['apple_pay', 'google_pay'].includes(selectedMethod)) {
        // Simulate digital wallet
        const result = {
          success: true,
          transactionId: generateTransactionId(),
          method: selectedMethodData?.name,
          amount,
          currency,
          status: 'completed'
        };
        onPaymentComplete(result);
      } else if (selectedMethod === 'bank_transfer') {
        // Simulate bank transfer instructions
        const result = {
          success: true,
          transactionId: generateTransactionId(),
          method: 'Bank Transfer',
          amount,
          currency,
          status: 'pending',
          instructions: {
            iban: 'IT60 X054 2811 1010 0000 0123 456',
            bic: 'BAPPIT21XXX',
            reference: generateTransactionId(),
            recipient: 'GameAll S.r.l.'
          }
        };
        onPaymentComplete(result);
      } else {
        // Generic success for other methods
        const result = {
          success: true,
          transactionId: generateTransactionId(),
          method: selectedMethodData?.name,
          amount,
          currency,
          status: 'completed'
        };
        onPaymentComplete(result);
      }
    } catch (error) {
      onPaymentError('Errore durante il pagamento. Riprova.');
    } finally {
      setIsProcessing(false);
    }
  };

  const generateTransactionId = () => {
    return 'TXN_' + Date.now().toString(36) + Math.random().toString(36).substr(2);
  };

  const formatCardNumber = (value: string) => {
    return value.replace(/\s/g, '').replace(/(\d{4})/g, '$1 ').trim();
  };

  const formatExpiryDate = (value: string) => {
    return value.replace(/\D/g, '').replace(/(\d{2})(\d)/, '$1/$2');
  };

  const selectedMethodData = paymentMethods.find(m => m.id === selectedMethod);

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-green-600" />
            Pagamento Sicuro
          </CardTitle>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-2xl font-bold">
                {amount.toLocaleString('it-IT')} {currency}
              </p>
              <p className="text-sm text-gray-500">Totale da pagare</p>
            </div>
            <div className="flex items-center gap-2">
              <Lock className="h-4 w-4 text-green-600" />
              <span className="text-sm text-green-600">SSL Protetto</span>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Payment Method Selection */}
      {step === 'method' && (
        <Card>
          <CardHeader>
            <CardTitle>Scegli Metodo di Pagamento</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {paymentMethods.filter(method => method.supported).map((method) => (
              <motion.div
                key={method.id}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <div
                  onClick={() => handleMethodSelect(method.id)}
                  className="p-4 border border-gray-200 rounded-lg cursor-pointer hover:border-blue-300 hover:bg-blue-50 transition-all duration-200"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-gray-100 rounded-lg">
                        {method.icon}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-medium">{method.name}</h3>
                          {method.popular && (
                            <Badge variant="secondary" className="text-xs">
                              <Star className="h-3 w-3 mr-1" />
                              Popolare
                            </Badge>
                          )}
                          {method.secure && (
                            <Badge variant="outline" className="text-xs text-green-600">
                              <Shield className="h-3 w-3 mr-1" />
                              Sicuro
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-gray-600">{method.description}</p>
                        <div className="flex items-center gap-4 mt-1 text-xs text-gray-500">
                          <span>⏱️ {method.processingTime}</span>
                          {method.fees && <span>💰 {method.fees}</span>}
                          {method.instantApproval && <span>⚡ Approvazione immediata</span>}
                        </div>
                      </div>
                    </div>
                    <ChevronRight className="h-5 w-5 text-gray-400" />
                  </div>
                </div>
              </motion.div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Payment Details Form */}
      {step === 'details' && selectedMethodData && (
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                onClick={() => setStep('method')}
                className="p-1"
              >
                ←
              </Button>
              <div>
                <CardTitle className="flex items-center gap-2">
                  {selectedMethodData.icon}
                  {selectedMethodData.name}
                </CardTitle>
                <p className="text-sm text-gray-600">{selectedMethodData.description}</p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Credit Card Form */}
            {selectedMethod === 'visa_mastercard' && (
              <div className="space-y-4">
                <div>
                  <Label htmlFor="cardNumber">Numero Carta</Label>
                  <Input
                    id="cardNumber"
                    type="text"
                    value={formData.cardNumber || ''}
                    onChange={(e) => setFormData({
                      ...formData,
                      cardNumber: formatCardNumber(e.target.value)
                    })}
                    placeholder="1234 5678 9012 3456"
                    maxLength={19}
                    className={errors.cardNumber ? 'border-red-500' : ''}
                  />
                  {errors.cardNumber && (
                    <p className="text-sm text-red-600 mt-1">{errors.cardNumber}</p>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="expiryDate">Scadenza</Label>
                    <Input
                      id="expiryDate"
                      type="text"
                      value={formData.expiryDate || ''}
                      onChange={(e) => setFormData({
                        ...formData,
                        expiryDate: formatExpiryDate(e.target.value)
                      })}
                      placeholder="MM/YY"
                      maxLength={5}
                      className={errors.expiryDate ? 'border-red-500' : ''}
                    />
                    {errors.expiryDate && (
                      <p className="text-sm text-red-600 mt-1">{errors.expiryDate}</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="cvv">CVV</Label>
                    <div className="relative">
                      <Input
                        id="cvv"
                        type={showCvv ? "text" : "password"}
                        value={formData.cvv || ''}
                        onChange={(e) => setFormData({
                          ...formData,
                          cvv: e.target.value.replace(/\D/g, '')
                        })}
                        placeholder="123"
                        maxLength={4}
                        className={errors.cvv ? 'border-red-500' : ''}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowCvv(!showCvv)}
                        className="absolute right-2 top-1/2 -translate-y-1/2 p-1"
                      >
                        {showCvv ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    </div>
                    {errors.cvv && (
                      <p className="text-sm text-red-600 mt-1">{errors.cvv}</p>
                    )}
                  </div>
                </div>

                <div>
                  <Label htmlFor="cardholderName">Nome Titolare</Label>
                  <Input
                    id="cardholderName"
                    type="text"
                    value={formData.cardholderName || ''}
                    onChange={(e) => setFormData({
                      ...formData,
                      cardholderName: e.target.value
                    })}
                    placeholder="Mario Rossi"
                    className={errors.cardholderName ? 'border-red-500' : ''}
                  />
                  {errors.cardholderName && (
                    <p className="text-sm text-red-600 mt-1">{errors.cardholderName}</p>
                  )}
                </div>
              </div>
            )}

            {/* PayPal/Klarna Email */}
            {['paypal', 'klarna', 'bank_transfer'].includes(selectedMethod) && (
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email || ''}
                  onChange={(e) => setFormData({
                    ...formData,
                    email: e.target.value
                  })}
                  placeholder="mario.rossi@email.com"
                  className={errors.email ? 'border-red-500' : ''}
                />
                {errors.email && (
                  <p className="text-sm text-red-600 mt-1">{errors.email}</p>
                )}
                {selectedMethod === 'bank_transfer' && (
                  <p className="text-sm text-gray-500 mt-1">
                    Riceverai le istruzioni per il bonifico via email
                  </p>
                )}
              </div>
            )}

            {/* Crypto Payment Info */}
            {selectedMethod === 'bitcoin' && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex items-start gap-2">
                  <Info className="h-5 w-5 text-yellow-600 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-yellow-800">Pagamento Bitcoin</h4>
                    <p className="text-sm text-yellow-700 mt-1">
                      Verrai reindirizzato al processore di pagamento crypto per completare la transazione.
                      Le commissioni di rete sono a carico dell'acquirente.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Cash on Delivery Info */}
            {selectedMethod === 'cash_on_delivery' && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start gap-2">
                  <Info className="h-5 w-5 text-blue-600 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-blue-800">Contrassegno</h4>
                    <p className="text-sm text-blue-700 mt-1">
                      Pagherai €{(amount + 3.99).toLocaleString('it-IT')} EUR alla consegna 
                      (include €3.99 di commissioni contrassegno).
                    </p>
                  </div>
                </div>
              </div>
            )}

            <Button
              onClick={processPayment}
              disabled={isProcessing}
              className="w-full h-12 text-lg"
            >
              {isProcessing ? (
                <div className="flex items-center gap-2">
                  <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
                  Elaborazione...
                </div>
              ) : (
                `Paga ${amount.toLocaleString('it-IT')} ${currency}`
              )}
            </Button>

            {/* Security Notice */}
            <div className="bg-green-50 border border-green-200 rounded-lg p-3 mt-4">
              <div className="flex items-center gap-2 text-green-800">
                <Shield className="h-4 w-4" />
                <span className="text-sm font-medium">Pagamento sicuro garantito</span>
              </div>
              <p className="text-xs text-green-700 mt-1">
                I tuoi dati sono protetti da crittografia SSL 256-bit.
                Non memorizziamo i dettagli della carta di credito.
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}