# GameAll - E-Commerce Gaming Platform

Un'applicazione e-commerce completa specializzata in prodotti gaming, costruita con tecnologie moderne e design responsive.

## 🎮 Caratteristiche Principali

- **Catalogo Gaming**: Vasta selezione di prodotti gaming con categorie specializzate
- **Carrello Intelligente**: Gestione carrello con sincronizzazione in tempo reale
- **Autenticazione Sicura**: Sistema di autenticazione tramite Replit OAuth
- **Dashboard Admin**: Pannello amministrativo completo per gestione prodotti e ordini
- **Design Responsive**: Ottimizzato per desktop e mobile
- **Localizzazione Italiana**: Interfaccia completamente tradotta in italiano

## 🛠️ Tecnologie Utilizzate

### Frontend
- **React 18** con TypeScript
- **Vite** per build veloce e development
- **Tailwind CSS** + **shadcn/ui** per styling moderno
- **Zustand** per gestione stato carrello
- **TanStack Query** per server state management
- **Wouter** per routing leggero

### Backend
- **Node.js** con **Express.js**
- **PostgreSQL** con **Drizzle ORM**
- **Replit OAuth** per autenticazione
- **Session storage** con PostgreSQL
- **API RESTful** con middleware di sicurezza

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

3. Configura le variabili d'ambiente:
```bash
DATABASE_URL=your_postgresql_connection_string
SESSION_SECRET=your_session_secret
```

4. Avvia l'applicazione:
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
│   │   ├── pages/          # Pagine principali
│   │   ├── hooks/          # Custom hooks
│   │   └── lib/            # Utilities
├── server/                 # Backend Express
│   ├── routes.ts           # API endpoints
│   ├── storage.ts          # Database operations
│   └── middleware/         # Security middleware
├── shared/                 # Codice condiviso
│   └── schema.ts           # Database schema
└── migrations/             # Database migrations
```

## 🔧 Funzionalità Principali

### Per gli Utenti
- **Registrazione e Login**: Sistema di autenticazione sicuro
- **Navigazione Prodotti**: Filtri per categoria e ricerca
- **Carrello Avanzato**: Gestione quantità e checkout
- **Storico Ordini**: Tracciamento stato ordini
- **Profilo Utente**: Gestione dati personali e spedizione

### Per gli Amministratori
- **Gestione Prodotti**: CRUD completo per catalogo
- **Gestione Ordini**: Monitoraggio e aggiornamento stato
- **Analytics**: Dashboard con statistiche real-time
- **Gestione Utenti**: Visualizzazione e gestione account

## 🎯 Prossimi Sviluppi

- [ ] Sistema di recensioni prodotti
- [ ] Wishlist personalizzata
- [ ] Sistema di coupon e sconti
- [ ] Notifiche push
- [ ] Integrazione pagamenti Stripe
- [ ] Sistema di raccomandazioni

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

⚡ Sviluppato con passione per il gaming e tecnologie moderne!
