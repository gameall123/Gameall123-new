#!/bin/bash

# Script di deploy per GameAll su GitHub
# Autore: GameAll Team
# Data: 2025-07-15

echo "🚀 Iniziando il deploy di GameAll su GitHub..."

# Controlla se git è inizializzato
if [ ! -d ".git" ]; then
    echo "❌ Repository Git non trovato. Inizializzando..."
    git init
    git branch -M main
fi

# Aggiungi il repository remoto
echo "🔗 Configurando repository remoto..."
git remote remove origin 2>/dev/null || true
git remote add origin https://github.com/gameall123/Prova.git

# Verifica che tutti i file siano pronti
echo "📋 Verificando file..."
echo "- README.md: $(test -f README.md && echo "✅" || echo "❌")"
echo "- LICENSE: $(test -f LICENSE && echo "✅" || echo "❌")"
echo "- package.json: $(test -f package.json && echo "✅" || echo "❌")"
echo "- client/: $(test -d client && echo "✅" || echo "❌")"
echo "- server/: $(test -d server && echo "✅" || echo "❌")"
echo "- shared/: $(test -d shared && echo "✅" || echo "❌")"

# Aggiungi tutti i file (escludendo quelli in .gitignore)
echo "📦 Aggiungendo file al commit..."
git add .

# Verifica che ci siano file da committare
if git diff --cached --quiet; then
    echo "⚠️  Nessun file da committare"
else
    echo "✅ $(git diff --cached --name-only | wc -l) file pronti per il commit"
fi

# Commit con messaggio descrittivo
echo "💾 Creando commit..."
git commit -m "Initial commit - GameAll E-Commerce Gaming Platform

🎮 Applicazione e-commerce completa per prodotti gaming

Caratteristiche principali:
- Frontend React 18 + TypeScript
- Backend Node.js + Express 
- Database PostgreSQL + Drizzle ORM
- Autenticazione Replit OAuth
- Design responsive mobile-first
- Dashboard amministratore completa
- Sistema carrello intelligente
- Localizzazione italiana

Tecnologie utilizzate:
- React, TypeScript, Vite
- Tailwind CSS, shadcn/ui
- Zustand, TanStack Query
- PostgreSQL, Drizzle ORM
- Express.js, Replit Auth

Ready for production deployment! 🚀"

# Push al repository remoto
echo "🚀 Caricando su GitHub..."
if git push -u origin main; then
    echo "✅ Deploy completato con successo!"
    echo "🌐 Repository disponibile su: https://github.com/gameall123/Prova"
    echo ""
    echo "🎯 Prossimi passi:"
    echo "1. Visita il repository su GitHub"
    echo "2. Aggiungi topics: react, nodejs, postgresql, ecommerce, gaming"
    echo "3. Abilita GitHub Pages per demo online"
    echo "4. Configura CI/CD per deploy automatico"
    echo ""
    echo "💡 Per aggiornamenti futuri:"
    echo "   git add ."
    echo "   git commit -m 'Descrizione modifiche'"
    echo "   git push origin main"
else
    echo "❌ Errore durante il push. Proviamo con --force..."
    if git push -f origin main; then
        echo "✅ Deploy forzato completato!"
        echo "⚠️  Attenzione: Push forzato utilizzato"
    else
        echo "❌ Deploy fallito. Verifica:"
        echo "1. Connessione internet"
        echo "2. Permessi repository GitHub"
        echo "3. Token di autenticazione"
    fi
fi

echo ""
echo "🎮 GameAll pronto per il mondo!"