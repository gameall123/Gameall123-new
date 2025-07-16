# 📋 GameAll API Documentation

Documentazione completa delle API REST e WebSocket per la piattaforma e-commerce gaming GameAll.

## 🚀 Base URL
```
http://localhost:5000/api
```

## 🔐 Autenticazione

La maggior parte degli endpoint richiede autenticazione tramite sessione. L'utente deve essere loggato tramite Replit OAuth.

```javascript
// Headers richiesti per richieste autenticate
{
  "Content-Type": "application/json",
  "Cookie": "session_cookie_from_auth"
}
```

---

## 📦 **Prodotti & Catalogo**

### GET `/api/products`
Recupera la lista di tutti i prodotti attivi.

**Query Parameters:**
- `category` (optional): Filtra per categoria
- `search` (optional): Ricerca testuale nel nome/descrizione
- `sort` (optional): `price_asc`, `price_desc`, `name`, `newest`

**Response:**
```json
[
  {
    "id": 1,
    "name": "Cyberpunk 2077",
    "description": "Gioco di ruolo futuristico",
    "price": 59.99,
    "imageUrl": "/uploads/cyberpunk.jpg",
    "category": "RPG",
    "stock": 100,
    "isActive": true,
    "createdAt": "2024-01-01T00:00:00Z"
  }
]
```

### GET `/api/products/:id`
Recupera dettagli di un prodotto specifico.

**Response:**
```json
{
  "id": 1,
  "name": "Cyberpunk 2077",
  "description": "Gioco di ruolo futuristico ambientato nel 2077",
  "price": 59.99,
  "imageUrl": "/uploads/cyberpunk.jpg",
  "category": "RPG",
  "stock": 100,
  "averageRating": 4.2,
  "reviewCount": 15
}
```

### POST `/api/products` 🔒 Admin
Crea un nuovo prodotto (solo amministratori).

**Body:**
```json
{
  "name": "Nome Gioco",
  "description": "Descrizione del gioco",
  "price": 49.99,
  "category": "Azione",
  "stock": 50,
  "imageUrl": "/uploads/image.jpg"
}
```

---

## 🤖 **Sistema Raccomandazioni**

### GET `/api/recommendations`
Ottieni raccomandazioni personalizzate di prodotti.

**Query Parameters:**
- `userId` (optional): ID utente per raccomandazioni personalizzate
- `productId` (optional): Escludi prodotto specifico dalle raccomandazioni  
- `category` (optional): Raccomandazioni per categoria specifica
- `limit` (default: 6): Numero massimo di raccomandazioni

**Response:**
```json
[
  {
    "id": 1,
    "name": "The Witcher 3",
    "price": 39.99,
    "imageUrl": "/uploads/witcher3.jpg",
    "category": "RPG",
    "stock": 25,
    "averageRating": 4.8,
    "reviewCount": 120,
    "recommendationReason": "personalized"
  }
]
```

**Tipi di raccomandazioni:**
- `personalized`: Basate sulla cronologia ordini dell'utente
- `category`: Prodotti della stessa categoria
- `popular`: Prodotti più ordinati
- `trending`: Prodotti nuovi con rating alto

---

## ⭐ **Sistema Recensioni**

### GET `/api/reviews`
Recupera recensioni con filtri avanzati.

**Query Parameters:**
- `search` (optional): Ricerca in nome prodotto o commento
- `rating` (optional): Filtra per numero stelle (1-5)
- `sort` (optional): `newest`, `oldest`, `highest`, `lowest`
- `productId` (optional): Recensioni per prodotto specifico
- `userId` (optional): Recensioni di utente specifico

**Response:**
```json
[
  {
    "id": 1,
    "productId": 1,
    "userId": "user123",
    "rating": 5,
    "comment": "Gioco fantastico!",
    "createdAt": "2024-01-15T10:30:00Z",
    "product": {
      "id": 1,
      "name": "Cyberpunk 2077",
      "imageUrl": "/uploads/cyberpunk.jpg"
    },
    "user": {
      "firstName": "Mario",
      "lastName": "Rossi",
      "profileImageUrl": "/uploads/avatar.jpg"
    }
  }
]
```

### GET `/api/reviews/user/:userId`
Recupera tutte le recensioni di un utente specifico.

