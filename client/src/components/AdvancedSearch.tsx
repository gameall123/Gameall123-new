import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Filter, X, Mic, MicOff, Sparkles, TrendingUp, Clock, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { useDebounce } from '@/hooks/useDebounce';

interface SearchSuggestion {
  id: string;
  text: string;
  type: 'product' | 'category' | 'brand' | 'trending';
  count?: number;
  image?: string;
}

interface SearchFilter {
  id: string;
  name: string;
  type: 'category' | 'price' | 'rating' | 'brand' | 'platform';
  options: Array<{
    value: string;
    label: string;
    count?: number;
  }>;
}

interface AdvancedSearchProps {
  onSearch: (query: string, filters: Record<string, string[]>) => void;
  onSuggestionSelect: (suggestion: SearchSuggestion) => void;
  className?: string;
}

export default function AdvancedSearch({ 
  onSearch, 
  onSuggestionSelect, 
  className = '' 
}: AdvancedSearchProps) {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([]);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [trendingSearches, setTrendingSearches] = useState<string[]>([]);
  const [filters, setFilters] = useState<Record<string, string[]>>({});
  const [isVoiceActive, setIsVoiceActive] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const recognition = useRef<any>(null);
  
  const debouncedQuery = useDebounce(query, 300);

  // Search filters configuration
  const searchFilters: SearchFilter[] = [
    {
      id: 'category',
      name: 'Categoria',
      type: 'category',
      options: [
        { value: 'games', label: 'Giochi', count: 245 },
        { value: 'consoles', label: 'Console', count: 67 },
        { value: 'accessories', label: 'Accessori', count: 123 },
        { value: 'merchandise', label: 'Merchandise', count: 89 }
      ]
    },
    {
      id: 'price',
      name: 'Prezzo',
      type: 'price',
      options: [
        { value: '0-20', label: 'Sotto €20', count: 156 },
        { value: '20-50', label: '€20 - €50', count: 234 },
        { value: '50-100', label: '€50 - €100', count: 178 },
        { value: '100+', label: 'Oltre €100', count: 98 }
      ]
    },
    {
      id: 'rating',
      name: 'Valutazione',
      type: 'rating',
      options: [
        { value: '5', label: '5 stelle', count: 89 },
        { value: '4+', label: '4+ stelle', count: 234 },
        { value: '3+', label: '3+ stelle', count: 345 },
        { value: '2+', label: '2+ stelle', count: 456 }
      ]
    },
    {
      id: 'platform',
      name: 'Piattaforma',
      type: 'platform',
      options: [
        { value: 'ps5', label: 'PlayStation 5', count: 123 },
        { value: 'xbox', label: 'Xbox Series', count: 98 },
        { value: 'switch', label: 'Nintendo Switch', count: 156 },
        { value: 'pc', label: 'PC', count: 234 }
      ]
    }
  ];

  // Initialize voice recognition
  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.webkitSpeechRecognition || window.SpeechRecognition;
      recognition.current = new SpeechRecognition();
      recognition.current.continuous = false;
      recognition.current.interimResults = false;
      recognition.current.lang = 'it-IT';

      recognition.current.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setQuery(transcript);
        setIsVoiceActive(false);
      };

      recognition.current.onerror = () => {
        setIsVoiceActive(false);
      };

      recognition.current.onend = () => {
        setIsVoiceActive(false);
      };
    }
  }, []);

  // Load initial data
  useEffect(() => {
    const loadInitialData = () => {
      const recent = JSON.parse(localStorage.getItem('gameall-recent-searches') || '[]');
      const trending = [
        'FIFA 24', 'Call of Duty', 'PlayStation 5', 'Nintendo Switch', 
        'Steam Deck', 'Xbox Game Pass', 'Elden Ring', 'Zelda'
      ];
      
      setRecentSearches(recent);
      setTrendingSearches(trending);
    };

    loadInitialData();
  }, []);

  // Fetch suggestions
  useEffect(() => {
    if (debouncedQuery.length >= 2) {
      fetchSuggestions(debouncedQuery);
    } else {
      setSuggestions([]);
    }
  }, [debouncedQuery]);

  const fetchSuggestions = async (searchQuery: string) => {
    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 300));
      
      const mockSuggestions: SearchSuggestion[] = [
        {
          id: '1',
          text: `${searchQuery} - PlayStation 5`,
          type: 'product',
          count: 23,
          image: '/api/placeholder/40/40'
        },
        {
          id: '2',
          text: `${searchQuery} - Nintendo Switch`,
          type: 'product',
          count: 18
        },
        {
          id: '3',
          text: `Categoria: ${searchQuery}`,
          type: 'category',
          count: 156
        },
        {
          id: '4',
          text: `Brand: ${searchQuery}`,
          type: 'brand',
          count: 45
        }
      ];
      
      setSuggestions(mockSuggestions);
    } catch (error) {
      console.error('Error fetching suggestions:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = useCallback(() => {
    if (query.trim()) {
      onSearch(query, filters);
      
      // Save to recent searches
      const updatedRecent = [query, ...recentSearches.filter(s => s !== query)].slice(0, 5);
      setRecentSearches(updatedRecent);
      localStorage.setItem('gameall-recent-searches', JSON.stringify(updatedRecent));
      
      setIsOpen(false);
    }
  }, [query, filters, onSearch, recentSearches]);

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    } else if (e.key === 'Escape') {
      setIsOpen(false);
    }
  };

  const startVoiceSearch = () => {
    if (recognition.current) {
      setIsVoiceActive(true);
      recognition.current.start();
    }
  };

  const stopVoiceSearch = () => {
    if (recognition.current) {
      recognition.current.stop();
      setIsVoiceActive(false);
    }
  };

  const toggleFilter = (filterId: string, value: string) => {
    setFilters(prev => {
      const currentValues = prev[filterId] || [];
      const newValues = currentValues.includes(value)
        ? currentValues.filter(v => v !== value)
        : [...currentValues, value];
      
      return {
        ...prev,
        [filterId]: newValues
      };
    });
  };

  const clearFilters = () => {
    setFilters({});
  };

  const activeFiltersCount = Object.values(filters).flat().length;

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div ref={searchRef} className={`relative w-full max-w-2xl mx-auto ${className}`}>
      {/* Search Input */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 flex items-center pl-3">
          <Search className="h-5 w-5 text-gray-400" />
        </div>
        
        <Input
          ref={inputRef}
          type="text"
          placeholder="Cerca giochi, console, accessori..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleKeyPress}
          className="pl-10 pr-24 py-3 text-lg border-2 border-gray-200 focus:border-blue-500 rounded-lg"
        />

        <div className="absolute inset-y-0 right-0 flex items-center space-x-2 pr-3">
          {/* Voice Search */}
          {recognition.current && (
            <Button
              variant="ghost"
              size="sm"
              onClick={isVoiceActive ? stopVoiceSearch : startVoiceSearch}
              className={`p-2 ${isVoiceActive ? 'text-red-500 animate-pulse' : 'text-gray-400'}`}
            >
              {isVoiceActive ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
            </Button>
          )}

          {/* Filters Toggle */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsOpen(!isOpen)}
            className="p-2 text-gray-400 relative"
          >
            <Filter className="h-4 w-4" />
            {activeFiltersCount > 0 && (
              <Badge className="absolute -top-1 -right-1 h-5 w-5 p-0 text-xs">
                {activeFiltersCount}
              </Badge>
            )}
          </Button>
        </div>
      </div>

      {/* Search Dropdown */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute top-full left-0 right-0 mt-2 bg-white rounded-lg shadow-xl border border-gray-200 z-50 max-h-96 overflow-hidden"
          >
            <div className="p-4 space-y-4">
              {/* Quick Actions */}
              {query.length >= 2 && (
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Sparkles className="h-4 w-4 text-blue-500" />
                    <span className="text-sm font-medium">Ricerca intelligente</span>
                  </div>
                  <Button onClick={handleSearch} size="sm">
                    Cerca "{query}"
                  </Button>
                </div>
              )}

              {/* Loading State */}
              {isLoading && (
                <div className="flex items-center space-x-2 py-2">
                  <div className="animate-spin h-4 w-4 border-2 border-blue-500 border-t-transparent rounded-full"></div>
                  <span className="text-sm text-gray-500">Ricerca in corso...</span>
                </div>
              )}

              {/* Suggestions */}
              {suggestions.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-sm font-medium text-gray-700">Suggerimenti</h4>
                  {suggestions.map((suggestion) => (
                    <motion.div
                      key={suggestion.id}
                      whileHover={{ backgroundColor: '#f3f4f6' }}
                      className="flex items-center space-x-3 p-2 rounded cursor-pointer"
                      onClick={() => onSuggestionSelect(suggestion)}
                    >
                      {suggestion.image && (
                        <img 
                          src={suggestion.image} 
                          alt="" 
                          className="w-8 h-8 rounded object-cover"
                        />
                      )}
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <span className="text-sm">{suggestion.text}</span>
                          {suggestion.type === 'trending' && (
                            <TrendingUp className="h-3 w-3 text-orange-500" />
                          )}
                        </div>
                        {suggestion.count && (
                          <span className="text-xs text-gray-500">{suggestion.count} risultati</span>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}

              {/* Recent Searches */}
              {query.length === 0 && recentSearches.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Clock className="h-4 w-4 text-gray-400" />
                    <h4 className="text-sm font-medium text-gray-700">Ricerche recenti</h4>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {recentSearches.map((search, index) => (
                      <Badge
                        key={index}
                        variant="secondary"
                        className="cursor-pointer hover:bg-gray-200"
                        onClick={() => setQuery(search)}
                      >
                        {search}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Trending Searches */}
              {query.length === 0 && trendingSearches.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <TrendingUp className="h-4 w-4 text-orange-500" />
                    <h4 className="text-sm font-medium text-gray-700">Tendenze</h4>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    {trendingSearches.slice(0, 6).map((search, index) => (
                      <Badge
                        key={index}
                        variant="outline"
                        className="cursor-pointer hover:bg-orange-50 justify-start"
                        onClick={() => setQuery(search)}
                      >
                        {search}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              <Separator />

              {/* Filters */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-medium text-gray-700">Filtri</h4>
                  {activeFiltersCount > 0 && (
                    <Button variant="ghost" size="sm" onClick={clearFilters}>
                      Cancella filtri
                    </Button>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {searchFilters.map((filter) => (
                    <div key={filter.id} className="space-y-2">
                      <h5 className="text-xs font-medium text-gray-600 uppercase tracking-wide">
                        {filter.name}
                      </h5>
                      <div className="space-y-1">
                        {filter.options.slice(0, 3).map((option) => (
                          <label
                            key={option.value}
                            className="flex items-center space-x-2 cursor-pointer text-sm"
                          >
                            <input
                              type="checkbox"
                              checked={(filters[filter.id] || []).includes(option.value)}
                              onChange={() => toggleFilter(filter.id, option.value)}
                              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                            />
                            <span className="flex-1">{option.label}</span>
                            {option.count && (
                              <span className="text-xs text-gray-400">({option.count})</span>
                            )}
                          </label>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}