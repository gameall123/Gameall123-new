import { useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/hooks/useAuth';
import { useCartStore } from '@/lib/store';
import { useToast } from '@/hooks/use-toast';
import { CartToast } from './CartToast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import { 
  ShoppingCart, 
  Heart, 
  Star, 
  Package, 
  Info, 
  Plus, 
  Minus,
  Eye,
  Share2,
  Shield,
  Truck,
  RotateCcw,
  Gamepad2,
  Clock,
  Award,
  Zap
} from 'lucide-react';
import { Product } from '@shared/schema';

interface ProductCardProps {
  product: Product;
  index: number;
}

export function ProductCard({ product, index }: ProductCardProps) {
  const { isAuthenticated } = useAuth();
  const { addToCart } = useCartStore();
  const { toast } = useToast();
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [showCartToast, setShowCartToast] = useState(false);
  
  const handleAddToCart = () => {
    if (!isAuthenticated) {
      window.location.href = '/api/login';
      return;
    }
    
    setIsAdding(true);
    addToCart(product, quantity);
    setShowCartToast(true);
    
    // Reset animation after 1 second
    setTimeout(() => {
      setIsAdding(false);
    }, 1000);
  };

  const handleWishlist = () => {
    if (!isAuthenticated) {
      window.location.href = '/api/login';
      return;
    }
    
    setIsWishlisted(!isWishlisted);
    toast({
      title: isWishlisted ? "Rimosso dalla Wishlist" : "Aggiunto alla Wishlist",
      description: `${product.name} è stato ${isWishlisted ? 'rimosso dalla' : 'aggiunto alla'} wishlist.`,
    });
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: product.name,
        text: product.description || '',
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast({
        title: "Link Copiato",
        description: "Il link del prodotto è stato copiato negli appunti.",
      });
    }
  };

  const rating = 4.5; // Mock rating
  const reviews = Math.floor(Math.random() * 500) + 50; // Mock reviews

  return (
    <>
      <CartToast
        isVisible={showCartToast}
        onClose={() => setShowCartToast(false)}
        productName={product.name}
      />
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: index * 0.1 }}
        whileHover={{ y: -5, transition: { duration: 0.2 } }}
        className="group cursor-pointer"
      >
        <Card className="overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-white dark:bg-gray-800">
          <div className="relative aspect-square overflow-hidden bg-gray-100 dark:bg-gray-700">
            {/* Product Image */}
            <div className="relative w-full h-full">
              {product.imageUrl ? (
                <img
                  src={product.imageUrl}
                  alt={product.name}
                  className={`w-full h-full object-cover transition-all duration-500 group-hover:scale-110 ${
                    imageLoaded ? 'opacity-100' : 'opacity-0'
                  }`}
                  onLoad={() => setImageLoaded(true)}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600">
                  <Package className="w-16 h-16 text-gray-400 dark:text-gray-500" />
                </div>
              )}
              
              {/* Loading placeholder */}
              {!imageLoaded && product.imageUrl && (
                <div className="absolute inset-0 bg-gray-200 dark:bg-gray-700 animate-pulse flex items-center justify-center">
                  <Package className="w-16 h-16 text-gray-400" />
                </div>
              )}
            </div>

            {/* Overlay Actions */}
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300">
              <div className="absolute top-3 right-3 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleWishlist();
                  }}
                  className={`bg-white/90 hover:bg-white shadow-lg transition-all duration-200 ${
                    isWishlisted ? 'text-red-500' : 'text-gray-600'
                  }`}
                >
                  <Heart className={`w-4 h-4 ${isWishlisted ? 'fill-red-500' : ''}`} />
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleShare();
                  }}
                  className="bg-white/90 hover:bg-white shadow-lg transition-all duration-200"
                >
                  <Share2 className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Badges */}
            <div className="absolute top-3 left-3 flex flex-col gap-1">
              <Badge variant="secondary" className="bg-white/90 text-gray-700 shadow-sm">
                {product.category}
              </Badge>
              {(product.stock || 0) < 10 && (
                <Badge variant="destructive" className="bg-red-500 text-white shadow-sm">
                  Solo {product.stock} rimasti
                </Badge>
              )}
            </div>

            {/* Quick Add Button */}
            <div className="absolute bottom-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <Button
                onClick={(e) => {
                  e.stopPropagation();
                  handleAddToCart();
                }}
                className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg"
              >
                <ShoppingCart className="w-4 h-4 mr-2" />
                Aggiungi
              </Button>
            </div>
          </div>

          <CardContent className="p-4">
            <div className="space-y-3">
              {/* Product Name */}
              <h3 className="font-semibold text-lg text-gray-900 dark:text-white line-clamp-2 group-hover:text-blue-600 transition-colors">
                {product.name}
              </h3>

              {/* Rating */}
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-4 h-4 ${
                        i < Math.floor(rating)
                          ? 'text-yellow-400 fill-yellow-400'
                          : 'text-gray-300 dark:text-gray-600'
                      }`}
                    />
                  ))}
                </div>
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {rating} ({reviews} recensioni)
                </span>
              </div>

              {/* Description */}
              <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                {product.description}
              </p>

              {/* Price and Stock */}
              <div className="flex items-center justify-between">
                <div className="flex flex-col gap-1">
                  <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                    € {Number(product.price).toFixed(2)}
                  </span>
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    Stock: {product.stock}
                  </span>
                </div>
                <Button
                  onClick={handleAddToCart}
                  disabled={product.stock === 0}
                  className={`transition-all duration-300 ${
                    isAdding
                      ? 'bg-green-600 hover:bg-green-700 text-white transform scale-105'
                      : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg'
                  }`}
                >
                  <ShoppingCart className="w-4 h-4 mr-2" />
                  {isAdding ? 'Aggiunto!' : 'Aggiungi'}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Product Detail Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold">{product.name}</DialogTitle>
          </DialogHeader>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Left Column - Image */}
            <div className="space-y-4">
              <div className="aspect-square bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden">
                {product.imageUrl ? (
                  <img
                    src={product.imageUrl}
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Package className="w-24 h-24 text-gray-400" />
                  </div>
                )}
              </div>
              
              {/* Product Features */}
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="flex items-center gap-2 p-2 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <Shield className="w-4 h-4 text-green-500" />
                  <span>Garanzia 2 anni</span>
                </div>
                <div className="flex items-center gap-2 p-2 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <Truck className="w-4 h-4 text-blue-500" />
                  <span>Spedizione gratuita</span>
                </div>
                <div className="flex items-center gap-2 p-2 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <RotateCcw className="w-4 h-4 text-purple-500" />
                  <span>Reso facile</span>
                </div>
                <div className="flex items-center gap-2 p-2 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <Award className="w-4 h-4 text-orange-500" />
                  <span>Prodotto premium</span>
                </div>
              </div>
            </div>

            {/* Right Column - Details */}
            <div className="space-y-6">
              {/* Category and Rating */}
              <div className="flex items-center justify-between">
                <Badge variant="secondary" className="text-sm">
                  {product.category}
                </Badge>
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-4 h-4 ${
                          i < Math.floor(rating)
                            ? 'text-yellow-400 fill-yellow-400'
                            : 'text-gray-300 dark:text-gray-600'
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {rating} ({reviews})
                  </span>
                </div>
              </div>

              {/* Description */}
              <div>
                <h4 className="font-semibold mb-2">Descrizione</h4>
                <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                  {product.description}
                </p>
              </div>

              {/* Price */}
              <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Prezzo</span>
                  <span className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                    €{Number(product.price).toFixed(2)}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">
                    Disponibilità: {(product.stock || 0) > 0 ? `${product.stock || 0} in stock` : 'Non disponibile'}
                  </span>
                  <div className="flex items-center gap-1">
                    <Clock className="w-4 h-4 text-green-500" />
                    <span className="text-green-600">Consegna in 24h</span>
                  </div>
                </div>
              </div>

              {/* Quantity Selector */}
              <div className="flex items-center gap-4">
                <span className="font-medium">Quantità:</span>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    disabled={quantity <= 1}
                  >
                    <Minus className="w-4 h-4" />
                  </Button>
                  <span className="w-12 text-center font-medium">{quantity}</span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setQuantity(Math.min(product.stock || 0, quantity + 1))}
                    disabled={quantity >= (product.stock || 0)}
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              <Separator />

              {/* Actions */}
              <div className="space-y-3">
                <Button
                  onClick={handleAddToCart}
                  disabled={product.stock === 0}
                  className={`w-full h-12 text-lg transition-all duration-300 ${
                    isAdding
                      ? 'bg-green-600 hover:bg-green-700 text-white transform scale-105'
                      : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg'
                  }`}
                >
                  <ShoppingCart className="w-5 h-5 mr-2" />
                  {isAdding ? 'Aggiunto al Carrello!' : 'Aggiungi al Carrello'}
                </Button>
                
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={handleWishlist}
                    className={`flex-1 ${isWishlisted ? 'border-red-500 text-red-500' : ''}`}
                  >
                    <Heart className={`w-4 h-4 mr-2 ${isWishlisted ? 'fill-red-500' : ''}`} />
                    {isWishlisted ? 'Nella Wishlist' : 'Aggiungi alla Wishlist'}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={handleShare}
                    className="flex-1"
                  >
                    <Share2 className="w-4 h-4 mr-2" />
                    Condividi
                  </Button>
                </div>
              </div>

              {/* Additional Info */}
              <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Zap className="w-5 h-5 text-blue-600" />
                  <span className="font-semibold text-blue-800 dark:text-blue-200">
                    Caratteristiche Principali
                  </span>
                </div>
                <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
                  <li>• Compatibile con tutte le piattaforme</li>
                  <li>• Supporto multigiocatore online</li>
                  <li>• Grafica ad alta risoluzione</li>
                  <li>• Contenuti aggiuntivi inclusi</li>
                </ul>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}