import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Globe, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useTranslation, SupportedLocale } from '@/hooks/useTranslation';

interface LanguageSelectorProps {
  variant?: 'dropdown' | 'inline' | 'compact';
  showFlag?: boolean;
  showLabel?: boolean;
  className?: string;
}

export default function LanguageSelector({ 
  variant = 'dropdown',
  showFlag = true,
  showLabel = true,
  className = ''
}: LanguageSelectorProps) {
  const { locale, setLocale, availableLocales, isLoading } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);

  const currentLocale = availableLocales.find(l => l.code === locale);

  const handleLocaleChange = (newLocale: SupportedLocale) => {
    setLocale(newLocale);
    setIsOpen(false);
    
    // Optional: Show success message
    console.log(`Language changed to: ${newLocale}`);
  };

  if (variant === 'inline') {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <Globe className="h-4 w-4 text-gray-500" />
        <div className="flex gap-1">
          {availableLocales.map((lang) => (
            <Button
              key={lang.code}
              variant={locale === lang.code ? "default" : "ghost"}
              size="sm"
              onClick={() => handleLocaleChange(lang.code)}
              className={`px-2 py-1 h-auto text-xs ${
                locale === lang.code 
                  ? 'bg-blue-500 text-white' 
                  : 'text-gray-600 hover:text-gray-900'
              }`}
              disabled={isLoading}
            >
              {showFlag && <span className="mr-1">{lang.flag}</span>}
              {lang.code.toUpperCase()}
            </Button>
          ))}
        </div>
      </div>
    );
  }

  if (variant === 'compact') {
    return (
      <div className={`relative ${className}`}>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsOpen(!isOpen)}
          className="h-8 w-8 p-0 hover:bg-gray-100"
          disabled={isLoading}
        >
          {currentLocale ? (
            <span className="text-lg">{currentLocale.flag}</span>
          ) : (
            <Globe className="h-4 w-4" />
          )}
        </Button>

        <AnimatePresence>
          {isOpen && (
            <>
              {/* Backdrop */}
              <div 
                className="fixed inset-0 z-40" 
                onClick={() => setIsOpen(false)} 
              />
              
              {/* Dropdown */}
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: -10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: -10 }}
                className="absolute top-full right-0 mt-2 z-50"
              >
                <Card className="min-w-[120px] shadow-lg border">
                  <CardContent className="p-2">
                    <div className="space-y-1">
                      {availableLocales.map((lang) => (
                        <Button
                          key={lang.code}
                          variant="ghost"
                          size="sm"
                          onClick={() => handleLocaleChange(lang.code)}
                          className={`w-full justify-start h-8 text-xs ${
                            locale === lang.code ? 'bg-blue-50 text-blue-700' : ''
                          }`}
                        >
                          <span className="mr-2">{lang.flag}</span>
                          <span className="flex-1 text-left">{lang.name}</span>
                          {locale === lang.code && (
                            <Check className="h-3 w-3 ml-1" />
                          )}
                        </Button>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>
    );
  }

  // Default dropdown variant
  return (
    <div className={`relative ${className}`}>
      <Button
        variant="outline"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 bg-white border-gray-200 hover:bg-gray-50"
        disabled={isLoading}
      >
        {isLoading ? (
          <div className="animate-spin h-4 w-4 border-2 border-blue-500 border-t-transparent rounded-full" />
        ) : (
          <>
            {showFlag && currentLocale && (
              <span className="text-lg">{currentLocale.flag}</span>
            )}
            {showLabel && currentLocale && (
              <span className="font-medium">{currentLocale.name}</span>
            )}
            <ChevronDown className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
          </>
        )}
      </Button>

      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <div 
              className="fixed inset-0 z-40" 
              onClick={() => setIsOpen(false)} 
            />
            
            {/* Dropdown */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -10 }}
              className="absolute top-full left-0 mt-2 z-50 w-full min-w-[200px]"
            >
              <Card className="shadow-xl border border-gray-200">
                <CardContent className="p-3">
                  <div className="space-y-1">
                    {availableLocales.map((lang) => (
                      <motion.div
                        key={lang.code}
                        whileHover={{ backgroundColor: '#f3f4f6' }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <Button
                          variant="ghost"
                          onClick={() => handleLocaleChange(lang.code)}
                          className={`w-full justify-start p-3 h-auto ${
                            locale === lang.code 
                              ? 'bg-blue-50 text-blue-700 border border-blue-200' 
                              : 'hover:bg-gray-50'
                          }`}
                        >
                          <span className="text-xl mr-3">{lang.flag}</span>
                          <div className="flex-1 text-left">
                            <div className="font-medium">{lang.name}</div>
                            <div className="text-xs text-gray-500">
                              {lang.code.toUpperCase()}
                            </div>
                          </div>
                          {locale === lang.code && (
                            <Check className="h-4 w-4 ml-2 text-blue-600" />
                          )}
                        </Button>
                      </motion.div>
                    ))}
                  </div>

                  {/* Footer */}
                  <div className="border-t border-gray-100 mt-3 pt-3">
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <Globe className="h-3 w-3" />
                      <span>Lingua / Language</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

// Additional utility component for mobile/responsive usage
export function MobileLanguageSelector({ className = '' }: { className?: string }) {
  const { locale, setLocale, availableLocales } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className={`${className}`}>
      <Button
        variant="ghost"
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 w-full justify-start"
      >
        <Globe className="h-5 w-5" />
        <span>Lingua / Language</span>
      </Button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/50 flex items-end sm:items-center justify-center p-4"
            onClick={() => setIsOpen(false)}
          >
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.95 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-sm"
            >
              <Card className="bg-white">
                <CardContent className="p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <Globe className="h-5 w-5 text-blue-600" />
                    <h3 className="font-semibold text-gray-900">Seleziona Lingua</h3>
                  </div>

                  <div className="space-y-2">
                    {availableLocales.map((lang) => (
                      <Button
                        key={lang.code}
                        variant={locale === lang.code ? "default" : "ghost"}
                        onClick={() => {
                          setLocale(lang.code);
                          setIsOpen(false);
                        }}
                        className="w-full justify-start p-4 h-auto"
                      >
                        <span className="text-2xl mr-3">{lang.flag}</span>
                        <div className="flex-1 text-left">
                          <div className="font-medium">{lang.name}</div>
                          <div className="text-sm text-gray-500">
                            {lang.code.toUpperCase()}
                          </div>
                        </div>
                        {locale === lang.code && (
                          <Check className="h-5 w-5 ml-2" />
                        )}
                      </Button>
                    ))}
                  </div>

                  <Button
                    variant="outline"
                    onClick={() => setIsOpen(false)}
                    className="w-full mt-4"
                  >
                    Chiudi
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}