import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { 
  Filter, 
  ChevronDown, 
  ChevronUp, 
  X, 
  Star, 
  Euro, 
  Package, 
  Grid3x3,
  SlidersHorizontal,
  RefreshCw
} from 'lucide-react';

interface Category {
  id: number;
  name: string;
  description: string;
  isActive: boolean;
}

interface FilterState {
  categories: string[];
  priceRange: [number, number];
  rating: number;
  availability: 'all' | 'in_stock' | 'out_of_stock';
  sortBy: 'name' | 'price_asc' | 'price_desc' | 'rating' | 'newest';
  searchQuery: string;
}

interface ProductFiltersProps {
  onFiltersChange: (filters: FilterState) => void;
  initialFilters?: Partial<FilterState>;
}

export function ProductFilters({ onFiltersChange, initialFilters }: ProductFiltersProps) {
  const [filters, setFilters] = useState<FilterState>({
    categories: [],
    priceRange: [0, 1000],
    rating: 0,
    availability: 'all',
    sortBy: 'name',
    searchQuery: '',
    ...initialFilters,
  });

  const [priceInput, setPriceInput] = useState({
    min: filters.priceRange[0],
    max: filters.priceRange[1],
  });

  const [expandedSections, setExpandedSections] = useState({
    categories: true,
    price: true,
    rating: true,
    availability: true,
    sort: true,
  });

  // Fetch categories
  const { data: categories = [] } = useQuery<Category[]>({
    queryKey: ['/api/categories'],
    queryFn: async () => {
      const response = await fetch('/api/categories');
      if (!response.ok) throw new Error('Failed to fetch categories');
      return response.json();
    },
  });

  // Update filters when they change
  useEffect(() => {
    onFiltersChange(filters);
  }, [filters, onFiltersChange]);

  const updateFilters = (key: keyof FilterState, value: any) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
    }));
  };

  const toggleCategory = (categoryName: string) => {
    const newCategories = filters.categories.includes(categoryName)
      ? filters.categories.filter(c => c !== categoryName)
      : [...filters.categories, categoryName];
    
    updateFilters('categories', newCategories);
  };

  const handlePriceRangeChange = (value: [number, number]) => {
    updateFilters('priceRange', value);
    setPriceInput({ min: value[0], max: value[1] });
  };

  const handlePriceInputChange = (type: 'min' | 'max', value: string) => {
    const numValue = parseFloat(value) || 0;
    const newInput = { ...priceInput, [type]: numValue };
    setPriceInput(newInput);
    
    if (type === 'min' && numValue <= priceInput.max) {
      updateFilters('priceRange', [numValue, priceInput.max]);
    } else if (type === 'max' && numValue >= priceInput.min) {
      updateFilters('priceRange', [priceInput.min, numValue]);
    }
  };

  const clearFilters = () => {
    const defaultFilters: FilterState = {
      categories: [],
      priceRange: [0, 1000],
      rating: 0,
      availability: 'all',
      sortBy: 'name',
      searchQuery: '',
    };
    setFilters(defaultFilters);
    setPriceInput({ min: 0, max: 1000 });
  };

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const getActiveFiltersCount = () => {
    let count = 0;
    if (filters.categories.length > 0) count++;
    if (filters.priceRange[0] > 0 || filters.priceRange[1] < 1000) count++;
    if (filters.rating > 0) count++;
    if (filters.availability !== 'all') count++;
    if (filters.searchQuery.trim()) count++;
    return count;
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="w-5 h-5" />
            <span>Filtri</span>
            {getActiveFiltersCount() > 0 && (
              <Badge variant="secondary">{getActiveFiltersCount()}</Badge>
            )}
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={clearFilters}
            className="text-red-500 hover:text-red-600"
          >
            <RefreshCw className="w-4 h-4 mr-1" />
            Reset
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Search */}
        <div className="space-y-2">
          <Label className="text-sm font-medium">Ricerca</Label>
          <Input
            placeholder="Cerca prodotti..."
            value={filters.searchQuery}
            onChange={(e) => updateFilters('searchQuery', e.target.value)}
            className="w-full"
          />
        </div>

        {/* Sort */}
        <Collapsible
          open={expandedSections.sort}
          onOpenChange={() => toggleSection('sort')}
        >
          <CollapsibleTrigger className="w-full">
            <div className="flex items-center justify-between w-full">
              <div className="flex items-center gap-2">
                <Grid3x3 className="w-4 h-4" />
                <Label className="text-sm font-medium">Ordina per</Label>
              </div>
              {expandedSections.sort ? (
                <ChevronUp className="w-4 h-4" />
              ) : (
                <ChevronDown className="w-4 h-4" />
              )}
            </div>
          </CollapsibleTrigger>
          <CollapsibleContent className="space-y-2 mt-2">
            <Select
              value={filters.sortBy}
              onValueChange={(value) => updateFilters('sortBy', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Seleziona ordinamento" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="name">Nome (A-Z)</SelectItem>
                <SelectItem value="price_asc">Prezzo (crescente)</SelectItem>
                <SelectItem value="price_desc">Prezzo (decrescente)</SelectItem>
                <SelectItem value="rating">Valutazione</SelectItem>
                <SelectItem value="newest">Più recenti</SelectItem>
              </SelectContent>
            </Select>
          </CollapsibleContent>
        </Collapsible>

        {/* Categories */}
        <Collapsible
          open={expandedSections.categories}
          onOpenChange={() => toggleSection('categories')}
        >
          <CollapsibleTrigger className="w-full">
            <div className="flex items-center justify-between w-full">
              <div className="flex items-center gap-2">
                <Package className="w-4 h-4" />
                <Label className="text-sm font-medium">Categorie</Label>
                {filters.categories.length > 0 && (
                  <Badge variant="secondary">{filters.categories.length}</Badge>
                )}
              </div>
              {expandedSections.categories ? (
                <ChevronUp className="w-4 h-4" />
              ) : (
                <ChevronDown className="w-4 h-4" />
              )}
            </div>
          </CollapsibleTrigger>
          <CollapsibleContent className="space-y-2 mt-2">
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {categories.map((category) => (
                <div key={category.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={`category-${category.id}`}
                    checked={filters.categories.includes(category.name)}
                    onCheckedChange={() => toggleCategory(category.name)}
                  />
                  <Label
                    htmlFor={`category-${category.id}`}
                    className="text-sm cursor-pointer flex-1"
                  >
                    {category.name}
                  </Label>
                </div>
              ))}
            </div>
          </CollapsibleContent>
        </Collapsible>

        {/* Price Range */}
        <Collapsible
          open={expandedSections.price}
          onOpenChange={() => toggleSection('price')}
        >
          <CollapsibleTrigger className="w-full">
            <div className="flex items-center justify-between w-full">
              <div className="flex items-center gap-2">
                <Euro className="w-4 h-4" />
                <Label className="text-sm font-medium">Fascia di prezzo</Label>
              </div>
              {expandedSections.price ? (
                <ChevronUp className="w-4 h-4" />
              ) : (
                <ChevronDown className="w-4 h-4" />
              )}
            </div>
          </CollapsibleTrigger>
          <CollapsibleContent className="space-y-4 mt-2">
            <div className="px-2">
              <Slider
                value={filters.priceRange}
                onValueChange={handlePriceRangeChange}
                max={1000}
                min={0}
                step={10}
                className="w-full"
              />
            </div>
            <div className="flex gap-2">
              <div className="flex-1">
                <Label htmlFor="min-price" className="text-xs">Min</Label>
                <Input
                  id="min-price"
                  type="number"
                  value={priceInput.min}
                  onChange={(e) => handlePriceInputChange('min', e.target.value)}
                  className="text-sm"
                />
              </div>
              <div className="flex-1">
                <Label htmlFor="max-price" className="text-xs">Max</Label>
                <Input
                  id="max-price"
                  type="number"
                  value={priceInput.max}
                  onChange={(e) => handlePriceInputChange('max', e.target.value)}
                  className="text-sm"
                />
              </div>
            </div>
            <div className="text-xs text-gray-500 text-center">
              €{filters.priceRange[0]} - €{filters.priceRange[1]}
            </div>
          </CollapsibleContent>
        </Collapsible>

        {/* Rating */}
        <Collapsible
          open={expandedSections.rating}
          onOpenChange={() => toggleSection('rating')}
        >
          <CollapsibleTrigger className="w-full">
            <div className="flex items-center justify-between w-full">
              <div className="flex items-center gap-2">
                <Star className="w-4 h-4" />
                <Label className="text-sm font-medium">Valutazione minima</Label>
              </div>
              {expandedSections.rating ? (
                <ChevronUp className="w-4 h-4" />
              ) : (
                <ChevronDown className="w-4 h-4" />
              )}
            </div>
          </CollapsibleTrigger>
          <CollapsibleContent className="space-y-2 mt-2">
            <div className="space-y-2">
              {[0, 1, 2, 3, 4, 5].map((rating) => (
                <div key={rating} className="flex items-center space-x-2">
                  <Checkbox
                    id={`rating-${rating}`}
                    checked={filters.rating === rating}
                    onCheckedChange={() => updateFilters('rating', rating)}
                  />
                  <Label
                    htmlFor={`rating-${rating}`}
                    className="text-sm cursor-pointer flex-1 flex items-center gap-1"
                  >
                    {rating === 0 ? (
                      'Tutte le valutazioni'
                    ) : (
                      <>
                        {[...Array(rating)].map((_, i) => (
                          <Star key={i} className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                        ))}
                        e oltre
                      </>
                    )}
                  </Label>
                </div>
              ))}
            </div>
          </CollapsibleContent>
        </Collapsible>

        {/* Availability */}
        <Collapsible
          open={expandedSections.availability}
          onOpenChange={() => toggleSection('availability')}
        >
          <CollapsibleTrigger className="w-full">
            <div className="flex items-center justify-between w-full">
              <div className="flex items-center gap-2">
                <Package className="w-4 h-4" />
                <Label className="text-sm font-medium">Disponibilità</Label>
              </div>
              {expandedSections.availability ? (
                <ChevronUp className="w-4 h-4" />
              ) : (
                <ChevronDown className="w-4 h-4" />
              )}
            </div>
          </CollapsibleTrigger>
          <CollapsibleContent className="space-y-2 mt-2">
            <div className="space-y-2">
              {[
                { value: 'all', label: 'Tutti i prodotti' },
                { value: 'in_stock', label: 'Disponibili' },
                { value: 'out_of_stock', label: 'Esauriti' },
              ].map((option) => (
                <div key={option.value} className="flex items-center space-x-2">
                  <Checkbox
                    id={`availability-${option.value}`}
                    checked={filters.availability === option.value}
                    onCheckedChange={() => updateFilters('availability', option.value)}
                  />
                  <Label
                    htmlFor={`availability-${option.value}`}
                    className="text-sm cursor-pointer flex-1"
                  >
                    {option.label}
                  </Label>
                </div>
              ))}
            </div>
          </CollapsibleContent>
        </Collapsible>

        {/* Applied Filters */}
        {getActiveFiltersCount() > 0 && (
          <div className="space-y-2">
            <Label className="text-sm font-medium">Filtri applicati</Label>
            <div className="flex flex-wrap gap-2">
              {filters.categories.map((category) => (
                <Badge
                  key={category}
                  variant="secondary"
                  className="cursor-pointer"
                  onClick={() => toggleCategory(category)}
                >
                  {category}
                  <X className="w-3 h-3 ml-1" />
                </Badge>
              ))}
              {(filters.priceRange[0] > 0 || filters.priceRange[1] < 1000) && (
                <Badge
                  variant="secondary"
                  className="cursor-pointer"
                  onClick={() => updateFilters('priceRange', [0, 1000])}
                >
                  €{filters.priceRange[0]} - €{filters.priceRange[1]}
                  <X className="w-3 h-3 ml-1" />
                </Badge>
              )}
              {filters.rating > 0 && (
                <Badge
                  variant="secondary"
                  className="cursor-pointer"
                  onClick={() => updateFilters('rating', 0)}
                >
                  {filters.rating}+ stelle
                  <X className="w-3 h-3 ml-1" />
                </Badge>
              )}
              {filters.availability !== 'all' && (
                <Badge
                  variant="secondary"
                  className="cursor-pointer"
                  onClick={() => updateFilters('availability', 'all')}
                >
                  {filters.availability === 'in_stock' ? 'Disponibili' : 'Esauriti'}
                  <X className="w-3 h-3 ml-1" />
                </Badge>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}