@echo off
:: 🧹 Script Automatico Windows - Pulizia e Aggiornamento Codice
:: Repository: https://github.com/gameall123/Gameall123-new

echo 🚀 Inizio pulizia automatica del codice...

:: Check if we're in a git repository
if not exist ".git" (
    echo ❌ Non sei in un repository Git! Clona prima il repository:
    echo git clone https://github.com/gameall123/Gameall123-new.git
    echo cd Gameall123-new
    pause
    exit /b 1
)

echo ℹ️ Repository Git trovato, procedo con la pulizia...

:: 1. CREATE DOCS STRUCTURE
echo ℹ️ Creazione struttura documentazione...
mkdir docs\old 2>nul

:: Create docs README (simplified for Windows)
echo # Documentazione Gameall123 > docs\README.md
echo. >> docs\README.md
echo ## 📁 Struttura Documentazione >> docs\README.md
echo. >> docs\README.md
echo ### File Principali >> docs\README.md
echo - [API Documentation](../API_DOCUMENTATION.md) - Documentazione delle API >> docs\README.md
echo - [Implementation Summary](../IMPLEMENTATION_SUMMARY.md) - Riassunto implementazione >> docs\README.md
echo - [New Auth System](../NEW_AUTH_SYSTEM_DOCS.md) - Sistema di autenticazione >> docs\README.md

echo ✅ Creata documentazione strutturata

:: 2. MOVE DOCUMENTATION FILES
echo ℹ️ Spostamento file di documentazione...

:: Move obsolete files to docs/old/
for %%f in (ADMIN_USER_CREATION_SUMMARY.md AUTH_401_TROUBLESHOOTING.md CHECKBOX_FIX_DOCS.md ERROR_DIAGNOSIS_SOLUTION.md LOGIN_SUCCESS_SUMMARY.md LOGIN_TEST_GUIDE.md POST_REGISTRATION_ERROR_FIX.md) do (
    if exist "%%f" (
        move "%%f" "docs\old\" >nul
        echo ✅ Spostato %%f in docs\old\
    )
)

:: Move deployment docs to docs/
for %%f in (CARICAMENTO_GITHUB.md DEPLOYMENT_v2.1_COMPLETATO.md VERIFICA_IMPLEMENTAZIONE_v2.1.md) do (
    if exist "%%f" (
        move "%%f" "docs\" >nul
        echo ✅ Spostato %%f in docs\
    )
)

:: 3. REMOVE UNNECESSARY FILES
echo ℹ️ Rimozione file inutili...

:: Remove compiled files
for %%f in (index.js upload_github_clean.js) do (
    if exist "%%f" (
        del "%%f" >nul
        echo ✅ Rimosso %%f
    )
)

:: Remove build directories
for %%d in (build public\assets) do (
    if exist "%%d" (
        rmdir /s /q "%%d" >nul 2>&1
        echo ✅ Rimossa cartella %%d\
    )
)

:: Remove unused React components
for %%f in (client\src\components\AchievementSystem.tsx client\src\components\AnalyticsDashboard.tsx client\src\components\AIChatbot.tsx) do (
    if exist "%%f" (
        del "%%f" >nul
        echo ✅ Rimosso componente %%f
    )
)

:: 4. CREATE TYPESCRIPT DEFINITIONS
echo ℹ️ Creazione definizioni TypeScript...
mkdir server\types 2>nul

echo declare global { > server\types\express.d.ts
echo   namespace Express { >> server\types\express.d.ts
echo     interface User { >> server\types\express.d.ts
echo       id: string; >> server\types\express.d.ts
echo       email: string; >> server\types\express.d.ts
echo       password: string; >> server\types\express.d.ts
echo       firstName: string; >> server\types\express.d.ts
echo       lastName: string; >> server\types\express.d.ts
echo       avatar?: string; >> server\types\express.d.ts
echo       isAdmin: boolean; >> server\types\express.d.ts
echo       emailVerified: boolean; >> server\types\express.d.ts
echo       lastLoginAt: Date; >> server\types\express.d.ts
echo       createdAt: Date; >> server\types\express.d.ts
echo       updatedAt: Date; >> server\types\express.d.ts
echo       loginAttempts: number; >> server\types\express.d.ts
echo       lockUntil?: Date; >> server\types\express.d.ts
echo     } >> server\types\express.d.ts
echo     interface Request { >> server\types\express.d.ts
echo       user?: User; >> server\types\express.d.ts
echo     } >> server\types\express.d.ts
echo   } >> server\types\express.d.ts
echo } >> server\types\express.d.ts
echo. >> server\types\express.d.ts
echo export {}; >> server\types\express.d.ts

