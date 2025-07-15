import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { useRoute } from 'wouter';
import { useAuth } from '@/hooks/use-auth';
import { useCartStore } from '@/lib/store';
import { useWishlist } from '@/hooks/use-wishlist';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ProductReviews } from '@/components/ProductReviews';
import { ProductRecommendations } from '@/components/ProductRecommendations';
import { 
  ShoppingCart, 
  Heart, 
  Star, 
  Share2, 
  Eye, 
  Package, 
  Truck, 
  Shield, 
  RotateCcw,
  Plus,
  Minus,
  ArrowLeft,
  Zap,
  Award,
  Crown
} from 'lucide-react';
import { Product } from '@shared/schema';
import { toast } from 'sonner';
import { Link } from 'wouter';

export default function ProductDetail() {
  const [, params] = useRoute('/product/:id');
  const { user } = useAuth();
  const { addToCart, getItemQuantity } = useCartStore();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);

  const productId = params ? parseInt(params.id) : 0;

  // Fetch product details
  const { data: product, isLoading } = useQuery<Product>({
    queryKey: ['/api/products', productId],
    queryFn: async () => {
      const response = await fetch(`/api/products/${productId}`);
      if (!response.ok) throw new Error('Product not found');
      return response.json();
    },
    enabled: !!productId,
  });

  const handleAddToCart = () => {
    if (!product) return;
    
    for (let i = 0; i < quantity; i++) {
      addToCart(product);
    }
    
    toast.success(`${quantity} ${product.name} aggiunto al carrello`);
  };

  const handleWishlistToggle = () => {
    if (!product) return;
    toggleWishlist(product.id);
  };

  const handleShare = () => {
    if (navigator.share && product) {
      navigator.share({
        title: product.name,
        text: product.description,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success('Link copiato negli appunti!');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="animate-pulse">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="bg-gray-200 aspect-square rounded-lg"></div>
              <div className="space-y-4">
                <div className="bg-gray-200 h-8 rounded"></div>
                <div className="bg-gray-200 h-4 rounded w-3/4"></div>
                <div className="bg-gray-200 h-6 rounded w-1/2"></div>
                <div className="bg-gray-200 h-32 rounded"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center py-12">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              Prodotto non trovato
            </h1>
            <Link href="/">
              <Button>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Torna alla home
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const images = [product.imageUrl || '/placeholder.jpg'];
  const inStock = product.stock > 0;
  const cartQuantity = getItemQuantity(product.id);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <div className="mb-8">
          <nav className="flex" aria-label="Breadcrumb">
            <ol className="flex items-center space-x-2">
              <li>
                <Link href="/" className="text-gray-500 hover:text-gray-700">
                  Home
                </Link>
              </li>
              <li>
                <span className="text-gray-500">/</span>
              </li>
              <li>
                <span className="text-gray-500">{product.category}</span>
              </li>
              <li>
                <span className="text-gray-500">/</span>
              </li>
              <li>
                <span className="text-gray-900 font-medium">{product.name}</span>
              </li>
            </ol>
          </nav>
        </div>

        {/* Product Details */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-12">
          {/* Images */}
          <div className="space-y-4">
            <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
              <img
                src={images[selectedImage]}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            </div>
            {images.length > 1 && (
              <div className="flex gap-2">
                {images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={`w-20 h-20 rounded-lg overflow-hidden ${
                      selectedImage === index ? 'ring-2 ring-blue-500' : ''
                    }`}
                  >
                    <img
                      src={image}
                      alt={`${product.name} ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Badge variant="secondary">{product.category}</Badge>
                <div className="flex items-center gap-1">
                  <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  <span className="text-sm text-gray-600">
                    4.5 (120 recensioni)
                  </span>
                </div>
              </div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                {product.name}
              </h1>
              <p className="text-gray-600 dark:text-gray-400 text-lg">
                {product.description}
              </p>
            </div>

            {/* Price and Stock */}
            <div className="space-y-2">
              <div className="text-3xl font-bold text-green-600">
                €{parseFloat(product.price).toFixed(2)}
              </div>
              <div className="flex items-center gap-2">
                <Package className="w-4 h-4 text-gray-500" />
                <span className={`text-sm ${inStock ? 'text-green-600' : 'text-red-600'}`}>
                  {inStock ? `${product.stock} disponibili` : 'Esaurito'}
                </span>
              </div>
            </div>

            {/* Quantity and Actions */}
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="flex items-center border rounded-lg">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    disabled={quantity <= 1}
                  >
                    <Minus className="w-4 h-4" />
                  </Button>
                  <span className="px-4 py-2 font-medium">{quantity}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                    disabled={quantity >= product.stock}
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
                <span className="text-sm text-gray-600">
                  {cartQuantity > 0 && `${cartQuantity} nel carrello`}
                </span>
              </div>

              <div className="flex gap-3">
                <Button
                  onClick={handleAddToCart}
                  disabled={!inStock || quantity <= 0}
                  className="flex-1"
                  size="lg"
                >
                  <ShoppingCart className="w-4 h-4 mr-2" />
                  Aggiungi al carrello
                </Button>
                <Button
                  variant="outline"
                  onClick={handleWishlistToggle}
                  className={`${isInWishlist(product.id) ? 'text-red-500 border-red-500' : ''}`}
                >
                  <Heart className={`w-4 h-4 ${isInWishlist(product.id) ? 'fill-red-500' : ''}`} />
                </Button>
                <Button variant="outline" onClick={handleShare}>
                  <Share2 className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Features */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm">
                <Truck className="w-4 h-4 text-green-600" />
                <span>Spedizione gratuita sopra i €50</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Shield className="w-4 h-4 text-blue-600" />
                <span>Garanzia 2 anni</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <RotateCcw className="w-4 h-4 text-purple-600" />
                <span>Reso gratuito entro 30 giorni</span>
              </div>
            </div>
          </div>
        </div>

        {/* Reviews Section */}
        <div className="mb-12">
          <ProductReviews productId={product.id} />
        </div>

        {/* Related Products */}
        <div className="mb-12">
          <ProductRecommendations 
            type="similar" 
            productId={product.id} 
            limit={8} 
          />
        </div>
      </div>
    </div>
  );
}