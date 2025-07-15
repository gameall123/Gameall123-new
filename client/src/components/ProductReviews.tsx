import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/hooks/use-auth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Star, MessageSquare, Edit, Trash2, ThumbsUp, Flag } from 'lucide-react';
import { toast } from 'sonner';

interface Review {
  id: number;
  productId: number;
  userId: string;
  rating: number;
  comment: string;
  createdAt: string;
  user?: {
    firstName: string;
    lastName: string;
    profileImageUrl?: string;
  };
}

interface ProductReviewsProps {
  productId: number;
}

export function ProductReviews({ productId }: ProductReviewsProps) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [editingReview, setEditingReview] = useState<Review | null>(null);

  // Fetch reviews for this product
  const { data: reviews = [], isLoading } = useQuery<Review[]>({
    queryKey: ['/api/reviews', { productId }],
    queryFn: async () => {
      const response = await fetch(`/api/reviews?productId=${productId}`);
      if (!response.ok) throw new Error('Failed to fetch reviews');
      return response.json();
    },
  });

  // Add review mutation
  const addReviewMutation = useMutation({
    mutationFn: async (reviewData: { productId: number; rating: number; comment: string }) => {
      const response = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(reviewData),
      });
      if (!response.ok) throw new Error('Failed to add review');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/reviews'] });
      setIsReviewModalOpen(false);
      setRating(0);
      setComment('');
      toast.success('Recensione aggiunta con successo!');
    },
    onError: () => {
      toast.error('Errore nell\'aggiunta della recensione');
    },
  });

  // Update review mutation
  const updateReviewMutation = useMutation({
    mutationFn: async ({ id, ...reviewData }: { id: number; rating: number; comment: string }) => {
      const response = await fetch(`/api/reviews/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(reviewData),
      });
      if (!response.ok) throw new Error('Failed to update review');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/reviews'] });
      setEditingReview(null);
      setRating(0);
      setComment('');
      toast.success('Recensione aggiornata con successo!');
    },
    onError: () => {
      toast.error('Errore nell\'aggiornamento della recensione');
    },
  });

  // Delete review mutation
  const deleteReviewMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await fetch(`/api/reviews/${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Failed to delete review');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/reviews'] });
      toast.success('Recensione eliminata con successo!');
    },
    onError: () => {
      toast.error('Errore nell\'eliminazione della recensione');
    },
  });

  const handleSubmitReview = () => {
    if (!user) {
      toast.error('Devi effettuare l\'accesso per scrivere una recensione');
      return;
    }

    if (rating === 0 || !comment.trim()) {
      toast.error('Rating e commento sono obbligatori');
      return;
    }

    if (editingReview) {
      updateReviewMutation.mutate({ id: editingReview.id, rating, comment });
    } else {
      addReviewMutation.mutate({ productId, rating, comment });
    }
  };

  const handleEditReview = (review: Review) => {
    setEditingReview(review);
    setRating(review.rating);
    setComment(review.comment);
    setIsReviewModalOpen(true);
  };

  const handleDeleteReview = (id: number) => {
    if (confirm('Sei sicuro di voler eliminare questa recensione?')) {
      deleteReviewMutation.mutate(id);
    }
  };

  const calculateAverageRating = () => {
    if (reviews.length === 0) return 0;
    const total = reviews.reduce((sum, review) => sum + review.rating, 0);
    return (total / reviews.length).toFixed(1);
  };

  const getRatingDistribution = () => {
    const distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    reviews.forEach(review => {
      distribution[review.rating as keyof typeof distribution]++;
    });
    return distribution;
  };

  const userHasReviewed = reviews.some(review => review.userId === user?.id);

  if (isLoading) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5" />
            Caricamento recensioni...
          </CardTitle>
        </CardHeader>
      </Card>
    );
  }

  const averageRating = calculateAverageRating();
  const ratingDistribution = getRatingDistribution();

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5" />
            Recensioni ({reviews.length})
          </div>
          {user && !userHasReviewed && (
            <Dialog open={isReviewModalOpen} onOpenChange={setIsReviewModalOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                  <Edit className="w-4 h-4 mr-2" />
                  Scrivi recensione
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>
                    {editingReview ? 'Modifica recensione' : 'Scrivi una recensione'}
                  </DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Rating</label>
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          onClick={() => setRating(star)}
                          className={`w-8 h-8 ${
                            star <= rating ? 'text-yellow-400' : 'text-gray-300'
                          }`}
                        >
                          <Star className="w-full h-full fill-current" />
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Commento</label>
                    <Textarea
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      placeholder="Scrivi la tua recensione..."
                      rows={4}
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button
                      onClick={handleSubmitReview}
                      disabled={addReviewMutation.isPending || updateReviewMutation.isPending}
                    >
                      {editingReview ? 'Aggiorna' : 'Pubblica'}
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => {
                        setIsReviewModalOpen(false);
                        setEditingReview(null);
                        setRating(0);
                        setComment('');
                      }}
                    >
                      Annulla
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {reviews.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Rating Summary */}
            <div className="space-y-4">
              <div className="text-center">
                <div className="text-3xl font-bold">{averageRating}</div>
                <div className="flex justify-center gap-1 mb-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={`w-5 h-5 ${
                        star <= Math.round(parseFloat(averageRating))
                          ? 'text-yellow-400 fill-current'
                          : 'text-gray-300'
                      }`}
                    />
                  ))}
                </div>
                <div className="text-sm text-gray-600">
                  Basato su {reviews.length} recensioni
                </div>
              </div>
            </div>

            {/* Rating Distribution */}
            <div className="space-y-2">
              {[5, 4, 3, 2, 1].map((rating) => (
                <div key={rating} className="flex items-center gap-2">
                  <div className="flex items-center gap-1 w-12">
                    <span className="text-sm">{rating}</span>
                    <Star className="w-3 h-3 text-yellow-400 fill-current" />
                  </div>
                  <div className="flex-1 bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-yellow-400 h-2 rounded-full"
                      style={{
                        width: `${reviews.length > 0 ? (ratingDistribution[rating as keyof typeof ratingDistribution] / reviews.length) * 100 : 0}%`,
                      }}
                    />
                  </div>
                  <span className="text-sm text-gray-600 w-8">
                    {ratingDistribution[rating as keyof typeof ratingDistribution]}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Reviews List */}
        <div className="space-y-4">
          <AnimatePresence>
            {reviews.map((review) => (
              <motion.div
                key={review.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="border rounded-lg p-4 space-y-3"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <Avatar>
                      <AvatarImage src={review.user?.profileImageUrl} />
                      <AvatarFallback>
                        {review.user?.firstName?.[0]}{review.user?.lastName?.[0]}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="font-medium">
                        {review.user?.firstName} {review.user?.lastName}
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="flex gap-1">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                              key={star}
                              className={`w-4 h-4 ${
                                star <= review.rating
                                  ? 'text-yellow-400 fill-current'
                                  : 'text-gray-300'
                              }`}
                            />
                          ))}
                        </div>
                        <span className="text-sm text-gray-600">
                          {new Date(review.createdAt).toLocaleDateString('it-IT')}
                        </span>
                      </div>
                    </div>
                  </div>
                  {user?.id === review.userId && (
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEditReview(review)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteReview(review.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  )}
                </div>
                <p className="text-gray-700">{review.comment}</p>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {reviews.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <MessageSquare className="w-12 h-12 mx-auto mb-4 text-gray-400" />
            <p>Nessuna recensione ancora. Sii il primo a recensire questo prodotto!</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}