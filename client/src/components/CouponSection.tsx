import { useState } from 'react';
import { motion } from 'framer-motion';
import { useMutation } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tag, X, Check, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

interface Coupon {
  id: number;
  code: string;
  discount: string;
  discountType: 'percentage' | 'fixed';
  minAmount?: string;
  maxUses?: number;
  usedCount: number;
  isActive: boolean;
  expiresAt?: string;
}

interface CouponSectionProps {
  totalAmount: number;
  onCouponApplied: (discount: number, couponCode: string) => void;
  onCouponRemoved: () => void;
  appliedCoupon?: {
    code: string;
    discount: number;
  };
}

export function CouponSection({ 
  totalAmount, 
  onCouponApplied, 
  onCouponRemoved, 
  appliedCoupon 
}: CouponSectionProps) {
  const [couponCode, setCouponCode] = useState('');
  const [isValidating, setIsValidating] = useState(false);

  // Validate coupon mutation
  const validateCouponMutation = useMutation({
    mutationFn: async (code: string) => {
      const response = await fetch('/api/coupons/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, amount: totalAmount }),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Coupon non valido');
      }
      return response.json();
    },
    onSuccess: (data: { coupon: Coupon; discount: number }) => {
      const { coupon, discount } = data;
      onCouponApplied(discount, coupon.code);
      toast.success(`Coupon "${coupon.code}" applicato! Sconto: ${
        coupon.discountType === 'percentage' 
          ? `${parseFloat(coupon.discount)}%` 
          : `€${parseFloat(coupon.discount).toFixed(2)}`
      }`);
      setCouponCode('');
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const handleApplyCoupon = () => {
    if (!couponCode.trim()) {
      toast.error('Inserisci un codice coupon');
      return;
    }
    
    if (appliedCoupon) {
      toast.error('Rimuovi il coupon esistente prima di applicarne uno nuovo');
      return;
    }

    validateCouponMutation.mutate(couponCode.trim().toUpperCase());
  };

  const handleRemoveCoupon = () => {
    onCouponRemoved();
    toast.success('Coupon rimosso');
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Tag className="w-4 h-4 text-gray-500" />
        <Label className="text-sm font-medium">Codice Coupon</Label>
      </div>
      
      {!appliedCoupon ? (
        <div className="flex gap-2">
          <Input
            value={couponCode}
            onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
            placeholder="Inserisci codice coupon"
            className="flex-1"
            disabled={validateCouponMutation.isPending}
          />
          <Button
            onClick={handleApplyCoupon}
            disabled={!couponCode.trim() || validateCouponMutation.isPending}
            variant="outline"
          >
            {validateCouponMutation.isPending ? (
              <div className="w-4 h-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
            ) : (
              <>
                <Check className="w-4 h-4 mr-2" />
                Applica
              </>
            )}
          </Button>
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg"
        >
          <div className="flex items-center gap-2">
            <Tag className="w-4 h-4 text-green-600" />
            <span className="text-sm font-medium text-green-800 dark:text-green-200">
              {appliedCoupon.code}
            </span>
            <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100">
              -€{appliedCoupon.discount.toFixed(2)}
            </Badge>
          </div>
          <Button
            onClick={handleRemoveCoupon}
            variant="ghost"
            size="sm"
            className="text-green-600 hover:text-green-700 hover:bg-green-100 dark:text-green-400 dark:hover:text-green-300"
          >
            <X className="w-4 h-4" />
          </Button>
        </motion.div>
      )}

      <div className="text-xs text-gray-500 space-y-1">
        <p>• I coupon sono validi solo per ordini che rispettano l'importo minimo</p>
        <p>• Un solo coupon per ordine</p>
        <p>• I coupon non possono essere combinati con altre promozioni</p>
      </div>
    </div>
  );
}