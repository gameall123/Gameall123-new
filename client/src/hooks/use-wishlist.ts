import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from './use-auth';
import { toast } from 'sonner';

interface WishlistItem {
  id: number;
  productId: number;
  userId: string;
  createdAt: string;
  product?: {
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

export function useWishlist() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

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

  // Add to wishlist mutation
  const addToWishlistMutation = useMutation({
    mutationFn: async (productId: number) => {
      const response = await fetch('/api/wishlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId }),
      });
      if (!response.ok) throw new Error('Failed to add to wishlist');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/wishlist'] });
      toast.success('Prodotto aggiunto alla wishlist');
    },
    onError: () => {
      toast.error('Errore nell\'aggiunta del prodotto alla wishlist');
    },
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
      toast.error('Errore nella rimozione del prodotto dalla wishlist');
    },
  });

  // Check if product is in wishlist
  const isInWishlist = (productId: number) => {
    return wishlistItems.some(item => item.productId === productId);
  };

  // Get wishlist item by product ID
  const getWishlistItem = (productId: number) => {
    return wishlistItems.find(item => item.productId === productId);
  };

  // Toggle wishlist item
  const toggleWishlist = (productId: number) => {
    if (!user) {
      toast.error('Devi effettuare l\'accesso per aggiungere prodotti alla wishlist');
      return;
    }

    const existingItem = getWishlistItem(productId);
    if (existingItem) {
      removeFromWishlistMutation.mutate(existingItem.id);
    } else {
      addToWishlistMutation.mutate(productId);
    }
  };

  return {
    wishlistItems,
    isLoading,
    isInWishlist,
    getWishlistItem,
    toggleWishlist,
    addToWishlist: addToWishlistMutation.mutate,
    removeFromWishlist: removeFromWishlistMutation.mutate,
    isAddingToWishlist: addToWishlistMutation.isPending,
    isRemovingFromWishlist: removeFromWishlistMutation.isPending,
  };
}