echo ✅ Creato server\types\express.d.ts

:: 5. UPDATE .GITIGNORE
echo ℹ️ Aggiornamento .gitignore...

findstr /C:"# Compiled files" .gitignore >nul 2>&1
if errorlevel 1 (
    echo. >> .gitignore
    echo # Compiled files >> .gitignore
    echo build >> .gitignore
    echo *.js >> .gitignore
    echo !postcss.config.js >> .gitignore
    echo !vite.config.ts >> .gitignore
    echo ✅ Aggiornato .gitignore
) else (
    echo ℹ️ .gitignore già aggiornato
)

:: 6. CREATE REPORTS
echo ℹ️ Creazione report di pulizia...

echo # Report di Pulizia e Aggiornamento Codice > PULIZIA_CODICE_REPORT.md
echo. >> PULIZIA_CODICE_REPORT.md
echo ## Data: %date% >> PULIZIA_CODICE_REPORT.md
echo. >> PULIZIA_CODICE_REPORT.md
echo ## ✅ OPERAZIONE COMPLETATA CON SUCCESSO >> PULIZIA_CODICE_REPORT.md
echo. >> PULIZIA_CODICE_REPORT.md
echo **🤖 Pulizia eseguita automaticamente tramite script Windows** >> PULIZIA_CODICE_REPORT.md

echo # 🎉 Riepilogo Finale - Pulizia e Aggiornamento Codice > RIEPILOGO_FINALE.md
echo. >> RIEPILOGO_FINALE.md
echo ## ✅ MISSIONE COMPLETATA! >> RIEPILOGO_FINALE.md
echo. >> RIEPILOGO_FINALE.md
echo **🤖 Pulizia eseguita automaticamente tramite script Windows** >> RIEPILOGO_FINALE.md
echo **📅 Data: %date%** >> RIEPILOGO_FINALE.md

echo ✅ Creati report di pulizia

:: 7. CHECK STATUS
echo ℹ️ Verifica modifiche...
echo.
echo 📈 RIEPILOGO MODIFICHE:
echo ======================
git status --porcelain 2>nul

:: 8. COMMIT AND PUSH
echo.
set /p answer="🚀 Vuoi committare e pushare le modifiche su GitHub? (y/N): "
if /i "%answer%"=="y" (
    echo ℹ️ Commit delle modifiche...
    
    git add .
    git commit -m "🧹 Pulizia e aggiornamento codice completo - Windows

✅ Operazioni completate:
- Rimossi file compilati e inutili
- Organizzata documentazione in docs/
- Fix configurazioni TypeScript
- Aggiornato .gitignore
- Rimossi componenti React non utilizzati

🎯 Risultati:
- Codice più pulito e organizzato
- Documentazione strutturata
- Performance migliorata

🤖 Pulizia eseguita automaticamente tramite script Windows"

    echo ✅ Commit creato con successo!
    
    echo ℹ️ Push su GitHub...
    git push origin main
    
    if errorlevel 0 (
        echo ✅ SUCCESSO! Modifiche salvate su GitHub
        echo.
        echo 🎉 PULIZIA COMPLETATA CON SUCCESSO!
        echo 🔗 Controlla le modifiche su: https://github.com/gameall123/Gameall123-new
    ) else (
        echo ❌ Errore durante il push. Controlla le credenziali Git.
    )
) else (
    echo ⏸️ Commit non eseguito. Le modifiche sono pronte.
    echo.
    echo 🔧 Per committare manualmente:
    echo git add .
    echo git commit -m "🧹 Pulizia codice automatica"
    echo git push origin main
)

echo.
echo ✨ Script completato!
echo 📁 Controlla i file PULIZIA_CODICE_REPORT.md e RIEPILOGO_FINALE.md per i dettagli
pause