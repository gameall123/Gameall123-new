# GameAll - E-Commerce Gaming Platform

Un'applicazione e-commerce completa specializzata in prodotti gaming, costruita con tecnologie moderne e design responsive. **Ora con funzionalità avanzate di nuova generazione!**

## 🎮 Caratteristiche Principali

- **Catalogo Gaming**: Vasta selezione di prodotti gaming con categorie specializzate
- **Carrello Intelligente**: Gestione carrello con sincronizzazione in tempo reale
- **Autenticazione Sicura**: Sistema di autenticazione tramite Replit OAuth
- **Dashboard Admin**: Pannello amministrativo completo per gestione prodotti e ordini
- **Design Responsive**: Ottimizzato per desktop e mobile
- **Localizzazione Italiana**: Interfaccia completamente tradotta in italiano

## 🆕 **Nuove Funzionalità Avanzate**

### 💬 **Live Chat Real-time**
- **WebSocket Server** per comunicazione istantanea
- **Chat persistente** con salvataggio messaggi in database
- **Stanze chat multiple** (supporto, generale)
- **Indicatori di digitazione** e stato connessione
- **Risposte automatiche admin** intelligenti
- **Riconnessione automatica** in caso di disconnessione

### ⭐ **Sistema Recensioni Completo**
- **Pagina dedicata** `/reviews` con interfaccia moderna
- **Scrittura recensioni** con rating a stelle e commenti
- **Filtri avanzati** per rating, ricerca testuale e ordinamento
- **Sezione personalizzata** "Le tue recensioni"
- **Visualizzazione recensioni per prodotto** con dettagli utente
- **API complete** con join ottimizzati per performance

### 🎟️ **Sistema Coupon e Sconti**
- **Interfaccia coupon nel checkout** con applicazione real-time
- **Validazione intelligente** (scadenza, usi massimi, importo minimo)
- **Supporto sconti** percentuali e fissi
- **Calcolo automatico totali** inclusa IVA
- **Gestione admin coupon** nel pannello amministrativo

### 🔔 **Centro Notifiche Real-time**
- **Notifiche in tempo reale** nella navbar
- **Badge contatore** con numero notifiche non lette
- **Categorizzazione notifiche** (info, success, warning, error)
- **Azioni rapide**: segna come letta, elimina, segna tutte come lette
- **Aggiornamento automatico** ogni 30 secondi
- **UI elegante** con popover responsive

### 🤖 **Sistema Raccomandazioni Intelligente**
- **Algoritmo multi-livello** per suggerimenti personalizzati:
  - 🎯 **Raccomandazioni personalizzate** basate su cronologia ordini
  - 📂 **Prodotti categoria simile** per interessi specifici
  - 🔥 **Prodotti popolari** più ordinati dalla community
  - ⭐ **Prodotti di tendenza** nuovi con rating elevati
- **Badge informativi** per spiegare il tipo di raccomandazione
- **Integrazione Home page** con sezioni dedicate
- **UI accattivante** con animazioni e hover effects

## 🛠️ Tecnologie Utilizzate

### Frontend
- **React 18** con TypeScript
- **Vite** per build veloce e development
- **Tailwind CSS** + **shadcn/ui** per styling moderno
- **Zustand** per gestione stato carrello
- **TanStack Query** per server state management
- **Wouter** per routing leggero
- **Framer Motion** per animazioni fluide

### Backend
- **Node.js** con **Express.js**
- **PostgreSQL** con **Drizzle ORM**
- **WebSocket Server** per comunicazione real-time
- **Replit OAuth** per autenticazione
- **Session storage** con PostgreSQL
- **API RESTful** con middleware di sicurezza avanzata
- **Sistema di cache** per performance ottimizzate

### Nuove Integrazioni
- **WebSocket (ws)** per live chat real-time
- **Algoritmi di raccomandazione** personalizzati
- **Sistema notifiche** push-like
- **Validazione coupon** avanzata

## 🚀 Installazione e Avvio

1. Clona il repository:
```bash
git clone https://github.com/gameall123/Prova.git
cd Prova
```

2. Installa le dipendenze:
```bash
npm install
```

3. Configura le variabili d'ambiente (.env):
```bash
# Database
DATABASE_URL=postgresql://postgres:password@localhost:5432/gameall_dev

# Session & Auth
SESSION_SECRET=your-super-secret-session-key-change-in-production
REPLIT_DOMAINS=your-domain.replit.dev
ISSUER_URL=https://replit.com/oidc
REPL_ID=your-repl-id

# File Uploads
MAX_FILE_SIZE=5242880

# Development
NODE_ENV=development

# GitHub (optional)
GITHUB_TOKEN=your_github_token_here
```

4. Crea le tabelle del database:
```bash
npm run db:push
```

5. Avvia l'applicazione:
```bash
npm run dev
```

L'applicazione sarà disponibile su `http://localhost:5000`

## 📁 Struttura del Progetto

