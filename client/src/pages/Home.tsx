import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { ProductCard } from '@/components/ProductCard';
import { CartSlideout } from '@/components/CartSlideout';
import { CheckoutModal } from '@/components/CheckoutModal';
import { Hero } from '@/components/Hero';

import { LoadingScreen } from '@/components/LoadingScreen';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Search, 
  Filter, 
  Star, 
  TrendingUp, 
  Users, 
  Package, 
  ShoppingCart,
  Heart,
  Eye,
  Zap,
  Award,
  Crown,
  Gamepad2,
  Sparkles
} from 'lucide-react';
import type { Product } from '@shared/schema';

const featuredCategories = [
  { 
    name: 'Azione', 
    icon: Zap, 
    color: 'bg-red-500', 
    count: 15,
    description: 'Giochi d\'azione adrenalinici'
  },
  { 
    name: 'Avventura', 
    icon: Award, 
    color: 'bg-blue-500', 
    count: 12,
    description: 'Epiche avventure da vivere'
  },
  { 
    name: 'RPG', 
    icon: Crown, 
    color: 'bg-purple-500', 
    count: 8,
    description: 'Giochi di ruolo immersivi'
  },
  { 
    name: 'Sport', 
    icon: Gamepad2, 
    color: 'bg-green-500', 
    count: 10,
    description: 'Simulazioni sportive realistiche'
  },
];

const stats = [
  { label: 'Giochi Disponibili', value: '1,200+', icon: Package, color: 'text-blue-600' },
  { label: 'Utenti Attivi', value: '50,000+', icon: Users, color: 'text-green-600' },
  { label: 'Valutazioni Positive', value: '98%', icon: Star, color: 'text-yellow-600' },
  { label: 'Vendite Oggi', value: '240+', icon: TrendingUp, color: 'text-purple-600' },
];

