import { useState, useEffect, createContext, useContext } from 'react';

export type SupportedLocale = 'it' | 'en' | 'es' | 'fr' | 'de';

interface TranslationContextType {
  locale: SupportedLocale;
  setLocale: (locale: SupportedLocale) => void;
  t: (key: string, params?: Record<string, string | number>) => string;
  isLoading: boolean;
  availableLocales: Array<{
    code: SupportedLocale;
    name: string;
    flag: string;
  }>;
}

// Translations object structure
type TranslationValue = string | Record<string, any>;
type Translations = Record<string, any>;

// Default translations (fallback)
const defaultTranslations: Record<SupportedLocale, Translations> = {
  it: {
    common: {
      loading: 'Caricamento...',
      error: 'Errore',
      success: 'Successo',
      cancel: 'Annulla',
      confirm: 'Conferma',
      save: 'Salva',
      delete: 'Elimina',
      edit: 'Modifica',
      add: 'Aggiungi',
      search: 'Cerca',
      filter: 'Filtro',
      clear: 'Cancella',
      close: 'Chiudi',
      next: 'Successivo',
      previous: 'Precedente',
      home: 'Home',
      back: 'Indietro'
    },
    navigation: {
      home: 'Home',
      products: 'Prodotti',
      categories: 'Categorie',
      cart: 'Carrello',
      orders: 'Ordini',
      profile: 'Profilo',
      settings: 'Impostazioni',
      admin: 'Amministrazione',
      support: 'Supporto',
      logout: 'Logout'
    },
    products: {
      title: 'Prodotti',
      description: 'Descrizione',
      price: 'Prezzo',
      addToCart: 'Aggiungi al Carrello',
      inStock: 'Disponibile',
      outOfStock: 'Esaurito',
      category: 'Categoria',
      brand: 'Marca',
      rating: 'Valutazione',
      reviews: 'Recensioni',
      specifications: 'Specifiche'
    },
    cart: {
      title: 'Carrello',
      empty: 'Il carrello è vuoto',
      total: 'Totale',
      subtotal: 'Subtotale',
      shipping: 'Spedizione',
      tax: 'IVA',
      checkout: 'Checkout',
      remove: 'Rimuovi',
      quantity: 'Quantità',
      continue: 'Continua gli acquisti'
    },
    auth: {
      login: 'Accedi',
      register: 'Registrati',
      logout: 'Logout',
      email: 'Email',
      password: 'Password',
      confirmPassword: 'Conferma Password',
      forgotPassword: 'Password dimenticata?',
      rememberMe: 'Ricordami',
      welcome: 'Benvenuto/a',
      account: 'Account'
    },
    order: {
      title: 'Ordine',
      number: 'Numero Ordine',
      date: 'Data',
      status: 'Stato',
      total: 'Totale',
      details: 'Dettagli',
      shipping: 'Spedizione',
      billing: 'Fatturazione',
      payment: 'Pagamento',
      track: 'Traccia Ordine'
    },
    notifications: {
      title: 'Notifiche',
      markAllRead: 'Segna tutte come lette',
      clear: 'Cancella tutte',
      empty: 'Nessuna notifica',
      new: 'Nuova',
      orderConfirmed: 'Ordine confermato',
      orderShipped: 'Ordine spedito',
      orderDelivered: 'Ordine consegnato'
    },
    chat: {
      title: 'Chat Supporto',
      placeholder: 'Scrivi un messaggio...',
      send: 'Invia',
      typing: 'sta scrivendo...',
      online: 'Online',
      offline: 'Offline',
      connecting: 'Connessione...',
      connected: 'Connesso',
      disconnected: 'Disconnesso'
    },
    reviews: {
      title: 'Recensioni',
      write: 'Scrivi una recensione',
      rating: 'Valutazione',
      comment: 'Commento',
      submit: 'Invia recensione',
      helpful: 'Utile',
      notHelpful: 'Non utile',
      verified: 'Acquisto verificato',
      anonymous: 'Anonimo'
    },
    achievements: {
      title: 'Achievement',
      unlocked: 'Sbloccato',
      locked: 'Bloccato',
      progress: 'Progresso',
      reward: 'Ricompensa',
      level: 'Livello',
      xp: 'XP',
      leaderboard: 'Classifica',
      rank: 'Posizione'
    },
    analytics: {
      title: 'Analytics',
      revenue: 'Fatturato',
      orders: 'Ordini',
      users: 'Utenti',
      products: 'Prodotti',
      conversion: 'Conversione',
      views: 'Visualizzazioni',
      today: 'Oggi',
      thisWeek: 'Questa settimana',
      thisMonth: 'Questo mese'
    }
  },
  en: {
    common: {
      loading: 'Loading...',
      error: 'Error',
      success: 'Success',
      cancel: 'Cancel',
      confirm: 'Confirm',
      save: 'Save',
      delete: 'Delete',
      edit: 'Edit',
      add: 'Add',
      search: 'Search',
      filter: 'Filter',
      clear: 'Clear',
      close: 'Close',
      next: 'Next',
      previous: 'Previous',
      home: 'Home',
      back: 'Back'
    },
    navigation: {
      home: 'Home',
      products: 'Products',
      categories: 'Categories',
      cart: 'Cart',
      orders: 'Orders',
      profile: 'Profile',
      settings: 'Settings',
      admin: 'Administration',
      support: 'Support',
      logout: 'Logout'
    },
    products: {
      title: 'Products',
      description: 'Description',
      price: 'Price',
      addToCart: 'Add to Cart',
      inStock: 'In Stock',
      outOfStock: 'Out of Stock',
      category: 'Category',
      brand: 'Brand',
      rating: 'Rating',
      reviews: 'Reviews',
      specifications: 'Specifications'
    },
    cart: {
      title: 'Cart',
      empty: 'Cart is empty',
      total: 'Total',
      subtotal: 'Subtotal',
      shipping: 'Shipping',
      tax: 'Tax',
      checkout: 'Checkout',
      remove: 'Remove',
      quantity: 'Quantity',
      continue: 'Continue shopping'
    },
    auth: {
      login: 'Login',
      register: 'Register',
      logout: 'Logout',
      email: 'Email',
      password: 'Password',
      confirmPassword: 'Confirm Password',
      forgotPassword: 'Forgot password?',
      rememberMe: 'Remember me',
      welcome: 'Welcome',
      account: 'Account'
    },
    order: {
      title: 'Order',
      number: 'Order Number',
      date: 'Date',
      status: 'Status',
      total: 'Total',
      details: 'Details',
      shipping: 'Shipping',
      billing: 'Billing',
      payment: 'Payment',
      track: 'Track Order'
    },
    notifications: {
      title: 'Notifications',
      markAllRead: 'Mark all as read',
      clear: 'Clear all',
      empty: 'No notifications',
      new: 'New',
      orderConfirmed: 'Order confirmed',
      orderShipped: 'Order shipped',
      orderDelivered: 'Order delivered'
    },
    chat: {
      title: 'Support Chat',
      placeholder: 'Type a message...',
      send: 'Send',
      typing: 'is typing...',
      online: 'Online',
      offline: 'Offline',
      connecting: 'Connecting...',
      connected: 'Connected',
      disconnected: 'Disconnected'
    },
    reviews: {
      title: 'Reviews',
      write: 'Write a review',
      rating: 'Rating',
      comment: 'Comment',
      submit: 'Submit review',
      helpful: 'Helpful',
      notHelpful: 'Not helpful',
      verified: 'Verified purchase',
      anonymous: 'Anonymous'
    },
    achievements: {
      title: 'Achievements',
      unlocked: 'Unlocked',
      locked: 'Locked',
      progress: 'Progress',
      reward: 'Reward',
      level: 'Level',
      xp: 'XP',
      leaderboard: 'Leaderboard',
      rank: 'Rank'
    },
    analytics: {
      title: 'Analytics',
      revenue: 'Revenue',
      orders: 'Orders',
      users: 'Users',
      products: 'Products',
      conversion: 'Conversion',
      views: 'Views',
      today: 'Today',
      thisWeek: 'This week',
      thisMonth: 'This month'
    }
  },
  es: {
    common: {
      loading: 'Cargando...',
      error: 'Error',
      success: 'Éxito',
      cancel: 'Cancelar',
      confirm: 'Confirmar',
      save: 'Guardar',
      delete: 'Eliminar',
      edit: 'Editar',
      add: 'Añadir',
      search: 'Buscar',
      filter: 'Filtro',
      clear: 'Limpiar',
      close: 'Cerrar',
      next: 'Siguiente',
      previous: 'Anterior',
      home: 'Inicio',
      back: 'Atrás'
    },
    navigation: {
      home: 'Inicio',
      products: 'Productos',
      categories: 'Categorías',
      cart: 'Carrito',
      orders: 'Pedidos',
      profile: 'Perfil',
      settings: 'Configuración',
      admin: 'Administración',
      support: 'Soporte',
      logout: 'Cerrar sesión'
    },
    products: {
      title: 'Productos',
      description: 'Descripción',
      price: 'Precio',
      addToCart: 'Añadir al carrito',
      inStock: 'En stock',
      outOfStock: 'Agotado',
      category: 'Categoría',
      brand: 'Marca',
      rating: 'Calificación',
      reviews: 'Reseñas',
      specifications: 'Especificaciones'
    },
    cart: {
      title: 'Carrito',
      empty: 'El carrito está vacío',
      total: 'Total',
      subtotal: 'Subtotal',
      shipping: 'Envío',
      tax: 'Impuestos',
      checkout: 'Finalizar compra',
      remove: 'Eliminar',
      quantity: 'Cantidad',
      continue: 'Seguir comprando'
    },
    auth: {
      login: 'Iniciar sesión',
      register: 'Registrarse',
      logout: 'Cerrar sesión',
      email: 'Email',
      password: 'Contraseña',
      confirmPassword: 'Confirmar contraseña',
      forgotPassword: '¿Olvidaste tu contraseña?',
      rememberMe: 'Recordarme',
      welcome: 'Bienvenido/a',
      account: 'Cuenta'
    },
    order: {
      title: 'Pedido',
      number: 'Número de pedido',
      date: 'Fecha',
      status: 'Estado',
      total: 'Total',
      details: 'Detalles',
      shipping: 'Envío',
      billing: 'Facturación',
      payment: 'Pago',
      track: 'Rastrear pedido'
    },
    notifications: {
      title: 'Notificaciones',
      markAllRead: 'Marcar todas como leídas',
      clear: 'Limpiar todas',
      empty: 'Sin notificaciones',
      new: 'Nueva',
      orderConfirmed: 'Pedido confirmado',
      orderShipped: 'Pedido enviado',
      orderDelivered: 'Pedido entregado'
    },
    chat: {
      title: 'Chat de soporte',
      placeholder: 'Escribe un mensaje...',
      send: 'Enviar',
      typing: 'está escribiendo...',
      online: 'En línea',
      offline: 'Desconectado',
      connecting: 'Conectando...',
      connected: 'Conectado',
      disconnected: 'Desconectado'
    },
    reviews: {
      title: 'Reseñas',
      write: 'Escribir una reseña',
      rating: 'Calificación',
      comment: 'Comentario',
      submit: 'Enviar reseña',
      helpful: 'Útil',
      notHelpful: 'No útil',
      verified: 'Compra verificada',
      anonymous: 'Anónimo'
    },
    achievements: {
      title: 'Logros',
      unlocked: 'Desbloqueado',
      locked: 'Bloqueado',
      progress: 'Progreso',
      reward: 'Recompensa',
      level: 'Nivel',
      xp: 'XP',
      leaderboard: 'Clasificación',
      rank: 'Posición'
    },
    analytics: {
      title: 'Analíticas',
      revenue: 'Ingresos',
      orders: 'Pedidos',
      users: 'Usuarios',
      products: 'Productos',
      conversion: 'Conversión',
      views: 'Visualizaciones',
      today: 'Hoy',
      thisWeek: 'Esta semana',
      thisMonth: 'Este mes'
    }
  },
  fr: {
    common: {
      loading: 'Chargement...',
      error: 'Erreur',
      success: 'Succès',
      cancel: 'Annuler',
      confirm: 'Confirmer',
      save: 'Enregistrer',
      delete: 'Supprimer',
      edit: 'Modifier',
      add: 'Ajouter',
      search: 'Rechercher',
      filter: 'Filtre',
      clear: 'Effacer',
      close: 'Fermer',
      next: 'Suivant',
      previous: 'Précédent',
      home: 'Accueil',
      back: 'Retour'
    },
    navigation: {
      home: 'Accueil',
      products: 'Produits',
      categories: 'Catégories',
      cart: 'Panier',
      orders: 'Commandes',
      profile: 'Profil',
      settings: 'Paramètres',
      admin: 'Administration',
      support: 'Support',
      logout: 'Déconnexion'
    },
    products: {
      title: 'Produits',
      description: 'Description',
      price: 'Prix',
      addToCart: 'Ajouter au panier',
      inStock: 'En stock',
      outOfStock: 'Rupture de stock',
      category: 'Catégorie',
      brand: 'Marque',
      rating: 'Note',
      reviews: 'Avis',
      specifications: 'Spécifications'
    },
    cart: {
      title: 'Panier',
      empty: 'Le panier est vide',
      total: 'Total',
      subtotal: 'Sous-total',
      shipping: 'Livraison',
      tax: 'TVA',
      checkout: 'Commander',
      remove: 'Supprimer',
      quantity: 'Quantité',
      continue: 'Continuer les achats'
    },
    auth: {
      login: 'Se connecter',
      register: 'S\'inscrire',
      logout: 'Déconnexion',
      email: 'Email',
      password: 'Mot de passe',
      confirmPassword: 'Confirmer le mot de passe',
      forgotPassword: 'Mot de passe oublié ?',
      rememberMe: 'Se souvenir de moi',
      welcome: 'Bienvenue',
      account: 'Compte'
    },
    order: {
      title: 'Commande',
      number: 'Numéro de commande',
      date: 'Date',
      status: 'Statut',
      total: 'Total',
      details: 'Détails',
      shipping: 'Livraison',
      billing: 'Facturation',
      payment: 'Paiement',
      track: 'Suivre la commande'
    },
    notifications: {
      title: 'Notifications',
      markAllRead: 'Marquer tout comme lu',
      clear: 'Tout effacer',
      empty: 'Aucune notification',
      new: 'Nouveau',
      orderConfirmed: 'Commande confirmée',
      orderShipped: 'Commande expédiée',
      orderDelivered: 'Commande livrée'
    },
    chat: {
      title: 'Chat support',
      placeholder: 'Tapez un message...',
      send: 'Envoyer',
      typing: 'tape...',
      online: 'En ligne',
      offline: 'Hors ligne',
      connecting: 'Connexion...',
      connected: 'Connecté',
      disconnected: 'Déconnecté'
    },
    reviews: {
      title: 'Avis',
      write: 'Écrire un avis',
      rating: 'Note',
      comment: 'Commentaire',
      submit: 'Soumettre l\'avis',
      helpful: 'Utile',
      notHelpful: 'Pas utile',
      verified: 'Achat vérifié',
      anonymous: 'Anonyme'
    },
    achievements: {
      title: 'Réalisations',
      unlocked: 'Débloqué',
      locked: 'Verrouillé',
      progress: 'Progrès',
      reward: 'Récompense',
      level: 'Niveau',
      xp: 'XP',
      leaderboard: 'Classement',
      rank: 'Rang'
    },
    analytics: {
      title: 'Analytiques',
      revenue: 'Revenus',
      orders: 'Commandes',
      users: 'Utilisateurs',
      products: 'Produits',
      conversion: 'Conversion',
      views: 'Vues',
      today: 'Aujourd\'hui',
      thisWeek: 'Cette semaine',
      thisMonth: 'Ce mois'
    }
  },
  de: {
    common: {
      loading: 'Laden...',
      error: 'Fehler',
      success: 'Erfolg',
      cancel: 'Abbrechen',
      confirm: 'Bestätigen',
      save: 'Speichern',
      delete: 'Löschen',
      edit: 'Bearbeiten',
      add: 'Hinzufügen',
      search: 'Suchen',
      filter: 'Filter',
      clear: 'Löschen',
      close: 'Schließen',
      next: 'Weiter',
      previous: 'Zurück',
      home: 'Startseite',
      back: 'Zurück'
    },
    navigation: {
      home: 'Startseite',
      products: 'Produkte',
      categories: 'Kategorien',
      cart: 'Warenkorb',
      orders: 'Bestellungen',
      profile: 'Profil',
      settings: 'Einstellungen',
      admin: 'Verwaltung',
      support: 'Support',
      logout: 'Abmelden'
    },
    products: {
      title: 'Produkte',
      description: 'Beschreibung',
      price: 'Preis',
      addToCart: 'In den Warenkorb',
      inStock: 'Auf Lager',
      outOfStock: 'Ausverkauft',
      category: 'Kategorie',
      brand: 'Marke',
      rating: 'Bewertung',
      reviews: 'Bewertungen',
      specifications: 'Spezifikationen'
    },
    cart: {
      title: 'Warenkorb',
      empty: 'Warenkorb ist leer',
      total: 'Gesamt',
      subtotal: 'Zwischensumme',
      shipping: 'Versand',
      tax: 'MwSt.',
      checkout: 'Zur Kasse',
      remove: 'Entfernen',
      quantity: 'Menge',
      continue: 'Weiter einkaufen'
    },
    auth: {
      login: 'Anmelden',
      register: 'Registrieren',
      logout: 'Abmelden',
      email: 'E-Mail',
      password: 'Passwort',
      confirmPassword: 'Passwort bestätigen',
      forgotPassword: 'Passwort vergessen?',
      rememberMe: 'Angemeldet bleiben',
      welcome: 'Willkommen',
      account: 'Konto'
    },
    order: {
      title: 'Bestellung',
      number: 'Bestellnummer',
      date: 'Datum',
      status: 'Status',
      total: 'Gesamt',
      details: 'Details',
      shipping: 'Versand',
      billing: 'Rechnung',
      payment: 'Bezahlung',
      track: 'Bestellung verfolgen'
    },
    notifications: {
      title: 'Benachrichtigungen',
      markAllRead: 'Alle als gelesen markieren',
      clear: 'Alle löschen',
      empty: 'Keine Benachrichtigungen',
      new: 'Neu',
      orderConfirmed: 'Bestellung bestätigt',
      orderShipped: 'Bestellung versendet',
      orderDelivered: 'Bestellung zugestellt'
    },
    chat: {
      title: 'Support-Chat',
      placeholder: 'Nachricht eingeben...',
      send: 'Senden',
      typing: 'schreibt...',
      online: 'Online',
      offline: 'Offline',
      connecting: 'Verbindung...',
      connected: 'Verbunden',
      disconnected: 'Getrennt'
    },
    reviews: {
      title: 'Bewertungen',
      write: 'Bewertung schreiben',
      rating: 'Bewertung',
      comment: 'Kommentar',
      submit: 'Bewertung abgeben',
      helpful: 'Hilfreich',
      notHelpful: 'Nicht hilfreich',
      verified: 'Verifizierter Kauf',
      anonymous: 'Anonym'
    },
    achievements: {
      title: 'Erfolge',
      unlocked: 'Freigeschaltet',
      locked: 'Gesperrt',
      progress: 'Fortschritt',
      reward: 'Belohnung',
      level: 'Level',
      xp: 'XP',
      leaderboard: 'Bestenliste',
      rank: 'Rang'
    },
    analytics: {
      title: 'Analytics',
      revenue: 'Umsatz',
      orders: 'Bestellungen',
      users: 'Benutzer',
      products: 'Produkte',
      conversion: 'Conversion',
      views: 'Aufrufe',
      today: 'Heute',
      thisWeek: 'Diese Woche',
      thisMonth: 'Dieser Monat'
    }
  }
};