```
gameall123-new/
├── client/                 # Frontend React
│   ├── src/
│   │   ├── components/     # Componenti UI
│   │   │   ├── ui/         # Componenti base shadcn/ui
│   │   │   ├── LiveChat.tsx           # Chat real-time
│   │   │   ├── NotificationCenter.tsx # Centro notifiche
│   │   │   ├── ProductRecommendations.tsx # Raccomandazioni
│   │   │   └── CheckoutModal.tsx      # Checkout con coupon
│   │   ├── pages/          # Pagine principali
│   │   │   ├── ReviewsPage.tsx        # Pagina recensioni
│   │   │   ├── Home.tsx              # Homepage con raccomandazioni
│   │   │   └── ...
│   │   ├── hooks/          # Custom hooks
│   │   └── lib/            # Utilities
├── server/                 # Backend Express
│   ├── routes.ts           # API endpoints (recensioni, chat, notifiche, ecc.)
│   ├── storage.ts          # Database operations con nuovi metodi
│   ├── websocket.ts        # Server WebSocket per live chat
│   ├── auth.ts            # Sistema autenticazione
│   └── middleware/         # Security middleware
├── shared/                 # Codice condiviso
│   └── schema.ts           # Database schema aggiornato
├── .env                   # Variabili d'ambiente
└── migrations/             # Database migrations
```

## 🔧 Funzionalità Complete

### 👤 **Per gli Utenti**
- **🔐 Registrazione e Login**: Sistema di autenticazione sicuro
- **🔍 Navigazione Prodotti**: Filtri avanzati per categoria e ricerca
- **🛒 Carrello Intelligente**: Gestione quantità e checkout con coupon
- **📦 Storico Ordini**: Tracciamento completo stato ordini
- **👤 Profilo Utente**: Gestione dati personali e spedizione
- **⭐ Sistema Recensioni**: Scrivi e leggi recensioni prodotti
- **💬 Live Chat**: Assistenza clienti in tempo reale
- **🔔 Notifiche**: Aggiornamenti su ordini e offerte
- **🎯 Raccomandazioni**: Prodotti personalizzati per i tuoi gusti
- **🎟️ Coupon**: Applica sconti durante il checkout
- **❤️ Wishlist**: Salva i tuoi prodotti preferiti

### 🔧 **Per gli Amministratori**
- **📊 Dashboard Analytics**: Statistiche real-time e insights
- **📦 Gestione Prodotti**: CRUD completo per catalogo
- **📋 Gestione Ordini**: Monitoraggio e aggiornamento stato
- **👥 Gestione Utenti**: Visualizzazione e gestione account
- **⭐ Moderazione Recensioni**: Gestione recensioni utenti
- **🎟️ Gestione Coupon**: Creazione e controllo sconti
- **💬 Chat Admin**: Risposte automatiche e gestione chat
- **🔔 Sistema Notifiche**: Invio notifiche personalizzate

## 🚀 **API Endpoints Principali**

### Prodotti e Raccomandazioni
```
GET    /api/products              # Lista prodotti
GET    /api/recommendations       # Raccomandazioni intelligenti
POST   /api/products              # Crea prodotto (admin)
```

### Recensioni
```
GET    /api/reviews               # Lista recensioni con filtri
GET    /api/reviews/user/:userId  # Recensioni utente
POST   /api/reviews               # Crea recensione
PUT    /api/reviews/:id           # Modifica recensione
DELETE /api/reviews/:id           # Elimina recensione
```

### Coupon
```
GET    /api/coupons/validate/:code # Valida coupon
GET    /api/coupons               # Lista coupon (admin)
POST   /api/coupons               # Crea coupon (admin)
```

### Notifiche
```
GET    /api/notifications/:userId # Notifiche utente
POST   /api/notifications         # Crea notifica
PUT    /api/notifications/:id/read # Segna come letta
PUT    /api/notifications/:userId/read-all # Segna tutte come lette
DELETE /api/notifications/:id     # Elimina notifica
```

### Chat Real-time
```
WebSocket: /ws/chat               # Connessione WebSocket per chat
```

## 🎯 **Funzionalità Avanzate Implementate**

- ✅ **Sistema di recensioni prodotti** con filtri e ricerca
- ✅ **Wishlist personalizzata** con salvataggio persistente
- ✅ **Sistema di coupon e sconti** completo nel checkout
- ✅ **Notifiche real-time** con centro notifiche
- ✅ **Live chat** con WebSocket e persistenza messaggi
- ✅ **Sistema di raccomandazioni** intelligente multi-algoritmo

## 🔮 **Sviluppi Futuri**

- [ ] **Integrazione pagamenti Stripe** per transazioni reali
- [ ] **App mobile** con React Native
- [ ] **Push notifications** browser
- [ ] **Sistema di affiliazione** per influencer gaming
- [ ] **Realtà aumentata** per preview prodotti
- [ ] **AI chatbot** avanzato per assistenza clienti

## 🤝 Contributi

I contributi sono benvenuti! Per contribuire:

1. Fai fork del repository
2. Crea un branch per la tua feature (`git checkout -b feature/AmazingFeature`)
3. Commit le tue modifiche (`git commit -m 'Add some AmazingFeature'`)
4. Push al branch (`git push origin feature/AmazingFeature`)
5. Apri una Pull Request

## 📄 Licenza

Questo progetto è rilasciato sotto licenza MIT. Vedi il file `LICENSE` per dettagli.

## 📞 Contatti

- **Repository**: [https://github.com/gameall123/Prova](https://github.com/gameall123/Prova)
- **Issues**: [https://github.com/gameall123/Prova/issues](https://github.com/gameall123/Prova/issues)

---

⚡ **Sviluppato con passione per il gaming e tecnologie moderne!**

🚀 **Ora con funzionalità di nuova generazione per un'esperienza e-commerce completa!**
