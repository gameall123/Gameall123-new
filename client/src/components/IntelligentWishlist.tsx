import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Heart, 
  HeartOff, 
  Star, 
  TrendingDown, 
  TrendingUp, 
  Bell, 
  BellOff,
  Share2, 
  Filter, 
  SortAsc, 
  Eye,
  ShoppingCart,
  Calendar,
  DollarSign,
  Zap,
  Target,
  Gift,
  AlertTriangle,
  CheckCircle,
  Clock,
  Sparkles,
  BarChart3,
  Users,
  Tag
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Progress } from '@/components/ui/progress';

interface WishlistItem {
  id: string;
  productId: string;
  name: string;
  price: number;
  originalPrice: number;
  image: string;
  category: string;
  brand: string;
  rating: number;
  availability: 'in_stock' | 'low_stock' | 'out_of_stock' | 'pre_order';
  addedAt: Date;
  priceHistory: Array<{
    price: number;
    date: Date;
  }>;
  notifications: {
    priceAlert: boolean;
    stockAlert: boolean;
    saleAlert: boolean;
    targetPrice?: number;
  };
  aiInsights: {
    priceInYearLow: boolean;
    likelyToGoOnSale: boolean;
    demandTrending: 'up' | 'down' | 'stable';
    recommendedAction: 'buy_now' | 'wait' | 'set_alert';
    similarItemsViewing: number;
  };
}

interface WishlistAnalytics {
  totalItems: number;
  totalValue: number;
  totalSavings: number;
  averageDiscount: number;
  priceAlertsActive: number;
  itemsOnSale: number;
}

