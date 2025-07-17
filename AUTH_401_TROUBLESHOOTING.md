# 🔍 Troubleshooting 401 "Non autenticato" - GameAll

## 🎯 **Problema Analizzato**
**Error Log**: `GET /api/auth/me 401 in 0ms [ERROR] :: {"error":"Non autenticato"}`  
**Causa**: L'utente non ha un token di autenticazione valido o i cookie non vengono gestiti correttamente

---

## 🔍 **Debug Tools Implementati**

### 1. **Endpoint Debug** `/api/auth/debug`
```bash
# Test dello stato autenticazione
curl http://localhost:5000/api/auth/debug

# Risposta esempio:
{
  "timestamp": "2024-01-15T10:30:00.000Z",
  "cookies": {
    "hasAuthToken": false,
    "tokenLength": 0,
    "allCookies": []
  },
  "headers": {
    "hasAuthHeader": false,
    "userAgent": "Mozilla/5.0...",
    "origin": "http://localhost:5173"
  },
  "mockUsers": {
    "totalUsers": 0,
    "userIds": []
  }
}
```

### 2. **Enhanced Server Logging**
Il server ora logga dettagli completi per ogni tentativo di autenticazione:
```typescript
🔍 Auth Debug: {
  hasAuthHeader: false,
  hasCookieToken: false, 
  hasToken: false,
  cookieNames: [],
  userAgent: "Mozilla/5.0..."
}
❌ No token found - returning 401
```

### 3. **Frontend Debug Logging**
```typescript
🔍 Frontend: Checking auth status...
ℹ️ Frontend: User not authenticated (401)
🔍 Frontend Debug: {
  hasAuthCookie: false,
  cookieCount: 1,
  error: "Network error"
}
```

---

## 🛠️ **Fixes Implementati**

### 1. **Cookie Parser Aggiunto**
```typescript
// server/index.ts
import cookieParser from "cookie-parser";
app.use(cookieParser());
```

### 2. **Middleware Auth Migliorato**
```typescript
// Enhanced token detection
const authHeader = req.headers.authorization;
const cookieToken = req.cookies?.authToken;
const token = authHeader?.startsWith('Bearer ') 
  ? authHeader.slice(7) 
  : cookieToken;
```

### 3. **Frontend Error Handling**
```typescript
// Better retry logic
retry: (failureCount, error: any) => {
  if (error?.status === 401) return false; // Don't retry auth errors
  return failureCount < 2;
}
```

---

## 🔧 **Possibili Cause e Soluzioni**

### **Causa 1: Utente Mai Loggato**
- **Sintomo**: `totalUsers: 0` nel debug
- **Soluzione**: L'utente deve registrarsi o fare login

### **Causa 2: Token Scaduto**
- **Sintomo**: `hasAuthToken: true` ma `tokenInfo.valid: false`
- **Soluzione**: Implementare refresh token o re-login

### **Causa 3: Cookie Non Inviati**
- **Sintomo**: `hasCookieToken: false` ma utente dovrebbe essere loggato
- **Soluzioni**: 
  - Verificare configurazione CORS `credentials: true`
  - Controllare domain/path dei cookie
  - Verificare SameSite policy

### **Causa 4: Problemi CORS**
- **Sintomo**: Richieste bloccate da browser
- **Soluzione**: Aggiornare origine CORS nel server

---

## 🧪 **Testing e Debugging**

### **Step 1: Verificare Stato Server**
```bash
# 1. Test endpoint debug
curl http://localhost:5000/api/auth/debug

# 2. Test endpoint me (dovrebbe dare 401)
curl http://localhost:5000/api/auth/me
```

### **Step 2: Test Registrazione**
```bash
# Registra nuovo utente
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@test.com",
    "password": "TestPassword123",
    "firstName": "Test",
    "lastName": "User"
  }'
```

### **Step 3: Verificare Cookie**
```bash
# Dopo registrazione, verifica cookie con debug
curl -b "authToken=YOUR_TOKEN" http://localhost:5000/api/auth/debug
```

### **Step 4: Frontend Browser Debug**
```javascript
// Console browser
console.log('Cookies:', document.cookie);
console.log('Auth token:', document.cookie.includes('authToken'));

// Network tab: verifica se cookie vengono inviati nelle richieste
```

---

## 🔄 **Flusso di Autenticazione Corretto**

### **1. Registrazione**
```
POST /api/auth/register → Success → Auto-login → Set Cookie → Return User
```

### **2. Login**
```
POST /api/auth/login → Verify → Set Cookie → Return User
```

### **3. Check Auth**
```
GET /api/auth/me + Cookie → Verify Token → Return User
```

### **4. Protected Routes**
```
Any Protected Route + Cookie → Middleware → Success/401
```

---

## 📊 **Server Configuration**

### **Cookie Settings (Production)**
```typescript
const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production', // HTTPS only in prod
  sameSite: 'strict' as const,
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
};
```

### **CORS Configuration**
```typescript
app.use(cors({
  origin: process.env.NODE_ENV === 'production'
    ? ['https://gamesall.top', 'https://www.gamesall.top']
    : true,
  credentials: true, // ✅ Essential for cookies
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
}));
```

---

## 🚨 **Common Issues**

### **Issue 1: Chrome SameSite**
- **Problema**: Chrome blocca cookie SameSite
- **Fix**: Configurare `sameSite: 'none'` per dev o HTTPS

### **Issue 2: Domain Mismatch**
- **Problema**: Cookie set su domain diverso
- **Fix**: Verificare che frontend e backend siano stesso domain

### **Issue 3: Secure Flag**
- **Problema**: Secure cookie su HTTP
- **Fix**: `secure: false` in development

---

## 🔍 **Debugging Commands**

### **Development**
```bash
# Start server con debug
npm run dev

# Monitor logs in real-time
tail -f logs/server.log

# Test endpoints
curl -v http://localhost:5000/api/auth/debug
```

### **Production**
```bash
# Test su produzione
curl -v https://gamesall.top/api/auth/debug

# Verifica headers CORS
curl -v -H "Origin: https://gamesall.top" https://gamesall.top/api/auth/me
```

---

## ✅ **Status Checklist**

- ✅ **Cookie Parser**: Installato e configurato
- ✅ **Debug Endpoint**: `/api/auth/debug` attivo
- ✅ **Enhanced Logging**: Server e frontend
- ✅ **Error Handling**: Migliorato per 401
- ✅ **CORS**: Configurato con credentials
- ✅ **Retry Logic**: Non retry su auth errors

---

## 🎯 **Expected Results**

### **Dopo Registration/Login Successful:**
```javascript
// Debug endpoint dovrebbe mostrare:
{
  "cookies": { "hasAuthToken": true, "tokenLength": > 100 },
  "tokenInfo": { "valid": true, "userExists": true },
  "mockUsers": { "totalUsers": > 0 }
}

// /api/auth/me dovrebbe ritornare:
{
  "id": "user_123...",
  "email": "user@example.com", 
  "firstName": "John",
  "lastName": "Doe"
}
```

### **Logs Attesi:**
```
✅ Registration successful for: user@example.com
✅ Authentication successful for: user@example.com
✅ Frontend: User authenticated: user@example.com
```

---

**Il sistema ora ha debug completo per risolvere qualsiasi problema di autenticazione!** 🔍