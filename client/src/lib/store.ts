import { create } from 'zustand';
import { Product, CartItem } from '@shared/schema';

interface CartItemWithProduct extends CartItem {
  name: string;
  price: number;
  imageUrl?: string;
  category?: string;
}

interface CartState {
  items: CartItemWithProduct[];
  isOpen: boolean;
  total: number;
  toggleCart: () => void;
  addToCart: (product: Product, quantity?: number) => void;
  removeFromCart: (itemId: number) => void;
  updateQuantity: (itemId: number, quantity: number) => void;
  clearCart: () => void;
  getTotalPrice: () => number;
  getItemCount: () => number;
}

interface NotificationState {
  notifications: Array<{
    id: string;
    message: string;
    type: 'success' | 'error' | 'info' | 'warning';
  }>;
  showNotification: (message: string, type?: 'success' | 'error' | 'info' | 'warning') => void;
  removeNotification: (id: string) => void;
}

export const useCartStore = create<CartState>((set, get) => ({
  items: [],
  isOpen: false,
  total: 0,
  toggleCart: () => set((state) => ({ isOpen: !state.isOpen })),
  addToCart: (product: Product, quantity = 1) => {
    set((state) => {
      const existingItem = state.items.find(item => item.productId === product.id);
      if (existingItem) {
        return {
          items: state.items.map(item =>
            item.productId === product.id
              ? { ...item, quantity: item.quantity + quantity }
              : item
          )
        };
      } else {
        return {
          items: [...state.items, {
            id: Date.now(), // Temporary ID for local state
            userId: '', // Will be set by the component
            productId: product.id,
            quantity,
            createdAt: new Date(),
            name: product.name,
            price: Number(product.price),
            imageUrl: product.imageUrl || undefined,
            category: product.category || undefined,
          }]
        };
      }
    });
  },
  removeFromCart: (itemId: number) => {
    set((state) => ({
      items: state.items.filter(item => item.id !== itemId)
    }));
  },
  updateQuantity: (itemId: number, quantity: number) => {
    if (quantity <= 0) {
      get().removeFromCart(itemId);
      return;
    }
    set((state) => ({
      items: state.items.map(item =>
        item.id === itemId ? { ...item, quantity } : item
      )
    }));
  },
  clearCart: () => set({ items: [], total: 0 }),
  getTotalPrice: () => {
    const { items } = get();
    return items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  },
  getItemCount: () => {
    const { items } = get();
    return items.reduce((sum, item) => sum + item.quantity, 0);
  },
}));

export const useNotificationStore = create<NotificationState>((set, get) => ({
  notifications: [],
  showNotification: (message: string, type = 'info') => {
    const id = Date.now().toString();
    set((state) => ({
      notifications: [...state.notifications, { id, message, type }]
    }));
    
    // Auto remove after 3 seconds
    setTimeout(() => {
      get().removeNotification(id);
    }, 3000);
  },
  removeNotification: (id: string) => {
    set((state) => ({
      notifications: state.notifications.filter(n => n.id !== id)
    }));
  },
}));