export default function IntelligentWishlist() {
  const [wishlistItems, setWishlistItems] = useState<WishlistItem[]>([]);
  const [analytics, setAnalytics] = useState<WishlistAnalytics | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('added_date');
  const [filterBy, setFilterBy] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [selectedItems, setSelectedItems] = useState<string[]>([]);

  useEffect(() => {
    loadWishlistData();
  }, []);

  const loadWishlistData = async () => {
    setIsLoading(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const mockWishlistItems: WishlistItem[] = [
        {
          id: '1',
          productId: 'p1',
          name: 'PlayStation 5 Console',
          price: 499.99,
          originalPrice: 599.99,
          image: '/api/placeholder/300/200',
          category: 'Console',
          brand: 'Sony',
          rating: 4.8,
          availability: 'low_stock',
          addedAt: new Date('2024-07-01'),
          priceHistory: [
            { price: 599.99, date: new Date('2024-06-01') },
            { price: 549.99, date: new Date('2024-06-15') },
            { price: 499.99, date: new Date('2024-07-01') }
          ],
          notifications: {
            priceAlert: true,
            stockAlert: true,
            saleAlert: true,
            targetPrice: 450
          },
          aiInsights: {
            priceInYearLow: true,
            likelyToGoOnSale: false,
            demandTrending: 'up',
            recommendedAction: 'buy_now',
            similarItemsViewing: 1247
          }
        },
        {
          id: '2',
          productId: 'p2',
          name: 'FIFA 24 Standard Edition',
          price: 69.99,
          originalPrice: 79.99,
          image: '/api/placeholder/300/200',
          category: 'Giochi',
          brand: 'EA Sports',
          rating: 4.2,
          availability: 'in_stock',
          addedAt: new Date('2024-07-05'),
          priceHistory: [
            { price: 79.99, date: new Date('2024-06-20') },
            { price: 74.99, date: new Date('2024-06-25') },
            { price: 69.99, date: new Date('2024-07-05') }
          ],
          notifications: {
            priceAlert: true,
            stockAlert: false,
            saleAlert: true,
            targetPrice: 59.99
          },
          aiInsights: {
            priceInYearLow: false,
            likelyToGoOnSale: true,
            demandTrending: 'down',
            recommendedAction: 'wait',
            similarItemsViewing: 892
          }
        },
        {
          id: '3',
          productId: 'p3',
          name: 'Nintendo Switch OLED',
          price: 349.99,
          originalPrice: 349.99,
          image: '/api/placeholder/300/200',
          category: 'Console',
          brand: 'Nintendo',
          rating: 4.7,
          availability: 'out_of_stock',
          addedAt: new Date('2024-07-10'),
          priceHistory: [
            { price: 349.99, date: new Date('2024-07-01') },
            { price: 349.99, date: new Date('2024-07-10') }
          ],
          notifications: {
            priceAlert: false,
            stockAlert: true,
            saleAlert: false
          },
          aiInsights: {
            priceInYearLow: false,
            likelyToGoOnSale: false,
            demandTrending: 'stable',
            recommendedAction: 'set_alert',
            similarItemsViewing: 634
          }
        }
      ];

      setWishlistItems(mockWishlistItems);

      // Calculate analytics
      const mockAnalytics: WishlistAnalytics = {
        totalItems: mockWishlistItems.length,
        totalValue: mockWishlistItems.reduce((sum, item) => sum + item.price, 0),
        totalSavings: mockWishlistItems.reduce((sum, item) => sum + (item.originalPrice - item.price), 0),
        averageDiscount: mockWishlistItems.reduce((sum, item) => 
          sum + ((item.originalPrice - item.price) / item.originalPrice * 100), 0) / mockWishlistItems.length,
        priceAlertsActive: mockWishlistItems.filter(item => item.notifications.priceAlert).length,
        itemsOnSale: mockWishlistItems.filter(item => item.price < item.originalPrice).length
      };

      setAnalytics(mockAnalytics);
    } catch (error) {
      console.error('Error loading wishlist:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const removeFromWishlist = (itemId: string) => {
    setWishlistItems(prev => prev.filter(item => item.id !== itemId));
  };

  const toggleNotification = (itemId: string, type: keyof WishlistItem['notifications']) => {
    setWishlistItems(prev => prev.map(item => 
      item.id === itemId 
        ? {
            ...item,
            notifications: {
              ...item.notifications,
              [type]: !item.notifications[type]
            }
          }
        : item
    ));
  };

  const addToCart = (itemId: string) => {
    const item = wishlistItems.find(i => i.id === itemId);
    if (item && item.availability === 'in_stock') {
      console.log('Adding to cart:', item.name);
      // Here you would integrate with your cart system
    }
  };

  const shareWishlist = () => {
    const url = `${window.location.origin}/wishlist/share/${Date.now()}`;
    navigator.clipboard.writeText(url);
    // Show success message
  };

  const getAvailabilityColor = (availability: WishlistItem['availability']) => {
    switch (availability) {
      case 'in_stock': return 'bg-green-100 text-green-800';
      case 'low_stock': return 'bg-yellow-100 text-yellow-800';
      case 'out_of_stock': return 'bg-red-100 text-red-800';
      case 'pre_order': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getAvailabilityText = (availability: WishlistItem['availability']) => {
    switch (availability) {
      case 'in_stock': return 'Disponibile';
      case 'low_stock': return 'Scorte limitate';
      case 'out_of_stock': return 'Esaurito';
      case 'pre_order': return 'Pre-ordine';
      default: return 'N/A';
    }
  };

  const getActionColor = (action: WishlistItem['aiInsights']['recommendedAction']) => {
    switch (action) {
      case 'buy_now': return 'bg-green-500 text-white';
      case 'wait': return 'bg-yellow-500 text-white';
      case 'set_alert': return 'bg-blue-500 text-white';
      default: return 'bg-gray-500 text-white';
    }
  };

  const getActionText = (action: WishlistItem['aiInsights']['recommendedAction']) => {
    switch (action) {
      case 'buy_now': return 'Compra Ora';
      case 'wait': return 'Aspetta';
      case 'set_alert': return 'Imposta Alert';
      default: return 'N/A';
    }
  };

  const filteredAndSortedItems = wishlistItems
    .filter(item => {
      if (selectedCategory !== 'all' && item.category !== selectedCategory) return false;
      if (searchQuery && !item.name.toLowerCase().includes(searchQuery.toLowerCase())) return false;
      
      switch (filterBy) {
        case 'on_sale': return item.price < item.originalPrice;
        case 'in_stock': return item.availability === 'in_stock';
        case 'price_alerts': return item.notifications.priceAlert;
        case 'buy_now': return item.aiInsights.recommendedAction === 'buy_now';
        default: return true;
      }
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'price_low': return a.price - b.price;
        case 'price_high': return b.price - a.price;
        case 'name': return a.name.localeCompare(b.name);
        case 'discount': return (b.originalPrice - b.price) - (a.originalPrice - a.price);
        case 'rating': return b.rating - a.rating;
        case 'added_date': 
        default: return new Date(b.addedAt).getTime() - new Date(a.addedAt).getTime();
      }
    });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin h-12 w-12 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-600">Caricamento wishlist...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
              <Heart className="h-8 w-8 text-red-500" />
              La Mia Wishlist
            </h1>
            <p className="text-gray-600 mt-1">Lista desideri intelligente con AI e alert prezzi</p>
          </div>

          <div className="flex items-center gap-3">
            <Button variant="outline" onClick={shareWishlist}>
              <Share2 className="h-4 w-4 mr-2" />
              Condividi
            </Button>
            <Button>
              <Gift className="h-4 w-4 mr-2" />
              Crea Regalo
            </Button>
          </div>
        </div>

        {/* Analytics Cards */}
        {analytics && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Totale Articoli</p>
                    <p className="text-2xl font-bold text-gray-900">{analytics.totalItems}</p>
                  </div>
                  <Heart className="h-8 w-8 text-red-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Valore Totale</p>
                    <p className="text-2xl font-bold text-gray-900">€{analytics.totalValue.toFixed(2)}</p>
                  </div>
                  <DollarSign className="h-8 w-8 text-green-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Risparmi Totali</p>
                    <p className="text-2xl font-bold text-green-600">€{analytics.totalSavings.toFixed(2)}</p>
                  </div>
                  <TrendingDown className="h-8 w-8 text-green-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Alert Attivi</p>
                    <p className="text-2xl font-bold text-blue-600">{analytics.priceAlertsActive}</p>
                  </div>
                  <Bell className="h-8 w-8 text-blue-500" />
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Filters and Search */}
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="flex-1">
                <Input
                  placeholder="Cerca nella wishlist..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full"
                />
              </div>
              
              <div className="flex gap-2">
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Categoria" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tutte</SelectItem>
                    <SelectItem value="Console">Console</SelectItem>
                    <SelectItem value="Giochi">Giochi</SelectItem>
                    <SelectItem value="Accessori">Accessori</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={filterBy} onValueChange={setFilterBy}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Filtro" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tutti</SelectItem>
                    <SelectItem value="on_sale">In Offerta</SelectItem>
                    <SelectItem value="in_stock">Disponibili</SelectItem>
                    <SelectItem value="price_alerts">Con Alert</SelectItem>
                    <SelectItem value="buy_now">Compra Ora</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Ordina" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="added_date">Data Aggiunta</SelectItem>
                    <SelectItem value="price_low">Prezzo ↑</SelectItem>
                    <SelectItem value="price_high">Prezzo ↓</SelectItem>
                    <SelectItem value="name">Nome</SelectItem>
                    <SelectItem value="discount">Sconto</SelectItem>
                    <SelectItem value="rating">Valutazione</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Wishlist Items */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          <AnimatePresence>
            {filteredAndSortedItems.map((item, index) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="overflow-hidden hover:shadow-lg transition-shadow duration-200">
                  <div className="relative">
                    <img 
                      src={item.image} 
                      alt={item.name}
                      className="w-full h-48 object-cover"
                    />
                    
                    {/* Price Change Indicator */}
                    {item.price < item.originalPrice && (
                      <div className="absolute top-2 left-2">
                        <Badge className="bg-red-500 text-white">
                          -{Math.round(((item.originalPrice - item.price) / item.originalPrice) * 100)}%
                        </Badge>
                      </div>
                    )}

                    {/* AI Insights Badge */}
                    {item.aiInsights.priceInYearLow && (
                      <div className="absolute top-2 right-2">
                        <Badge className="bg-green-500 text-white">
                          <Sparkles className="h-3 w-3 mr-1" />
                          Prezzo Minimo
                        </Badge>
                      </div>
                    )}

                    {/* Remove Button */}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeFromWishlist(item.id)}
                      className="absolute top-2 right-2 bg-white/80 hover:bg-white"
                    >
                      <HeartOff className="h-4 w-4 text-red-500" />
                    </Button>
                  </div>

                  <CardContent className="p-4 space-y-3">
                    <div>
                      <h3 className="font-semibold text-gray-900 line-clamp-2">{item.name}</h3>
                      <p className="text-sm text-gray-600">{item.brand} • {item.category}</p>
                    </div>

                    {/* Rating */}
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      <span className="text-sm font-medium">{item.rating}</span>
                      <span className="text-xs text-gray-500">({item.aiInsights.similarItemsViewing} visualizzazioni)</span>
                    </div>

                    {/* Price */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-2xl font-bold text-gray-900">€{item.price}</span>
                        {item.price < item.originalPrice && (
                          <span className="text-sm text-gray-500 line-through">€{item.originalPrice}</span>
                        )}
                      </div>
                      <Badge className={getAvailabilityColor(item.availability)}>
                        {getAvailabilityText(item.availability)}
                      </Badge>
                    </div>

                    {/* AI Recommendation */}
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-blue-800">AI Raccomandazione</span>
                        <Badge className={getActionColor(item.aiInsights.recommendedAction)}>
                          {getActionText(item.aiInsights.recommendedAction)}
                        </Badge>
                      </div>
                      
                      <div className="space-y-1 text-xs text-blue-700">
                        {item.aiInsights.likelyToGoOnSale && (
                          <div className="flex items-center gap-1">
                            <Tag className="h-3 w-3" />
                            <span>Probabile sconto in arrivo</span>
                          </div>
                        )}
                        <div className="flex items-center gap-1">
                          {item.aiInsights.demandTrending === 'up' ? (
                            <TrendingUp className="h-3 w-3 text-green-600" />
                          ) : item.aiInsights.demandTrending === 'down' ? (
                            <TrendingDown className="h-3 w-3 text-red-600" />
                          ) : (
                            <BarChart3 className="h-3 w-3" />
                          )}
                          <span>Domanda: {item.aiInsights.demandTrending === 'up' ? 'Crescente' : 
                                         item.aiInsights.demandTrending === 'down' ? 'Calante' : 'Stabile'}</span>
                        </div>
                      </div>
                    </div>

                    {/* Price History */}
                    {item.priceHistory.length > 1 && (
                      <div className="space-y-2">
                        <span className="text-sm font-medium text-gray-700">Andamento Prezzo</span>
                        <div className="h-16 bg-gray-100 rounded flex items-end justify-between p-2">
                          {item.priceHistory.map((point, idx) => (
                            <div
                              key={idx}
                              className="bg-blue-500 rounded-t"
                              style={{
                                height: `${(point.price / Math.max(...item.priceHistory.map(p => p.price))) * 100}%`,
                                width: `${100 / item.priceHistory.length - 2}%`
                              }}
                            />
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Notifications */}
                    <div className="space-y-2">
                      <span className="text-sm font-medium text-gray-700">Notifiche</span>
                      <div className="grid grid-cols-2 gap-2">
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-gray-600">Alert Prezzo</span>
                          <Switch
                            checked={item.notifications.priceAlert}
                            onCheckedChange={() => toggleNotification(item.id, 'priceAlert')}
                          />
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-gray-600">Alert Stock</span>
                          <Switch
                            checked={item.notifications.stockAlert}
                            onCheckedChange={() => toggleNotification(item.id, 'stockAlert')}
                          />
                        </div>
                      </div>
                      
                      {item.notifications.targetPrice && (
                        <div className="text-xs text-gray-600">
                          Target: €{item.notifications.targetPrice}
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2 pt-2">
                      <Button
                        onClick={() => addToCart(item.id)}
                        disabled={item.availability !== 'in_stock'}
                        className="flex-1"
                      >
                        <ShoppingCart className="h-4 w-4 mr-2" />
                        {item.availability === 'in_stock' ? 'Aggiungi al Carrello' : 'Non Disponibile'}
                      </Button>
                      <Button variant="outline" size="sm">
                        <Eye className="h-4 w-4" />
                      </Button>
                    </div>

                    {/* Added Date */}
                    <div className="text-xs text-gray-500 flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      Aggiunto il {item.addedAt.toLocaleDateString('it-IT')}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Empty State */}
        {filteredAndSortedItems.length === 0 && (
          <Card>
            <CardContent className="p-8 text-center">
              <Heart className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Nessun articolo trovato</h3>
              <p className="text-gray-600 mb-4">
                {searchQuery || selectedCategory !== 'all' || filterBy !== 'all' 
                  ? 'Prova a modificare i filtri di ricerca.'
                  : 'La tua wishlist è vuota. Inizia ad aggiungere i tuoi prodotti preferiti!'
                }
              </p>
              <Button onClick={() => {
                setSearchQuery('');
                setSelectedCategory('all');
                setFilterBy('all');
              }}>
                Cancella Filtri
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}