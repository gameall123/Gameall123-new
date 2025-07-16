# Correzioni Redirect - Problema "Aggiungi" 

## Problema Identificato
Quando l'utente cliccava sul pulsante "Aggiungi" senza essere autenticato, veniva reindirizzato a `https://gamesall.top/api/login` invece della pagina di login del frontend.

## Causa del Problema
Il codice utilizzava `window.location.href = '/api/login'` in diversi componenti, ma `/api/login` è un endpoint API del backend, non una pagina del frontend.

## Correzioni Effettuate
Ho corretto tutti i redirect da `/api/login` a `/auth` nei seguenti file:

### 1. client/src/components/ProductCard.tsx
- **Linea 50**: `handleAddToCart()` - Corretto redirect quando utente non autenticato
- **Linea 66**: `handleWishlist()` - Corretto redirect quando utente non autenticato

### 2. client/src/pages/Profile.tsx
- **Linea 155**: Pulsante "Accedi" nella pagina profilo

### 3. client/src/pages/Landing.tsx
- **Linea 71**: Pulsante "Inizia Subito" 
- **Linea 78**: Pulsante "Accedi"
- **Linea 136**: Pulsante "Aggiungi" sui prodotti in vetrina

### 4. client/src/pages/OrdersPage.tsx
- **Linea 161**: Pulsante "Accedi ora" per visualizzare ordini

### 5. client/src/pages/Orders.tsx
- **Linea 138**: Pulsante "Accedi" per visualizzare ordini

### 6. client/src/pages/AdminDashboard.tsx
- **Linea 105**: Redirect automatico quando utente non è admin

### 7. client/src/components/CartSlideout.tsx
- **Linea 31**: `handleCheckout()` - Redirect quando utente non autenticato

### 8. client/src/components/AuthModals.tsx
- **Linea 32**: `handleLogin()` - Redirect per login Replit
- **Linea 43**: `handleRegisterSubmit()` - Redirect per registrazione

## Risultato
Ora quando l'utente clicca "Aggiungi" senza essere autenticato, viene correttamente reindirizzato alla pagina `/auth` del frontend invece che all'endpoint API `/api/login`.

## Test
Per testare la correzione:
1. Aprire il sito senza essere autenticati
2. Cliccare su "Aggiungi" su qualsiasi prodotto
3. Verificare che si viene reindirizzati a `/auth` e non a `/api/login`

## Build
Il progetto è stato ricostruito con `npm run build` per applicare tutte le correzioni.