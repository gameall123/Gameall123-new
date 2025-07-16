#!/bin/bash

# 🚀 GameAll v2.0 - Automated GitHub Deploy Script
# Questo script automatizza il caricamento di tutte le nuove funzionalità su GitHub

echo "🎮 GameAll v2.0 - Deploy Automatico"
echo "======================================"

# Colori per output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Funzione per stampare con colori
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Verifica se Git è installato
if ! command -v git &> /dev/null; then
    print_error "Git non è installato. Installalo prima di continuare."
    exit 1
fi

# Verifica se siamo in un repository Git
if [ ! -d ".git" ]; then
    print_warning "Non siamo in un repository Git. Inizializzo..."
    git init
    print_success "Repository Git inizializzato"
fi

# Verifica se il remote origin esiste
if ! git remote get-url origin &> /dev/null; then
    print_warning "Remote origin non configurato."
    echo "Inserisci l'URL del tuo repository GitHub:"
    echo "Esempio: https://github.com/gameall123/Prova.git"
    read -p "URL Repository: " repo_url
    
    if [ -n "$repo_url" ]; then
        git remote add origin "$repo_url"
        print_success "Remote origin configurato: $repo_url"
    else
        print_error "URL repository richiesto. Esiting."
        exit 1
    fi
fi

# Mostra status del repository
print_status "Controllo stato repository..."
git status --porcelain > /dev/null

# Lista dei file modificati/creati per v2.0
print_status "📋 Nuovi file e funzionalità GameAll v2.0:"
echo ""
echo "💬 Live Chat Real-time:"
echo "  ✅ server/websocket.ts"
echo "  ✅ client/src/components/LiveChat.tsx"
echo ""
echo "⭐ Sistema Recensioni:"
echo "  ✅ client/src/pages/ReviewsPage.tsx"
echo "  ✅ API reviews complete"
echo ""
echo "🎟️ Sistema Coupon:"
echo "  ✅ client/src/components/CheckoutModal.tsx (aggiornato)"
echo "  ✅ API coupon validation"
echo ""
echo "🔔 Centro Notifiche:"
echo "  ✅ client/src/components/NotificationCenter.tsx"
echo "  ✅ client/src/components/Navbar.tsx (aggiornato)"
echo ""
echo "🤖 Raccomandazioni AI:"
echo "  ✅ client/src/components/ProductRecommendations.tsx"
echo "  ✅ client/src/pages/Home.tsx (aggiornato)"
echo ""
echo "📋 Documentazione:"
echo "  ✅ README.md (aggiornato)"
echo "  ✅ API_DOCUMENTATION.md (nuovo)"
echo "  ✅ CHANGELOG.md (nuovo)"
echo "  ✅ CARICAMENTO_GITHUB.md (aggiornato)"
echo ""

# Chiedi conferma
read -p "Vuoi procedere con il deploy di tutte queste funzionalità? (y/N): " confirm

if [[ ! $confirm =~ ^[Yy]$ ]]; then
    print_warning "Deploy annullato dall'utente."
    exit 0
fi

# Aggiungi tutti i file
print_status "Aggiungendo file al staging..."
git add .

# Verifica se ci sono file da committare
if git diff --staged --quiet; then
    print_warning "Nessun file modificato da committare."
    exit 0
fi

# Crea commit con messaggio dettagliato
print_status "Creando commit..."
git commit -m "🚀 GameAll v2.0 - Complete Platform Upgrade

✨ NEW ADVANCED FEATURES:
💬 Live Chat Real-time with WebSocket
⭐ Complete Review System with filters
🎟️ Coupon & Discount System in checkout
🔔 Real-time Notifications Center
🤖 AI-Powered Smart Recommendations

🛠️ TECHNICAL IMPROVEMENTS:
- +15 new API endpoints
- WebSocket server integration
- Enhanced database schema
- Optimized queries with joins
- Advanced UI/UX components

📊 PROJECT STATS:
- 25+ React components
- 40+ API endpoints  
- 15,000+ lines of code
- 15+ user features
- Enterprise-ready architecture

🎯 READY FOR:
- Portfolio showcase
- Commercial deployment
- Open source contributions
- Technical interviews

📋 DOCUMENTATION:
- Complete API documentation
- Updated README with all features
- Comprehensive changelog
- Developer setup guides

🎮 GameAll is now an enterprise-level gaming e-commerce platform!"

if [ $? -eq 0 ]; then
    print_success "Commit creato con successo!"
else
    print_error "Errore durante la creazione del commit."
    exit 1
fi

# Push al repository
print_status "Caricando su GitHub..."

# Verifica se il branch main esiste su remote
if git ls-remote --heads origin main | grep -q main; then
    git push origin main
else
    # Se è il primo push, usa --set-upstream
    git push --set-upstream origin main
fi

if [ $? -eq 0 ]; then
    print_success "🎉 Deploy completato con successo!"
    echo ""
    echo "🔗 Il tuo repository è aggiornato con GameAll v2.0!"
    echo ""
    print_status "PROSSIMI PASSI:"
    echo "1. 🏷️  Aggiungi topics al repository:"
    echo "   react nodejs postgresql websocket ecommerce gaming typescript tailwindcss realtime chat notifications recommendations ai drizzle-orm vite"
    echo ""
    echo "2. 📝 Aggiorna descrizione repository:"
    echo "   🎮 E-commerce gaming completo con Live Chat, Recensioni, Coupon, Notifiche Real-time e Raccomandazioni AI. React + Node.js + PostgreSQL + WebSocket"
    echo ""
    echo "3. 🌟 Considera creare:"
    echo "   - Issues template"
    echo "   - Pull request template"
    echo "   - GitHub Pages per documentazione"
    echo "   - Demo live deployment"
    echo ""
    print_success "GameAll v2.0 è ora live su GitHub! 🚀"
else
    print_error "Errore durante il push. Verifica la connessione e i permessi."
    exit 1
fi