import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/hooks/use-auth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ProductCard } from './ProductCard';
import { 
  Sparkles, 
  TrendingUp, 
  Eye, 
  Heart, 
  Star, 
  RefreshCw,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { Product } from '@shared/schema';

type RecommendationType = 'trending' | 'personalized' | 'similar' | 'recent';

interface ProductRecommendationsProps {
  type?: RecommendationType;
  productId?: number; // For similar products
  userId?: string; // For personalized recommendations
  limit?: number;
  title?: string;
}

export function ProductRecommendations({ 
  type = 'trending', 
  productId,
  userId, 
  limit = 8,
  title 
}: ProductRecommendationsProps) {
  const { user } = useAuth();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  // Fetch recommendations based on type
  const { data: recommendations = [], isLoading, refetch } = useQuery<Product[]>({
    queryKey: ['/api/products/recommendations', type, productId, userId],
    queryFn: async () => {
      // Simulate recommendations API - in real app this would be more sophisticated
      let url = '/api/products';
      const params = new URLSearchParams();
      
      switch (type) {
        case 'trending':
          // Get products sorted by popularity (mock logic)
          params.append('limit', limit.toString());
          params.append('sort', 'trending');
          break;
        case 'personalized':
          // Get products based on user's past behavior
          if (user) {
            params.append('userId', user.id);
            params.append('limit', limit.toString());
            params.append('type', 'personalized');
          }
          break;
        case 'similar':
          // Get products similar to current product
          if (productId) {
            params.append('similar', productId.toString());
            params.append('limit', limit.toString());
          }
          break;
        case 'recent':
          // Get recently viewed products
          params.append('limit', limit.toString());
          params.append('sort', 'recent');
          break;
      }
      
      const response = await fetch(`${url}?${params}`);
      if (!response.ok) throw new Error('Failed to fetch recommendations');
      const data = await response.json();
      
      // Simulate recommendation logic by randomly selecting and scoring products
      const shuffled = [...data].sort(() => 0.5 - Math.random());
      return shuffled.slice(0, limit);
    },
    enabled: type !== 'personalized' || !!user,
  });

  // Auto-play carousel
  useEffect(() => {
    if (!isAutoPlaying || recommendations.length <= 4) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => 
        prev + 4 >= recommendations.length ? 0 : prev + 4
      );
    }, 5000);

    return () => clearInterval(interval);
  }, [isAutoPlaying, recommendations.length]);

  const getIcon = () => {
    switch (type) {
      case 'trending':
        return <TrendingUp className="w-5 h-5" />;
      case 'personalized':
        return <Sparkles className="w-5 h-5" />;
      case 'similar':
        return <Eye className="w-5 h-5" />;
      case 'recent':
        return <Heart className="w-5 h-5" />;
      default:
        return <Star className="w-5 h-5" />;
    }
  };

  const getTitle = () => {
    if (title) return title;
    
    switch (type) {
      case 'trending':
        return 'Prodotti di tendenza';
      case 'personalized':
        return 'Raccomandato per te';
      case 'similar':
        return 'Prodotti simili';
      case 'recent':
        return 'Visti di recente';
      default:
        return 'Prodotti consigliati';
    }
  };

  const getDescription = () => {
    switch (type) {
      case 'trending':
        return 'I prodotti più popolari del momento';
      case 'personalized':
        return 'Basato sui tuoi interessi e acquisti precedenti';
      case 'similar':
        return 'Altri prodotti che potrebbero interessarti';
      case 'recent':
        return 'Prodotti che hai visualizzato di recente';
      default:
        return 'Una selezione curata per te';
    }
  };

  const nextSlide = () => {
    setCurrentIndex((prev) => 
      prev + 4 >= recommendations.length ? 0 : prev + 4
    );
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => 
      prev - 4 < 0 ? Math.max(0, recommendations.length - 4) : prev - 4
    );
  };

  if (isLoading) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {getIcon()}
            <span>{getTitle()}</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="bg-gray-200 aspect-square rounded-lg mb-2"></div>
                <div className="bg-gray-200 h-4 rounded mb-1"></div>
                <div className="bg-gray-200 h-3 rounded w-3/4"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (recommendations.length === 0) {
    return null;
  }

  const visibleProducts = recommendations.slice(currentIndex, currentIndex + 4);

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {getIcon()}
            <div>
              <h3 className="text-lg font-semibold">{getTitle()}</h3>
              <p className="text-sm text-gray-600 font-normal">{getDescription()}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => refetch()}
              className="text-blue-600 hover:text-blue-700"
            >
              <RefreshCw className="w-4 h-4 mr-1" />
              Aggiorna
            </Button>
            {recommendations.length > 4 && (
              <div className="flex gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={prevSlide}
                  disabled={currentIndex === 0}
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={nextSlide}
                  disabled={currentIndex + 4 >= recommendations.length}
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            )}
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="relative">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentIndex}
              initial={{ opacity: 0, x: 300 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -300 }}
              transition={{ duration: 0.3 }}
              className="grid grid-cols-2 md:grid-cols-4 gap-4"
            >
              {visibleProducts.map((product, index) => (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="group"
                >
                  <div className="aspect-square bg-gray-100 rounded-lg mb-2 overflow-hidden relative">
                    <img
                      src={product.imageUrl || '/placeholder.jpg'}
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    />
                    <div className="absolute top-2 right-2">
                      <Badge variant="secondary" className="text-xs">
                        {product.category}
                      </Badge>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <h4 className="font-medium text-sm line-clamp-2 group-hover:text-blue-600 transition-colors">
                      {product.name}
                    </h4>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-semibold text-green-600">
                        €{parseFloat(product.price).toFixed(2)}
                      </span>
                      <div className="flex items-center gap-1">
                        <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                        <span className="text-xs text-gray-500">
                          {(Math.random() * 2 + 3).toFixed(1)}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span>Stock: {product.stock}</span>
                      <span>{product.category}</span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </AnimatePresence>
        </div>

        {recommendations.length > 4 && (
          <div className="flex justify-center mt-4 gap-2">
            {Array.from({ length: Math.ceil(recommendations.length / 4) }, (_, i) => (
              <button
                key={i}
                onClick={() => setCurrentIndex(i * 4)}
                className={`w-2 h-2 rounded-full transition-colors ${
                  Math.floor(currentIndex / 4) === i
                    ? 'bg-blue-600'
                    : 'bg-gray-300'
                }`}
              />
            ))}
          </div>
        )}

        {type === 'personalized' && !user && (
          <div className="text-center py-8">
            <p className="text-gray-500 mb-4">
              Accedi per vedere le raccomandazioni personalizzate
            </p>
            <Button onClick={() => window.location.href = '/auth'}>
              Accedi
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}