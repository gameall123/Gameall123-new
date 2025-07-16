import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Star, Filter, Search, ThumbsUp, ThumbsDown, MessageSquare } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

interface Review {
  id: number;
  productId: number;
  userId: string;
  rating: number;
  comment: string;
  createdAt: string;
  product?: {
    id: number;
    name: string;
    imageUrl: string;
  };
  user?: {
    firstName: string;
    lastName: string;
    profileImageUrl?: string;
  };
}

interface Product {
  id: number;
  name: string;
  imageUrl: string;
  category: string;
}

export default function ReviewsPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRating, setSelectedRating] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("newest");
  const [isWritingReview, setIsWritingReview] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState<number | null>(null);
  const [newReview, setNewReview] = useState({
    rating: 5,
    comment: ""
  });

  // Fetch reviews
  const { data: reviews = [], isLoading: reviewsLoading } = useQuery({
    queryKey: ['reviews', searchQuery, selectedRating, sortBy],
    queryFn: async (): Promise<Review[]> => {
      const params = new URLSearchParams();
      if (searchQuery) params.append('search', searchQuery);
      if (selectedRating !== 'all') params.append('rating', selectedRating);
      params.append('sort', sortBy);
      
      const response = await fetch(`/api/reviews?${params}`);
      if (!response.ok) throw new Error('Failed to fetch reviews');
      return response.json();
    },
  });

  // Fetch user's reviews
  const { data: myReviews = [] } = useQuery({
    queryKey: ['my-reviews'],
    queryFn: async (): Promise<Review[]> => {
      if (!user) return [];
      const response = await fetch(`/api/reviews/user/${user.id}`);
      if (!response.ok) throw new Error('Failed to fetch user reviews');
      return response.json();
    },
    enabled: !!user,
  });

  // Fetch products for review writing
  const { data: products = [] } = useQuery({
    queryKey: ['products-for-review'],
    queryFn: async (): Promise<Product[]> => {
      const response = await fetch('/api/products');
      if (!response.ok) throw new Error('Failed to fetch products');
      return response.json();
    },
  });

  // Create review mutation
  const createReviewMutation = useMutation({
    mutationFn: async (reviewData: { productId: number; rating: number; comment: string }) => {
      const response = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(reviewData),
      });
      if (!response.ok) throw new Error('Failed to create review');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reviews'] });
      queryClient.invalidateQueries({ queryKey: ['my-reviews'] });
      setIsWritingReview(false);
      setNewReview({ rating: 5, comment: "" });
      setSelectedProductId(null);
      toast({
        title: "Recensione pubblicata!",
        description: "La tua recensione è stata pubblicata con successo.",
      });
    },
    onError: () => {
      toast({
        title: "Errore",
        description: "Impossibile pubblicare la recensione.",
        variant: "destructive",
      });
    },
  });

  const handleSubmitReview = () => {
    if (!selectedProductId || !newReview.comment.trim()) {
      toast({
        title: "Errore",
        description: "Seleziona un prodotto e scrivi un commento.",
        variant: "destructive",
      });
      return;
    }

    createReviewMutation.mutate({
      productId: selectedProductId,
      rating: newReview.rating,
      comment: newReview.comment,
    });
  };

  const renderStars = (rating: number, interactive = false, onRatingChange?: (rating: number) => void) => {
    return (
      <div className="flex space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-4 h-4 ${
              star <= rating
                ? 'fill-yellow-400 text-yellow-400'
                : 'text-gray-300'
            } ${interactive ? 'cursor-pointer hover:text-yellow-400' : ''}`}
            onClick={interactive && onRatingChange ? () => onRatingChange(star) : undefined}
          />
        ))}
      </div>
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('it-IT', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const filteredReviews = reviews.filter(review => {
    if (searchQuery && !review.product?.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !review.comment.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    if (selectedRating !== 'all' && review.rating !== parseInt(selectedRating)) {
      return false;
    }
    return true;
  });

  const sortedReviews = [...filteredReviews].sort((a, b) => {
    switch (sortBy) {
      case 'newest':
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      case 'oldest':
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      case 'highest':
        return b.rating - a.rating;
      case 'lowest':
        return a.rating - b.rating;
      default:
        return 0;
    }
  });

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-8"
      >
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              Recensioni Prodotti
            </h1>
            <p className="text-gray-600 mt-2">
              Leggi e scrivi recensioni sui nostri prodotti gaming
            </p>
          </div>
          
          {user && (
            <Dialog open={isWritingReview} onOpenChange={setIsWritingReview}>
              <DialogTrigger asChild>
                <Button className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700">
                  <MessageSquare className="w-4 h-4 mr-2" />
                  Scrivi Recensione
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Scrivi una Recensione</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label>Prodotto</Label>
                    <Select 
                      value={selectedProductId?.toString() || ""} 
                      onValueChange={(value) => setSelectedProductId(parseInt(value))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Seleziona un prodotto" />
                      </SelectTrigger>
                      <SelectContent>
                        {products.map((product) => (
                          <SelectItem key={product.id} value={product.id.toString()}>
                            {product.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label>Valutazione</Label>
                    <div className="mt-2">
                      {renderStars(newReview.rating, true, (rating) => 
                        setNewReview(prev => ({ ...prev, rating }))
                      )}
                    </div>
                  </div>
                  
                  <div>
                    <Label>Commento</Label>
                    <Textarea
                      value={newReview.comment}
                      onChange={(e) => setNewReview(prev => ({ ...prev, comment: e.target.value }))}
                      placeholder="Condividi la tua esperienza con questo prodotto..."
                      className="mt-2"
                      rows={4}
                    />
                  </div>
                  
                  <Button 
                    onClick={handleSubmitReview}
                    disabled={createReviewMutation.isPending}
                    className="w-full"
                  >
                    {createReviewMutation.isPending ? 'Pubblicando...' : 'Pubblica Recensione'}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          )}
        </div>

        {/* My Reviews Section */}
        {user && myReviews.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="w-5 h-5" />
                Le Tue Recensioni
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4">
                {myReviews.slice(0, 3).map((review) => (
                  <div key={review.id} className="flex items-start gap-4 p-4 border rounded-lg">
                    {review.product?.imageUrl && (
                      <img 
                        src={review.product.imageUrl} 
                        alt={review.product.name}
                        className="w-16 h-16 rounded object-cover"
                      />
                    )}
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-medium">{review.product?.name}</h3>
                        {renderStars(review.rating)}
                      </div>
                      <p className="text-gray-600 text-sm">{review.comment}</p>
                      <p className="text-xs text-gray-400 mt-2">{formatDate(review.createdAt)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Filters and Search */}
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="Cerca recensioni o prodotti..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              
              <Select value={selectedRating} onValueChange={setSelectedRating}>
                <SelectTrigger className="w-full md:w-48">
                  <SelectValue placeholder="Filtra per stelle" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tutte le stelle</SelectItem>
                  <SelectItem value="5">5 stelle</SelectItem>
                  <SelectItem value="4">4 stelle</SelectItem>
                  <SelectItem value="3">3 stelle</SelectItem>
                  <SelectItem value="2">2 stelle</SelectItem>
                  <SelectItem value="1">1 stella</SelectItem>
                </SelectContent>
              </Select>
              
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-full md:w-48">
                  <SelectValue placeholder="Ordina per" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">Più recenti</SelectItem>
                  <SelectItem value="oldest">Più vecchie</SelectItem>
                  <SelectItem value="highest">Stelle più alte</SelectItem>
                  <SelectItem value="lowest">Stelle più basse</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Reviews List */}
        <div className="space-y-6">
          {reviewsLoading ? (
            <div className="grid gap-6">
              {[...Array(5)].map((_, i) => (
                <Card key={i}>
                  <CardContent className="p-6">
                    <div className="animate-pulse">
                      <div className="flex items-start gap-4">
                        <div className="w-16 h-16 bg-gray-200 rounded"></div>
                        <div className="flex-1 space-y-2">
                          <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                          <div className="h-3 bg-gray-200 rounded w-1/4"></div>
                          <div className="h-3 bg-gray-200 rounded w-full"></div>
                          <div className="h-3 bg-gray-200 rounded w-3/4"></div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : sortedReviews.length > 0 ? (
            <div className="grid gap-6">
              {sortedReviews.map((review) => (
                <motion.div
                  key={review.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <Card className="hover:shadow-lg transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex items-start gap-4">
                        {review.product?.imageUrl && (
                          <img 
                            src={review.product.imageUrl} 
                            alt={review.product.name}
                            className="w-16 h-16 rounded object-cover"
                          />
                        )}
                        
                        <div className="flex-1">
                          <div className="flex items-start justify-between mb-3">
                            <div>
                              <h3 className="font-semibold text-lg">{review.product?.name}</h3>
                              <div className="flex items-center gap-2 mt-1">
                                {renderStars(review.rating)}
                                <Badge variant="secondary">{review.rating}/5</Badge>
                              </div>
                            </div>
                            
                            <div className="text-right">
                              <div className="flex items-center gap-2 mb-1">
                                <Avatar className="w-6 h-6">
                                  <AvatarImage src={review.user?.profileImageUrl} />
                                  <AvatarFallback className="text-xs">
                                    {review.user?.firstName?.[0]}{review.user?.lastName?.[0]}
                                  </AvatarFallback>
                                </Avatar>
                                <span className="text-sm font-medium">
                                  {review.user?.firstName} {review.user?.lastName}
                                </span>
                              </div>
                              <p className="text-xs text-gray-500">{formatDate(review.createdAt)}</p>
                            </div>
                          </div>
                          
                          <p className="text-gray-700 leading-relaxed">{review.comment}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="p-12 text-center">
                <MessageSquare className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-600 mb-2">Nessuna recensione trovata</h3>
                <p className="text-gray-500">
                  {searchQuery || selectedRating !== 'all' 
                    ? 'Prova a modificare i filtri di ricerca.' 
                    : 'Sii il primo a scrivere una recensione!'}
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </motion.div>
    </div>
  );
}