// Available locales configuration
const availableLocales = [
  { code: 'it' as SupportedLocale, name: 'Italiano', flag: '🇮🇹' },
  { code: 'en' as SupportedLocale, name: 'English', flag: '🇺🇸' },
  { code: 'es' as SupportedLocale, name: 'Español', flag: '🇪🇸' },
  { code: 'fr' as SupportedLocale, name: 'Français', flag: '🇫🇷' },
  { code: 'de' as SupportedLocale, name: 'Deutsch', flag: '🇩🇪' }
];

// Helper function to get nested translation value
const getNestedValue = (obj: Translations, path: string): string => {
  const keys = path.split('.');
  let current: any = obj;
  
  for (const key of keys) {
    if (current && typeof current === 'object' && key in current) {
      current = current[key];
    } else {
      return path; // Return the key if not found
    }
  }
  
  return typeof current === 'string' ? current : path;
};

// Parameter replacement function
const replaceParams = (text: string, params: Record<string, string | number>): string => {
  return Object.entries(params).reduce((acc, [key, value]) => {
    return acc.replace(new RegExp(`{{${key}}}`, 'g'), String(value));
  }, text);
};

// Hook implementation
export const useTranslation = (): TranslationContextType => {
  const [locale, setLocaleState] = useState<SupportedLocale>('it');
  const [translations, setTranslations] = useState<Translations>(defaultTranslations.it);
  const [isLoading, setIsLoading] = useState(false);

  // Load locale from localStorage on mount
  useEffect(() => {
    const savedLocale = localStorage.getItem('gameall-locale') as SupportedLocale;
    if (savedLocale && availableLocales.some(l => l.code === savedLocale)) {
      setLocaleState(savedLocale);
    } else {
      // Detect browser language
      const browserLang = navigator.language.split('-')[0] as SupportedLocale;
      if (availableLocales.some(l => l.code === browserLang)) {
        setLocaleState(browserLang);
      }
    }
  }, []);

  // Load translations when locale changes
  useEffect(() => {
    loadTranslations(locale);
  }, [locale]);

  const loadTranslations = async (targetLocale: SupportedLocale) => {
    setIsLoading(true);
    
    try {
      // In a real app, you might load translations from an API
      // For now, we use the default translations
      await new Promise(resolve => setTimeout(resolve, 300)); // Simulate loading
      
      setTranslations(defaultTranslations[targetLocale]);
    } catch (error) {
      console.error('Error loading translations:', error);
      // Fallback to default locale
      setTranslations(defaultTranslations.it);
    } finally {
      setIsLoading(false);
    }
  };

  const setLocale = (newLocale: SupportedLocale) => {
    setLocaleState(newLocale);
    localStorage.setItem('gameall-locale', newLocale);
    
    // Update document language
    document.documentElement.lang = newLocale;
    
    // Update currency format based on locale
    const currencyMap: Record<SupportedLocale, string> = {
      it: 'EUR',
      en: 'USD',
      es: 'EUR',
      fr: 'EUR',
      de: 'EUR'
    };
    
    // Store currency preference
    localStorage.setItem('gameall-currency', currencyMap[newLocale]);
  };

  const t = (key: string, params?: Record<string, string | number>): string => {
    let translation = getNestedValue(translations, key);
    
    // If translation not found in current locale, fallback to Italian
    if (translation === key && locale !== 'it') {
      translation = getNestedValue(defaultTranslations.it, key);
    }
    
    // Replace parameters if provided
    if (params) {
      translation = replaceParams(translation, params);
    }
    
    return translation;
  };

  return {
    locale,
    setLocale,
    t,
    isLoading,
    availableLocales
  };
};

// Export context (for potential Context API usage)
export const TranslationContext = createContext<TranslationContextType | null>(null);