export default function Home() {
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState('featured');
  const [showFilters, setShowFilters] = useState(false);

  const { data: products, isLoading } = useQuery<Product[]>({
    queryKey: ['/api/products'],
  });

  const { data: categories } = useQuery<any[]>({
    queryKey: ['/api/categories'],
  });

  if (isLoading) {
    return <LoadingScreen />;
  }

  const filteredProducts = products?.filter((product: Product) => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;
    return matchesSearch && matchesCategory && product.isActive;
  }) || [];

  const sortedProducts = [...filteredProducts].sort((a, b) => {
    switch (sortBy) {
      case 'price-low':
        return Number(a.price) - Number(b.price);
      case 'price-high':
        return Number(b.price) - Number(a.price);
      case 'name':
        return a.name.localeCompare(b.name);
      default:
        return 0;
    }
  });

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
      },
    },
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <Hero />
      
      {/* Statistics Section */}
      <section className="py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12"
          >
            {stats.map((stat, index) => (
              <Card key={index} className="text-center bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-lg">
                <CardContent className="p-6">
                  <div className="flex items-center justify-center mb-2">
                    <div className="p-3 bg-gray-100 dark:bg-gray-700 rounded-full">
                      <stat.icon className={`w-6 h-6 ${stat.color}`} />
                    </div>
                  </div>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                    {stat.value}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {stat.label}
                  </p>
                </CardContent>
              </Card>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Featured Categories */}
      <section className="py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              Categorie Popolari
            </h2>
            <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Scopri i migliori giochi nelle categorie più amate dai nostri utenti
            </p>
          </motion.div>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
          >
            {featuredCategories.map((category, index) => (
              <motion.div key={index} variants={itemVariants}>
                <Card className="group cursor-pointer hover:shadow-xl transition-all duration-300 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 overflow-hidden">
                  <CardContent className="p-6 text-center">
                    <div className={`w-16 h-16 ${category.color} rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300`}>
                      <category.icon className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                      {category.name}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 mb-3">
                      {category.description}
                    </p>
                    <Badge variant="secondary" className="bg-gray-100 dark:bg-gray-700">
                      {category.count} giochi
                    </Badge>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Products Section */}
      <section className="py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-8"
          >
            <div>
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                Tutti i Giochi
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mb-6 lg:mb-0">
                Esplora la nostra collezione completa di giochi
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4 w-full lg:w-auto">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Cerca giochi..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 min-w-[300px]"
                />
              </div>
              
              <Button
                variant="outline"
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-2"
              >
                <Filter className="w-4 h-4" />
                Filtri
              </Button>
            </div>
          </motion.div>

          {showFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="mb-8"
            >
              <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0">
                <CardContent className="p-6">
                  <div className="flex flex-wrap gap-4">
                    <div className="flex-1 min-w-[200px]">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Categoria
                      </label>
                      <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                        <SelectTrigger>
                          <SelectValue placeholder="Seleziona categoria" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">Tutte le categorie</SelectItem>
                          {categories?.map((category: any) => (
                            <SelectItem key={category.id} value={category.name}>
                              {category.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="flex-1 min-w-[200px]">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Ordina per
                      </label>
                      <Select value={sortBy} onValueChange={setSortBy}>
                        <SelectTrigger>
                          <SelectValue placeholder="Ordina per" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="featured">In evidenza</SelectItem>
                          <SelectItem value="price-low">Prezzo: dal più basso</SelectItem>
                          <SelectItem value="price-high">Prezzo: dal più alto</SelectItem>
                          <SelectItem value="name">Nome A-Z</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          <Tabs defaultValue="grid" className="w-full">
            <TabsList className="grid w-full max-w-md grid-cols-2 mb-8">
              <TabsTrigger value="grid">Griglia</TabsTrigger>
              <TabsTrigger value="list">Lista</TabsTrigger>
            </TabsList>

            <TabsContent value="grid" className="space-y-4">
              <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
              >
                {sortedProducts.map((product, index) => (
                  <motion.div key={product.id} variants={itemVariants}>
                    <ProductCard product={product} index={index} />
                  </motion.div>
                ))}
              </motion.div>
            </TabsContent>

            <TabsContent value="list" className="space-y-4">
              <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="space-y-4"
              >
                {sortedProducts.map((product, index) => (
                  <motion.div key={product.id} variants={itemVariants}>
                    <Card className="group hover:shadow-lg transition-all duration-300 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0">
                      <CardContent className="p-6">
                        <div className="flex items-center gap-6">
                          <div className="w-24 h-24 bg-gray-200 dark:bg-gray-700 rounded-lg overflow-hidden shrink-0">
                            {product.imageUrl ? (
                              <img 
                                src={product.imageUrl} 
                                alt={product.name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <Package className="w-8 h-8 text-gray-400" />
                              </div>
                            )}
                          </div>
                          
                          <div className="flex-1">
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                              {product.name}
                            </h3>
                            <p className="text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
                              {product.description}
                            </p>
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-4">
                                <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                                  €{product.price}
                                </span>
                                <Badge variant="secondary">
                                  {product.category}
                                </Badge>
                              </div>
                              
                              <div className="flex items-center gap-2">
                                <Button variant="outline" size="sm">
                                  <Heart className="w-4 h-4" />
                                </Button>
                                <Button variant="outline" size="sm">
                                  <Eye className="w-4 h-4" />
                                </Button>
                                <Button size="sm">
                                  <ShoppingCart className="w-4 h-4 mr-2" />
                                  Aggiungi
                                </Button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </motion.div>
            </TabsContent>
          </Tabs>

          {sortedProducts.length === 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-center py-12"
            >
              <div className="w-24 h-24 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-6">
                <Search className="w-12 h-12 text-gray-400" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                Nessun gioco trovato
              </h3>
              <p className="text-gray-600 dark:text-gray-400 max-w-md mx-auto">
                Prova a modificare i filtri di ricerca o le parole chiave per trovare i giochi che stai cercando.
              </p>
            </motion.div>
          )}
        </div>
      </section>

      <CartSlideout 
        onCheckout={() => {
          setIsCartOpen(false);
          setIsCheckoutOpen(true);
        }}
      />
      
      <CheckoutModal 
        isOpen={isCheckoutOpen} 
        onClose={() => setIsCheckoutOpen(false)} 
      />
    </div>
  );
}