import { Gamepad2, ShieldCheck, Truck, HeadphonesIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function Landing() {
  const features = [
    {
      icon: Truck,
      title: "Spedizione Gratuita",
      description: "Consegna veloce e gratuita per ordini sopra i 50€",
      color: "text-blue-500"
    },
    {
      icon: ShieldCheck,
      title: "Garanzia 24 Mesi",
      description: "Protezione completa su tutti i prodotti gaming",
      color: "text-green-500"
    },
    {
      icon: HeadphonesIcon,
      title: "Supporto 24/7",
      description: "Assistenza tecnica sempre disponibile",
      color: "text-purple-500"
    }
  ];

  const products = [
    {
      name: "Console Gaming Next-Gen",
      price: "€699,99",
      image: "https://images.unsplash.com/photo-1606144042614-b2417e99c4e3?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300",
      description: "Potenza di nuova generazione per un'esperienza gaming incredibile"
    },
    {
      name: "Cuffie Gaming Pro",
      price: "€149,99",
      image: "https://images.unsplash.com/photo-1487215078519-e21cc028cb29?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300",
      description: "Audio surround 7.1 e microfono per comunicazioni cristalline"
    },
    {
      name: "Tastiera Meccanica RGB",
      price: "€199,99",
      image: "https://images.unsplash.com/photo-1541140532154-b024d705b90a?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300",
      description: "Switches meccanici e illuminazione RGB personalizzabile"
    },
    {
      name: "Mouse Gaming Precision",
      price: "€89,99",
      image: "https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300",
      description: "Sensore ad alta precisione per il gaming competitivo"
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-indigo-500 via-purple-500 to-violet-600 text-white py-20 lg:py-32 overflow-hidden">
        <div className="absolute inset-0 bg-black/20"></div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Il futuro del gaming è qui
            </h1>
            
            <p className="text-xl md:text-2xl mb-8 opacity-90 max-w-3xl mx-auto">
              Scopri la collezione più avanzata di prodotti gaming e unisciti alla community più avanzata
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <Button 
                onClick={() => window.location.href = '/auth'}
                size="lg" 
                className="bg-white text-gray-900 hover:bg-gray-100 shadow-lg"
              >
                Inizia Subito
              </Button>
              <Button 
                onClick={() => window.location.href = '/auth'}
                size="lg" 
                variant="outline" 
                className="border-white text-white hover:bg-white hover:text-gray-900"
              >
                Accedi
              </Button>
            </div>
          </div>
        </div>
        
        {/* Static decorative elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-20 left-10 w-16 h-16 rounded-full bg-white/10"></div>
          <div className="absolute top-40 right-20 w-12 h-12 rounded-full bg-white/5"></div>
          <div className="absolute bottom-32 left-1/4 w-20 h-20 rounded-full bg-white/10"></div>
          <div className="absolute bottom-20 right-1/3 w-8 h-8 rounded-full bg-white/5"></div>
        </div>
      </section>

      {/* Products Preview */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Prodotti in evidenza
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              I migliori prodotti gaming selezionati per te
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {products.map((product, index) => (
              <div key={index} className="group">
                <Card className="overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 border-0">
                  <div className="relative overflow-hidden">
                    <img 
                      src={product.image}
                      alt={product.name}
                      className="w-full h-48 object-cover"
                    />
                  </div>
                  
                  <CardContent className="p-6">
                    <h3 className="text-xl font-semibold text-gray-900 mb-2 line-clamp-2">
                      {product.name}
                    </h3>
                    
                    <p className="text-gray-600 mb-4 line-clamp-3 text-sm">
                      {product.description}
                    </p>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-2xl font-bold text-primary">
                        {product.price}
                      </span>
                      <Button 
                        onClick={() => window.location.href = '/auth'}
                        className="bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90 text-white shadow-md"
                      >
                        Aggiungi
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="text-center">
                <div className={`${feature.color} w-16 h-16 rounded-full bg-white shadow-lg flex items-center justify-center mx-auto mb-4`}>
                  <feature.icon className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-600">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}