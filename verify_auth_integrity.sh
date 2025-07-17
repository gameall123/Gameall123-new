#!/bin/bash

echo "🔍 Verifica completa autenticazione admin e integrità sistema..."

echo ""
echo "📁 1. Controllo file critici..."
required_files=(
  "server/auth.ts"
  "server/routes.ts"
  "server/types/express.d.ts"
  "server/middleware/debug.ts"
  "client/src/hooks/useAuth.tsx"
  "client/src/components/AdminErrorBoundary.tsx"
  "test_auth.js"
)

for file in "${required_files[@]}"; do
  if [ -f "$file" ]; then
    echo "✅ $file"
  else
    echo "❌ Manca: $file"
  fi
done

echo ""
echo "🧪 2. Verifica TypeScript (compilazione statica)..."
if npx tsc --noEmit > /dev/null 2>&1; then
  echo "✅ Compilazione TypeScript riuscita"
else
  echo "❌ Errori TypeScript rilevati"
fi

echo ""
echo "🔐 3. Test JWT con test_auth.js..."
if node test_auth.js > /dev/null 2>&1; then
  echo "✅ JWT test superato"
else
  echo "❌ Errore nel test JWT"
fi

echo ""
echo "🗄️ 4. Verifica connessione a Prisma DB..."
if npx prisma db pull > /dev/null 2>&1; then
  echo "✅ Connessione DB riuscita"
else
  echo "❌ Errore nella connessione Prisma DB"
fi

echo ""
echo "🧬 5. Verifica schema utente admin..."
expected_fields=(id email password firstName lastName isAdmin emailVerified lastLoginAt loginAttempts createdAt updatedAt)
schema_ok=true
for field in "${expected_fields[@]}"; do
  if grep -q "$field" server/types/express.d.ts; then
    echo "✅ Campo $field trovato"
  else
    echo "❌ Campo $field mancante in express.d.ts"
    schema_ok=false
  fi
done

echo ""
echo "🛡️ 6. Verifica middleware di debug..."
if grep -q "debugAuth" server/middleware/debug.ts && grep -q "adminErrorHandler" server/middleware/debug.ts; then
  echo "✅ Middleware debugAuth e adminErrorHandler presenti"
else
  echo "❌ Middleware mancanti o incompleti"
fi

echo ""
echo "🌐 7. Controllo routes admin..."
if grep -q "app.get('/admin" server/routes.ts || grep -q "router.get('/admin" server/routes.ts; then
  if grep -q "authenticate" server/routes.ts; then
    echo "✅ Rotte admin protette da middleware"
  else
    echo "❌ Rotte admin NON protette da authenticate"
  fi
else
  echo "⚠️ Nessuna rotta '/admin' trovata"
fi

echo ""
echo "🔁 8. Test manuale consigliato:"
echo "   ▶ Esegui: curl -H 'Authorization: Bearer <token>' http://localhost:3000/admin"
echo "   ▶ Verifica risposta e log console (userId, isAdmin)"

echo ""
echo "⚙️ 9. Verifica variabili d'ambiente..."
if grep -q "JWT_SECRET=" .env; then
  echo "✅ JWT_SECRET definito in .env"
else
  echo "❌ JWT_SECRET mancante in .env"
fi

echo ""
echo "🧼 10. Suggerimenti extra:"
echo "   ▶ Esegui: npx prisma generate"
echo "   ▶ Pulisci: rm -rf dist && tsc"
echo "   ▶ Riavvia il server dopo i test"

echo ""
echo "🟢 Verifica completata."