### POST `/api/reviews` 🔒
Crea una nuova recensione (utente autenticato).

**Body:**
```json
{
  "productId": 1,
  "rating": 5,
  "comment": "Esperienza di gioco incredibile!"
}
```

### PUT `/api/reviews/:id` 🔒
Modifica una recensione esistente (solo proprietario o admin).

### DELETE `/api/reviews/:id` 🔒
Elimina una recensione (solo proprietario o admin).

---

## 🎟️ **Sistema Coupon**

### GET `/api/coupons/validate/:code`
Valida un codice coupon e restituisce dettagli se valido.

**Response:**
```json
{
  "id": 1,
  "code": "WELCOME20",
  "discount": 20,
  "discountType": "percentage",
  "minAmount": 50.00,
  "maxUses": 100,
  "usedCount": 25,
  "isActive": true,
  "expiresAt": "2024-12-31T23:59:59Z"
}
```

**Errori:**
- `404`: Coupon non trovato
- `400`: Coupon scaduto, disattivo o limite usi raggiunto

### GET `/api/coupons` 🔒 Admin
Lista tutti i coupon (solo amministratori).

### POST `/api/coupons` 🔒 Admin
Crea un nuovo coupon.

**Body:**
```json
{
  "code": "BLACKFRIDAY",
  "discount": 30,
  "discountType": "percentage",
  "minAmount": 100.00,
  "maxUses": 500,
  "expiresAt": "2024-11-30T23:59:59Z"
}
```

---

## 🔔 **Sistema Notifiche**

### GET `/api/notifications/:userId` 🔒
Recupera tutte le notifiche di un utente.

**Response:**
```json
[
  {
    "id": 1,
    "userId": "user123",
    "title": "Ordine Spedito",
    "message": "Il tuo ordine #1234 è stato spedito!",
    "type": "success",
    "isRead": false,
    "createdAt": "2024-01-15T14:30:00Z"
  }
]
```

**Tipi di notifica:**
- `info`: Informazioni generali
- `success`: Operazioni completate con successo
- `warning`: Avvisi importanti
- `error`: Errori che richiedono attenzione

### POST `/api/notifications` 🔒
Crea una nuova notifica.

**Body:**
```json
{
  "userId": "user123",
  "title": "Nuova Offerta",
  "message": "Sconto del 50% su tutti i giochi RPG!",
  "type": "info"
}
```

### PUT `/api/notifications/:id/read` 🔒
Segna una notifica come letta.

### PUT `/api/notifications/:userId/read-all` 🔒
Segna tutte le notifiche di un utente come lette.

### DELETE `/api/notifications/:id` 🔒
Elimina una notifica.

---

## 🛒 **Carrello & Ordini**

### GET `/api/cart` 🔒
Recupera gli articoli nel carrello dell'utente autenticato.

### POST `/api/cart` 🔒
Aggiunge un articolo al carrello.

**Body:**
```json
{
  "productId": 1,
  "quantity": 2
}
```

### PUT `/api/cart/:id` 🔒
Aggiorna la quantità di un articolo nel carrello.

### DELETE `/api/cart/:id` 🔒
Rimuove un articolo dal carrello.

### POST `/api/orders` 🔒
Crea un nuovo ordine.

**Body:**
```json
{
  "total": "129.98",
  "couponCode": "WELCOME20",
  "discount": 25.99,
  "shippingAddress": {
    "firstName": "Mario",
    "lastName": "Rossi",
    "address": "Via Roma 123",
    "city": "Milano",
    "zipCode": "20100",
    "phone": "+39 123 456 7890"
  },
  "items": [
    {
      "productId": 1,
      "quantity": 2,
      "price": "59.99"
    }
  ]
}
```

### GET `/api/orders` 🔒
Recupera ordini dell'utente autenticato.

---

## 💬 **Live Chat WebSocket**

### Connessione WebSocket
```javascript
const ws = new WebSocket('ws://localhost:5000/ws/chat?userId=user123&roomId=support');
```

### Messaggi WebSocket

#### Unirsi a una stanza
```json
{
  "type": "join_room",
  "data": {
    "roomId": "support"
  }
}
```

#### Inviare un messaggio
```json
{
  "type": "send_message",
  "data": {
    "message": "Ciao, ho bisogno di aiuto con il mio ordine"
  }
}
```

