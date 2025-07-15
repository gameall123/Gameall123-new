import { motion, AnimatePresence } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/hooks/use-auth';
import { useCartStore } from '@/lib/store';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Heart, ShoppingCart, Star, Package, Trash2, Eye } from 'lucide-react';
import { toast } from 'sonner';
import { Link } from 'wouter';

interface WishlistItem {
  id: number;
  productId: number;
  userId: string;
  createdAt: string;
  product: {
    id: number;
    name: string;
    description: string;
    price: string;
    imageUrl: string;
    category: string;
    stock: number;
    isActive: boolean;
  };
}

export default function Wishlist() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { addToCart, getItemQuantity } = useCartStore();

  // Fetch wishlist items
  const { data: wishlistItems = [], isLoading } = useQuery<WishlistItem[]>({
    queryKey: ['/api/wishlist'],
    queryFn: async () => {
      const response = await fetch('/api/wishlist');
      if (!response.ok) throw new Error('Failed to fetch wishlist');
      return response.json();
    },
    enabled: !!user,
  });

  // Remove from wishlist mutation
  const removeFromWishlistMutation = useMutation({
    mutationFn: async (wishlistItemId: number) => {
      const response = await fetch(`/api/wishlist/${wishlistItemId}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Failed to remove from wishlist');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/wishlist'] });
      toast.success('Prodotto rimosso dalla wishlist');
    },
    onError: () => {
      toast.error('Errore nella rimozione del prodotto');
    },
  });

  const handleAddToCart = (product: WishlistItem['product']) => {
    if (product.stock > 0) {
      addToCart(product);
      toast.success('Prodotto aggiunto al carrello');
    } else {
      toast.error('Prodotto non disponibile');
    }
  };

  const handleRemoveFromWishlist = (wishlistItemId: number) => {
    removeFromWishlistMutation.mutate(wishlistItemId);
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <Card className="text-center py-12">
            <CardContent className="space-y-6">
              <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto">
                <Heart className="w-8 h-8 text-gray-400" />
              </div>
              <div className="space-y-2">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                  Accedi per vedere la tua wishlist
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Salva i tuoi prodotti preferiti effettuando l'accesso
                </p>
              </div>
              <Link href="/auth">
                <Button>Accedi</Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-pink-600 rounded-lg flex items-center justify-center">
                <Heart className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Lista Desideri
                </h1>
                <p className="text-gray-600 dark:text-gray-400">
                  Caricamento...
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="space-y-6"
        >
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-pink-600 rounded-lg flex items-center justify-center">
                <Heart className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Lista Desideri
                </h1>
                <p className="text-gray-600 dark:text-gray-400">
                  I tuoi prodotti preferiti
                </p>
              </div>
            </div>
            <Badge variant="secondary" className="px-3 py-1">
              {wishlistItems.length} prodotti
            </Badge>
          </div>

          {/* Wishlist Items */}
          {wishlistItems.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <AnimatePresence>
                {wishlistItems.map((item) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Card className="group hover:shadow-lg transition-shadow">
                      <CardContent className="p-4">
                        <div className="relative mb-4">
                          <img
                            src={item.product.imageUrl || '/placeholder.jpg'}
                            alt={item.product.name}
                            className="w-full h-48 object-cover rounded-lg"
                          />
                          <div className="absolute top-2 right-2 flex gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="bg-white/90 hover:bg-white"
                              onClick={() => handleRemoveFromWishlist(item.id)}
                            >
                              <Trash2 className="w-4 h-4 text-red-500" />
                            </Button>
                          </div>
                          {item.product.stock <= 0 && (
                            <div className="absolute inset-0 bg-black/50 rounded-lg flex items-center justify-center">
                              <Badge variant="destructive">Non disponibile</Badge>
                            </div>
                          )}
                        </div>
                        
                        <div className="space-y-2">
                          <h3 className="font-semibold text-gray-900 dark:text-white line-clamp-2">
                            {item.product.name}
                          </h3>
                          <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                            {item.product.description}
                          </p>
                          <div className="flex items-center justify-between">
                            <div className="space-y-1">
                              <div className="text-lg font-bold text-gray-900 dark:text-white">
                                €{parseFloat(item.product.price).toFixed(2)}
                              </div>
                              <Badge variant="outline" className="text-xs">
                                {item.product.category}
                              </Badge>
                            </div>
                            <div className="text-sm text-gray-500">
                              Stock: {item.product.stock}
                            </div>
                          </div>
                        </div>

                        <div className="mt-4 flex gap-2">
                          <Button
                            onClick={() => handleAddToCart(item.product)}
                            disabled={item.product.stock <= 0}
                            className="flex-1"
                          >
                            <ShoppingCart className="w-4 h-4 mr-2" />
                            {getItemQuantity(item.product.id) > 0 ? 'Nel carrello' : 'Aggiungi al carrello'}
                          </Button>
                          <Link href={`/product/${item.product.id}`}>
                            <Button variant="outline" size="sm">
                              <Eye className="w-4 h-4" />
                            </Button>
                          </Link>
                        </div>

                        <div className="mt-2 text-xs text-gray-500">
                          Aggiunto il {new Date(item.createdAt).toLocaleDateString('it-IT')}
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          ) : (
            <Card className="text-center py-12">
              <CardContent className="space-y-6">
                <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto">
                  <Heart className="w-8 h-8 text-gray-400" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                    La tua lista desideri è vuota
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    Esplora i nostri prodotti e aggiungi i tuoi preferiti alla wishlist
                  </p>
                </div>
                <Link href="/">
                  <Button>
                    <Package className="w-4 h-4 mr-2" />
                    Esplora prodotti
                  </Button>
                </Link>
              </CardContent>
            </Card>
          )}
        </motion.div>
      </div>
    </div>
  );
}