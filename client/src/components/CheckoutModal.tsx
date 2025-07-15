import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCartStore } from '@/lib/store';
import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { CouponSection } from './CouponSection';
import { 
  CreditCard, 
  MapPin, 
  User, 
  Mail, 
  Phone, 
  Shield,
  CheckCircle,
  X,
  Package,
  Star
} from 'lucide-react';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CheckoutModal({ isOpen, onClose }: CheckoutModalProps) {
  const { items, getTotalPrice, clearCart } = useCartStore();
  const { user } = useAuth();
  const [step, setStep] = useState(1);
  const [isProcessing, setIsProcessing] = useState(false);
  const [orderComplete, setOrderComplete] = useState(false);
  const [appliedCoupon, setAppliedCoupon] = useState<{
    code: string;
    discount: number;
  } | null>(null);

  const [formData, setFormData] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.email || '',
    phone: '',
    address: '',
    city: '',
    zipCode: '',
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    cardName: '',
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleCouponApplied = (discount: number, couponCode: string) => {
    setAppliedCoupon({ code: couponCode, discount });
  };

  const handleCouponRemoved = () => {
    setAppliedCoupon(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);
    
    try {
      // Simulate payment processing delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Create order with proper total and items (including VAT)
      const subtotal = getTotalPrice();
  const discountAmount = appliedCoupon ? appliedCoupon.discount : 0;
  const discountedSubtotal = subtotal - discountAmount;
  const vatAmount = discountedSubtotal * 0.22;
  const totalWithVAT = discountedSubtotal + vatAmount;
      const orderData = {
        total: totalWithVAT.toString(),
        status: 'pending',
        shippingAddress: {
          firstName: formData.firstName,
          lastName: formData.lastName,
          address: formData.address,
          city: formData.city,
          zipCode: formData.zipCode,
          phone: formData.phone
        },
        items: items.map(item => ({
          productId: item.productId,
          quantity: item.quantity,
          price: item.price.toString()
        }))
      };
      
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(orderData),
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Order creation failed:', errorText);
        throw new Error(`Failed to create order: ${response.status} ${errorText}`);
      }
      
      const order = await response.json();
      console.log('Order created successfully:', order);
      
      // Clear cart after successful order creation
      clearCart();
      setOrderComplete(true);
      setStep(3);
    } catch (error) {
      console.error('Payment failed:', error);
      // You might want to show an error message to the user here
    } finally {
      setIsProcessing(false);
    }
  };

  const handleClose = () => {
    if (orderComplete) {
      setStep(1);
      setOrderComplete(false);
    }
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {orderComplete ? (
              <>
                <CheckCircle className="w-5 h-5 text-green-500" />
                Ordine Completato
              </>
            ) : (
              <>
                <CreditCard className="w-5 h-5" />
                Checkout
              </>
            )}
          </DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column - Forms */}
          <div className="space-y-6">
            {step === 1 && !orderComplete && (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3 }}
              >
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <User className="w-5 h-5" />
                      Informazioni di Spedizione
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="firstName">Nome</Label>
                        <Input
                          id="firstName"
                          name="firstName"
                          value={formData.firstName}
                          onChange={handleInputChange}
                          placeholder="Mario"
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="lastName">Cognome</Label>
                        <Input
                          id="lastName"
                          name="lastName"
                          value={formData.lastName}
                          onChange={handleInputChange}
                          placeholder="Rossi"
                          required
                        />
                      </div>
                    </div>
                    
                    <div>
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        placeholder="mario.rossi@email.com"
                        required
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="phone">Telefono</Label>
                      <Input
                        id="phone"
                        name="phone"
                        type="tel"
                        value={formData.phone}
                        onChange={handleInputChange}
                        placeholder="+39 123 456 7890"
                        required
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="address">Indirizzo</Label>
                      <Input
                        id="address"
                        name="address"
                        value={formData.address}
                        onChange={handleInputChange}
                        placeholder="Via Roma 123"
                        required
                      />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="city">Città</Label>
                        <Input
                          id="city"
                          name="city"
                          value={formData.city}
                          onChange={handleInputChange}
                          placeholder="Milano"
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="zipCode">CAP</Label>
                        <Input
                          id="zipCode"
                          name="zipCode"
                          value={formData.zipCode}
                          onChange={handleInputChange}
                          placeholder="20100"
                          required
                        />
                      </div>
                    </div>
                    
                    <Button
                      onClick={() => setStep(2)}
                      className="w-full bg-blue-600 hover:bg-blue-700"
                      disabled={!formData.firstName || !formData.lastName || !formData.email || !formData.address}
                    >
                      Continua al Pagamento
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {step === 2 && !orderComplete && (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3 }}
              >
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <CreditCard className="w-5 h-5" />
                      Informazioni di Pagamento
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                      <div>
                        <Label htmlFor="cardName">Nome sulla Carta</Label>
                        <Input
                          id="cardName"
                          name="cardName"
                          value={formData.cardName}
                          onChange={handleInputChange}
                          placeholder="Mario Rossi"
                          required
                        />
                      </div>
                      
                      <div>
                        <Label htmlFor="cardNumber">Numero Carta</Label>
                        <Input
                          id="cardNumber"
                          name="cardNumber"
                          value={formData.cardNumber}
                          onChange={handleInputChange}
                          placeholder="1234 5678 9012 3456"
                          required
                        />
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="expiryDate">Scadenza</Label>
                          <Input
                            id="expiryDate"
                            name="expiryDate"
                            value={formData.expiryDate}
                            onChange={handleInputChange}
                            placeholder="MM/AA"
                            required
                          />
                        </div>
                        <div>
                          <Label htmlFor="cvv">CVV</Label>
                          <Input
                            id="cvv"
                            name="cvv"
                            value={formData.cvv}
                            onChange={handleInputChange}
                            placeholder="123"
                            required
                          />
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                        <Shield className="w-4 h-4 text-green-600" />
                        <span className="text-sm text-green-700 dark:text-green-400">
                          Pagamento protetto SSL
                        </span>
                      </div>
                      
                      <div className="flex gap-3">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => setStep(1)}
                          className="flex-1"
                        >
                          Indietro
                        </Button>
                        <Button
                          type="submit"
                          disabled={isProcessing}
                          className="flex-1 bg-blue-600 hover:bg-blue-700"
                        >
                          {isProcessing ? (
                            <div className="flex items-center gap-2">
                              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                              <span>Elaborazione...</span>
                            </div>
                          ) : (
                            `Paga €${totalWithVAT.toFixed(2)}`
                          )}
                        </Button>
                      </div>
                    </form>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {orderComplete && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3 }}
              >
                <Card className="text-center">
                  <CardContent className="p-8">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <CheckCircle className="w-8 h-8 text-green-600" />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                      Ordine Confermato!
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 mb-6">
                      Grazie per il tuo acquisto. Riceverai una email di conferma a breve.
                    </p>
                    <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 mb-6">
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Numero Ordine: <span className="font-mono font-bold">#GA{Date.now()}</span>
                      </p>
                    </div>
                    <Button
                      onClick={handleClose}
                      className="w-full bg-blue-600 hover:bg-blue-700"
                    >
                      Continua a Comprare
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </div>

          {/* Right Column - Order Summary */}
          <div>
            <Card className="sticky top-0">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="w-5 h-5" />
                  Riepilogo Ordine
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="max-h-60 overflow-y-auto space-y-3">
                  {items.map((item) => (
                    <div key={item.id} className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-lg overflow-hidden shrink-0">
                        {item.imageUrl ? (
                          <img
                            src={item.imageUrl}
                            alt={item.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Package className="w-4 h-4 text-gray-400" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-sm truncate">{item.name}</h4>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="secondary" className="text-xs">
                            {item.category}
                          </Badge>
                          <span className="text-xs text-gray-500">
                            Qty: {item.quantity}
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-bold">
                          €{(item.price * item.quantity).toFixed(2)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                
                <Separator />
                
                {/* Coupon Section */}
                <CouponSection
                  totalAmount={subtotal}
                  onCouponApplied={handleCouponApplied}
                  onCouponRemoved={handleCouponRemoved}
                  appliedCoupon={appliedCoupon}
                />
                
                <Separator />
                
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Subtotale</span>
                    <span>€{subtotal.toFixed(2)}</span>
                  </div>
                  {appliedCoupon && (
                    <div className="flex justify-between text-sm text-green-600">
                      <span>Sconto ({appliedCoupon.code})</span>
                      <span>-€{appliedCoupon.discount.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-sm">
                    <span>Spedizione</span>
                    <span className="text-green-600">Gratuita</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>IVA (22%)</span>
                    <span>€{vatAmount.toFixed(2)}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between text-lg font-bold">
                    <span>Totale</span>
                    <span className="text-blue-600">€{totalWithVAT.toFixed(2)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}