#### Indicatori di digitazione
```json
{
  "type": "typing",
  "data": {}
}
```

```json
{
  "type": "stop_typing", 
  "data": {}
}
```

### Messaggi ricevuti dal server

#### Nuovo messaggio
```json
{
  "type": "new_message",
  "data": {
    "id": 123,
    "userId": "user456",
    "senderType": "user",
    "senderName": "Maria Bianchi",
    "message": "Grazie per l'aiuto!",
    "roomId": "support",
    "createdAt": "2024-01-15T15:45:00Z"
  }
}
```

#### Cronologia messaggi
```json
{
  "type": "message_history",
  "data": [
    // Array di messaggi precedenti
  ]
}
```

#### Utente che sta digitando
```json
{
  "type": "user_typing",
  "data": {
    "userId": "user123",
    "isTyping": true
  }
}
```

---

## 👥 **Gestione Utenti**

### GET `/api/user` 🔒
Recupera dati dell'utente autenticato.

### PUT `/api/user` 🔒
Aggiorna profilo utente.

**Body:**
```json
{
  "phone": "+39 123 456 7890",
  "bio": "Appassionato di gaming",
  "shippingAddress": {
    "firstName": "Mario",
    "lastName": "Rossi",
    "address": "Via Roma 123",
    "city": "Milano",
    "zipCode": "20100"
  }
}
```

---

## 🔧 **Amministrazione**

### GET `/api/admin/dashboard` 🔒 Admin
Statistiche dashboard amministratore.

**Response:**
```json
{
  "todayRevenue": 1250.50,
  "todayOrders": 15,
  "activeUsers": 234,
  "onlineUsers": 45
}
```

### GET `/api/admin/top-products` 🔒 Admin
Prodotti più venduti.

### GET `/api/admin/recent-orders` 🔒 Admin
Ordini recenti con dettagli utente.

---

## 🚫 **Codici di Errore**

| Codice | Significato |
|--------|-------------|
| 200 | Successo |
| 201 | Risorsa creata |
| 400 | Richiesta malformata |
| 401 | Non autenticato |
| 403 | Non autorizzato |
| 404 | Risorsa non trovata |
| 429 | Troppe richieste (rate limiting) |
| 500 | Errore interno server |

## 🔒 **Rate Limiting**

Limiti di richieste per prevenire abusi:

- **API generali**: 100 richieste/minuto per IP
- **Creazione recensioni**: 5 richieste/minuto per utente
- **Validazione coupon**: 10 richieste/minuto per IP
- **Notifiche**: 30 richieste/minuto per utente

## 📝 **Esempi di Utilizzo**

### Recuperare raccomandazioni personalizzate
```javascript
const response = await fetch('/api/recommendations?userId=user123&limit=6');
const recommendations = await response.json();
```

### Applicare un coupon
```javascript
// 1. Validare il coupon
const couponResponse = await fetch('/api/coupons/validate/WELCOME20');
const coupon = await couponResponse.json();

// 2. Applicare nel checkout
const orderData = {
  total: calculateTotal(),
  couponCode: coupon.code,
  discount: calculateDiscount(coupon),
  // ... altri dati ordine
};
```

### Connettersi alla live chat
```javascript
const ws = new WebSocket(`ws://localhost:5000/ws/chat?userId=${userId}&roomId=support`);

ws.onmessage = (event) => {
  const message = JSON.parse(event.data);
  if (message.type === 'new_message') {
    displayMessage(message.data);
  }
};

// Inviare un messaggio
ws.send(JSON.stringify({
  type: 'send_message',
  data: { message: 'Ciao!' }
}));
```

---

## 🔄 **Versionamento API**

Attualmente utilizziamo la versione `v1` (implicita). Future versioni saranno indicate nell'URL:
- `v1`: `/api/...` (attuale)
- `v2`: `/api/v2/...` (futuro)

## 🛠️ **Testing**

Per testare le API puoi utilizzare:
- **Postman**: Collection disponibile nel repository
- **cURL**: Esempi nella documentazione
- **Frontend**: Interfaccia completa già integrata

Ogni endpoint è testato e documentato per garantire affidabilità e facilità d'uso.

---

📄 **Documentazione aggiornata al:** Gennaio 2024  
🚀 **Versione GameAll:** 2.0 con funzionalità avanzate