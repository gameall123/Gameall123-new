import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Star, Heart, ShoppingCart, TrendingUp, Users, Sparkles } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useCartStore } from "@/lib/store";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";

interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  category: string;
  stock: number;
  averageRating?: number;
  reviewCount?: number;
  recommendationReason?: string;
}

interface ProductRecommendationsProps {
  userId?: string;
  productId?: number;
  category?: string;
  limit?: number;
  title?: string;
  subtitle?: string;
}

export function ProductRecommendations({ 
  userId, 
  productId, 
  category, 
  limit = 6,
  title = "Consigliati per te",
  subtitle = "Prodotti selezionati in base ai tuoi interessi"
}: ProductRecommendationsProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const { addItem } = useCartStore();

  // Fetch recommendations
  const { data: recommendations = [], isLoading } = useQuery({
    queryKey: ['recommendations', userId || user?.id, productId, category, limit],
    queryFn: async (): Promise<Product[]> => {
      const params = new URLSearchParams();
      if (userId || user?.id) params.append('userId', userId || user!.id);
      if (productId) params.append('productId', productId.toString());
      if (category) params.append('category', category);
      params.append('limit', limit.toString());
      
      const response = await fetch(`/api/recommendations?${params}`);
      if (!response.ok) throw new Error('Failed to fetch recommendations');
      return response.json();
    },
    enabled: !!(userId || user?.id || productId || category),
  });

  const handleAddToCart = (product: Product) => {
    addItem({
      productId: product.id,
      name: product.name,
      price: product.price,
      imageUrl: product.imageUrl,
      quantity: 1,
    });

    toast({
      title: "Prodotto aggiunto al carrello",
      description: `${product.name} è stato aggiunto al tuo carrello.`,
    });
  };

  const getRecommendationIcon = (reason?: string) => {
    switch (reason) {
      case 'trending':
        return <TrendingUp className="w-4 h-4 text-orange-500" />;
      case 'popular':
        return <Users className="w-4 h-4 text-blue-500" />;
      case 'similar':
        return <Sparkles className="w-4 h-4 text-purple-500" />;
      case 'category':
        return <Star className="w-4 h-4 text-yellow-500" />;
      default:
        return <Sparkles className="w-4 h-4 text-indigo-500" />;
    }
  };

  const getRecommendationBadge = (reason?: string) => {
    switch (reason) {
      case 'trending':
        return { text: 'Di tendenza', color: 'bg-orange-100 text-orange-800' };
      case 'popular':
        return { text: 'Popolare', color: 'bg-blue-100 text-blue-800' };
      case 'similar':
        return { text: 'Simile', color: 'bg-purple-100 text-purple-800' };
      case 'category':
        return { text: 'Categoria', color: 'bg-yellow-100 text-yellow-800' };
      case 'personalized':
        return { text: 'Per te', color: 'bg-indigo-100 text-indigo-800' };
      default:
        return { text: 'Consigliato', color: 'bg-gray-100 text-gray-800' };
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(limit)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <div className="aspect-square bg-gray-200 rounded-t-lg"></div>
              <CardContent className="p-4">
                <div className="space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                  <div className="h-6 bg-gray-200 rounded w-1/3"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (!recommendations.length) {
    return null;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <motion.h2 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent"
        >
          {title}
        </motion.h2>
        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-gray-600"
        >
          {subtitle}
        </motion.p>
      </div>

      {/* Products Grid */}
      <motion.div 
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
      >
        {recommendations.map((product, index) => {
          const badge = getRecommendationBadge(product.recommendationReason);
          
          return (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ y: -5 }}
              className="group"
            >
              <Card className="h-full overflow-hidden transition-all duration-300 hover:shadow-xl border-0 bg-white/50 backdrop-blur-sm">
                {/* Product Image */}
                <div className="relative aspect-square overflow-hidden">
                  <img
                    src={product.imageUrl}
                    alt={product.name}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                  />
                  
                  {/* Recommendation Badge */}
                  <div className="absolute top-3 left-3">
                    <Badge className={`${badge.color} flex items-center gap-1`}>
                      {getRecommendationIcon(product.recommendationReason)}
                      {badge.text}
                    </Badge>
                  </div>

                  {/* Quick Actions */}
                  <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <Button
                      variant="secondary"
                      size="icon"
                      className="bg-white/90 hover:bg-white"
                    >
                      <Heart className="w-4 h-4" />
                    </Button>
                  </div>

                  {/* Stock Warning */}
                  {product.stock < 10 && product.stock > 0 && (
                    <div className="absolute bottom-3 left-3">
                      <Badge variant="destructive" className="text-xs">
                        Solo {product.stock} rimasti
                      </Badge>
                    </div>
                  )}
                </div>

                {/* Product Info */}
                <CardContent className="p-4 space-y-3">
                  <div>
                    <Badge variant="outline" className="text-xs mb-2">
                      {product.category}
                    </Badge>
                    <h3 className="font-semibold text-gray-900 group-hover:text-indigo-600 transition-colors line-clamp-2">
                      {product.name}
                    </h3>
                  </div>

                  {/* Rating */}
                  {product.averageRating && (
                    <div className="flex items-center gap-2">
                      <div className="flex items-center">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`w-3 h-3 ${
                              i < Math.floor(product.averageRating!)
                                ? 'text-yellow-400 fill-current'
                                : 'text-gray-300'
                            }`}
                          />
                        ))}
                      </div>
                      <span className="text-xs text-gray-600">
                        {product.averageRating.toFixed(1)} 
                        {product.reviewCount && ` (${product.reviewCount})`}
                      </span>
                    </div>
                  )}

                  {/* Price and Actions */}
                  <div className="flex items-center justify-between pt-2">
                    <div className="space-y-1">
                      <p className="text-lg font-bold text-indigo-600">
                        €{product.price.toFixed(2)}
                      </p>
                    </div>

                    <Button
                      onClick={() => handleAddToCart(product)}
                      disabled={product.stock === 0}
                      className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white border-0"
                      size="sm"
                    >
                      <ShoppingCart className="w-4 h-4 mr-1" />
                      {product.stock === 0 ? 'Esaurito' : 'Aggiungi'}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </motion.div>

      {/* View More Button */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="text-center"
      >
        <Button 
          variant="outline" 
          className="bg-gradient-to-r from-indigo-50 to-purple-50 border-indigo-200 hover:bg-gradient-to-r hover:from-indigo-100 hover:to-purple-100"
        >
          Vedi altri prodotti consigliati
        </Button>
      </motion.div>
    </div>
  );
}