import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { GameAllLogo } from '@/components/GameAllLogo';
import { 
  Mail, 
  Phone, 
  MapPin, 
  Clock, 
  Facebook, 
  Twitter, 
  Instagram, 
  Youtube, 
  Send,
  Sparkles,
  Gift,
  Zap,
  Star,
  Gamepad2
} from 'lucide-react';

export function Footer() {
  const [email, setEmail] = useState('');
  const [isSubscribing, setIsSubscribing] = useState(false);
  const { toast } = useToast();

  const handleNewsletterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    
    setIsSubscribing(true);
    
    // Simulate API call
    setTimeout(() => {
      setIsSubscribing(false);
      setEmail('');
      toast({
        title: "Iscrizione completata!",
        description: "Grazie per esserti iscritto alla newsletter GameAll.",
      });
    }, 1500);
  };

  return (
    <footer className="bg-black text-white">
      {/* Newsletter Section - Mobile Optimized */}
      <div className="relative overflow-hidden bg-gradient-to-r from-blue-900 via-purple-900 to-blue-900 py-12 sm:py-16 md:py-20">
        {/* Animated Background */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_20%_80%,rgba(120,119,198,0.3),transparent_50%)]"></div>
          <div className="absolute top-0 right-0 w-full h-full bg-[radial-gradient(circle_at_80%_20%,rgba(255,119,198,0.3),transparent_50%)]"></div>
        </div>
        
        {/* Static decorative elements */}
        <div className="absolute inset-0 overflow-hidden">
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="absolute w-2 h-2 bg-white rounded-full opacity-20"
              style={{
                left: `${30 + i * 20}%`,
                top: `${60 + Math.sin(i) * 10}%`,
              }}
            />
          ))}
        </div>
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <div className="mb-8 md:mb-12">
              <div className="flex flex-col items-center justify-center mb-6 md:mb-8">
                <div className="w-16 h-16 md:w-20 md:h-20 bg-gradient-to-br from-blue-500 via-purple-600 to-indigo-700 rounded-2xl md:rounded-3xl flex items-center justify-center mb-4 shadow-2xl border-2 border-white/20">
                  <Gamepad2 className="w-8 h-8 md:w-10 md:h-10 text-white" />
                </div>
                <div className="flex items-center justify-center space-x-2 md:space-x-4">
                  <Sparkles className="w-6 h-6 md:w-8 md:h-8 text-yellow-400" />
                  <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black bg-gradient-to-r from-white via-blue-400 to-purple-400 bg-clip-text text-transparent text-center">
                    GameAll Newsletter
                  </h2>
                  <Star className="w-6 h-6 md:w-8 md:h-8 text-purple-400" />
                </div>
              </div>
              
              <div className="flex flex-wrap items-center justify-center gap-3 md:gap-6 mb-8 md:mb-10">
                {[
                  { icon: Gift, text: "Offerte Esclusive", color: "from-yellow-400 to-orange-500", iconColor: "text-yellow-400", borderColor: "border-yellow-400/40" },
                  { icon: Zap, text: "News in Anteprima", color: "from-blue-400 to-purple-500", iconColor: "text-blue-400", borderColor: "border-blue-400/40" },
                  { icon: Star, text: "Contenuti Premium", color: "from-purple-400 to-pink-500", iconColor: "text-purple-400", borderColor: "border-purple-400/40" }
                ].map((item, index) => (
                  <div
                    key={item.text}
                    className={`flex items-center space-x-2 md:space-x-3 px-3 py-2 md:px-6 md:py-4 bg-gradient-to-r ${item.color}/20 backdrop-blur-xl rounded-xl md:rounded-2xl border-2 ${item.borderColor} shadow-xl`}
                  >
                    <item.icon className={`w-5 h-5 md:w-7 md:h-7 ${item.iconColor}`} />
                    <span className="text-sm md:text-lg font-bold text-white">{item.text}</span>
                  </div>
                ))}
              </div>
              
              <p className="text-base md:text-xl text-gray-300 mb-6 md:mb-8 max-w-2xl mx-auto leading-relaxed text-center px-4">
                Unisciti alla community GameAll e ricevi le migliori offerte gaming, 
                anteprime esclusive e contenuti premium direttamente nella tua email.
              </p>
            </div>
            
            <form 
              onSubmit={handleNewsletterSubmit} 
              className="relative max-w-3xl mx-auto"
            >
              {/* Simplified static form background */}
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500/30 via-purple-500/40 to-pink-500/30 rounded-3xl blur-2xl opacity-60" />
              
              <div className="relative flex flex-col sm:flex-row gap-4 md:gap-6 p-3 md:p-4 bg-black/50 backdrop-blur-2xl rounded-2xl md:rounded-3xl border-2 border-white/30 shadow-2xl">
                <div className="flex-1 relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-400/20 to-purple-500/20 rounded-xl md:rounded-2xl blur-sm opacity-50" />
                  
                  <Input
                    type="email"
                    placeholder="✨ La tua email per esperienze gaming epiche"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="relative w-full h-12 md:h-16 pl-12 md:pl-16 pr-4 md:pr-6 text-base md:text-xl bg-transparent border-none text-white placeholder-gray-300 focus:outline-none focus:placeholder-blue-300 transition-all duration-300"
                    style={{
                      background: "linear-gradient(90deg, transparent, rgba(59, 130, 246, 0.1), transparent)",
                      backgroundSize: "200% 100%"
                    }}
                    required
                  />
                  
                  <div className="absolute left-4 md:left-6 top-1/2 transform -translate-y-1/2">
                    <Mail className="w-5 h-5 md:w-6 md:h-6 text-blue-400" />
                  </div>
                </div>
                
                <Button
                  type="submit"
                  disabled={isSubscribing}
                  className="h-12 md:h-16 px-6 md:px-12 text-base md:text-xl font-bold rounded-xl md:rounded-2xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-2xl border-2 border-white/20"
                  style={{
                    background: "linear-gradient(135deg, #3b82f6, #8b5cf6, #ec4899, #f59e0b)",
                    backgroundSize: "300% 300%"
                  }}
                >
                  {isSubscribing ? (
                    <div className="w-7 h-7 border-3 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <div className="flex items-center space-x-3">
                      <Send className="w-6 h-6" />
                      <span>Inizia l'Avventura!</span>
                    </div>
                  )}
                </Button>
              </div>
              
              <p className="text-lg text-center mt-8 max-w-xl mx-auto">
                <span className="bg-gradient-to-r from-yellow-400 via-blue-400 to-purple-400 bg-clip-text text-transparent font-bold">
                  🎮 Oltre 50.000 gamer epici si fidano di noi
                </span>
                <span className="text-gray-300"> • </span>
                <span className="bg-gradient-to-r from-green-400 via-blue-400 to-cyan-400 bg-clip-text text-transparent font-bold">
                  🔒 Privacy ultra-sicura
                </span>
                <span className="text-gray-300"> • </span>
                <span className="bg-gradient-to-r from-pink-400 via-purple-400 to-indigo-400 bg-clip-text text-transparent font-bold">
                  📧 Cancellazione istantanea
                </span>
              </p>
            </form>
          </div>
        </div>
      </div>
      
      {/* Main Footer */}
      <div className="py-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* Company Info */}
            <div className="space-y-4">
              <GameAllLogo size="lg" animated={false} />
              <p className="text-gray-400">
                Il tuo negozio di gaming online di fiducia. Offriamo i migliori prodotti gaming con spedizione gratuita e garanzia completa.
              </p>
              <div className="flex space-x-4">
              <a href="#" className="text-gray-400 hover:text-blue-400 transition-colors">
                <Facebook size={24} />
              </a>
              <a href="#" className="text-gray-400 hover:text-blue-400 transition-colors">
                <Twitter size={24} />
              </a>
              <a href="#" className="text-gray-400 hover:text-blue-400 transition-colors">
                <Instagram size={24} />
              </a>
              <a href="#" className="text-gray-400 hover:text-blue-400 transition-colors">
                <Youtube size={24} />
              </a>
            </div>
          </div>

          {/* Contact Info */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold">Contatti</h4>
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <Phone className="text-blue-400" size={18} />
                <span className="text-gray-400">+39 02 1234 5678</span>
              </div>
              <div className="flex items-center space-x-3">
                <Mail className="text-blue-400" size={18} />
                <span className="text-gray-400">info@gameall.it</span>
              </div>
              <div className="flex items-center space-x-3">
                <MapPin className="text-blue-400" size={18} />
                <span className="text-gray-400">Via Roma 123, 20121 Milano, Italia</span>
              </div>
              <div className="flex items-center space-x-3">
                <Clock className="text-blue-400" size={18} />
                <span className="text-gray-400">Lun-Ven: 9:00-18:00</span>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold">Link Rapidi</h4>
            <ul className="space-y-2">
              <li><a href="#" className="text-gray-400 hover:text-blue-400 transition-colors">Chi Siamo</a></li>
              <li><a href="#" className="text-gray-400 hover:text-blue-400 transition-colors">Termini e Condizioni</a></li>
              <li><a href="#" className="text-gray-400 hover:text-blue-400 transition-colors">Privacy Policy</a></li>
              <li><a href="#" className="text-gray-400 hover:text-blue-400 transition-colors">Spedizioni e Resi</a></li>
              <li><a href="#" className="text-gray-400 hover:text-blue-400 transition-colors">Garanzia</a></li>
              <li><a href="#" className="text-gray-400 hover:text-blue-400 transition-colors">FAQ</a></li>
            </ul>
          </div>

          {/* Categories */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold">Categorie</h4>
            <ul className="space-y-2">
              <li><a href="#" className="text-gray-400 hover:text-blue-400 transition-colors">Console</a></li>
              <li><a href="#" className="text-gray-400 hover:text-blue-400 transition-colors">Giochi</a></li>
              <li><a href="#" className="text-gray-400 hover:text-blue-400 transition-colors">Accessori</a></li>
              <li><a href="#" className="text-gray-400 hover:text-blue-400 transition-colors">Componenti PC</a></li>
              <li><a href="#" className="text-gray-400 hover:text-blue-400 transition-colors">Monitor</a></li>
              <li><a href="#" className="text-gray-400 hover:text-blue-400 transition-colors">Cuffie e Audio</a></li>
            </ul>
          </div>
        </div>

          {/* Bottom Bar */}
          <div className="border-t border-gray-800 mt-12 pt-8">
            <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
              <p className="text-gray-400 text-sm">
                © 2025 GameAll. Tutti i diritti riservati.
              </p>
              <div className="flex space-x-6 text-sm">
                <span className="text-gray-400">P.IVA: IT12345678901</span>
                <span className="text-gray-400">REA: MI-1234567</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}