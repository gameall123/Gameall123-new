import { ChevronDown, Sparkles, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { HeroGameAllLogo } from "@/components/GameAllLogo";

export function Hero() {
  const scrollToProducts = () => {
    const productsSection = document.getElementById('products');
    if (productsSection) {
      productsSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section className="relative bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white py-12 sm:py-16 md:py-20 lg:py-32 overflow-hidden">
      {/* Static gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900"></div>
      
      {/* Static decorative elements */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-10 w-2 h-2 bg-white/20 rounded-full"></div>
        <div className="absolute top-40 right-20 w-3 h-3 bg-blue-400/30 rounded-full"></div>
        <div className="absolute bottom-32 left-1/4 w-2 h-2 bg-purple-400/30 rounded-full"></div>
        <div className="absolute bottom-20 right-1/3 w-4 h-4 bg-white/10 rounded-full"></div>
      </div>

      {/* Main content overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/20 to-black/40"></div>
      
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          {/* Gaming badge - Responsive */}
          <div className="mb-6 md:mb-8">
            <span className="inline-flex items-center gap-2 px-4 py-2 md:px-6 md:py-3 bg-gradient-to-r from-blue-500/20 to-purple-500/20 border border-blue-400/30 rounded-full text-xs md:text-sm font-medium backdrop-blur-xl shadow-2xl">
              <Sparkles className="w-3 h-3 md:w-4 md:h-4 text-blue-400" />
              <span className="bg-gradient-to-r from-blue-200 to-purple-200 bg-clip-text text-transparent font-semibold">
                Il Miglior Store di Gaming
              </span>
              <Zap className="w-3 h-3 md:w-4 md:h-4 text-purple-400" />
            </span>
          </div>
          
          {/* Logo - Responsive */}
          <div className="mb-8 md:mb-12">
            <HeroGameAllLogo className="scale-75 md:scale-100" />
          </div>
          
          {/* Title - Mobile Optimized */}
          <div className="mb-8 px-4 md:px-0">
            <h2 className="text-3xl sm:text-4xl md:text-6xl lg:text-7xl font-black mb-4 leading-tight text-white">
              Il Futuro del Gaming
            </h2>
            <p className="text-lg sm:text-xl md:text-2xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
              Scopri i migliori prodotti gaming, dalle console next-gen agli accessori professionali. 
              Tutto quello che ti serve per dominare il gioco.
            </p>
          </div>
          
          {/* CTAs - Mobile Optimized */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center px-4 md:px-0">
            <Button 
              size="lg" 
              onClick={scrollToProducts}
              className="w-full sm:w-auto bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-semibold px-6 py-4 md:px-8 md:py-6 rounded-xl shadow-2xl text-base md:text-lg transition-all duration-300"
            >
              Scopri i Prodotti
            </Button>
            
            <Button 
              size="lg" 
              variant="outline"
              className="w-full sm:w-auto border-2 border-white/30 text-white hover:bg-white/10 font-semibold px-6 py-4 md:px-8 md:py-6 rounded-xl text-base md:text-lg transition-all duration-300 backdrop-blur-sm"
            >
              Offerte Speciali
            </Button>
          </div>
        </div>
      </div>
      
      {/* Bottom chevron */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2">
        <ChevronDown 
          className="w-8 h-8 text-white/50 cursor-pointer hover:text-white/80 transition-colors"
          onClick={scrollToProducts}
        />
      </div>
    </section>
  );
}