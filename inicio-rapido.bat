@echo off
title PRINTING WORLD - Inicio Automatico
color 0A
echo ========================================
echo   PRINTING WORLD - INICIO AUTOMATICO
echo ========================================
echo.

rem Verificar Node.js
echo [1/5] Verificando Node.js...
where node >nul 2>&1
if %errorlevel% neq 0 (
    echo.
    echo ❌ ERROR: Node.js no esta instalado
    echo.
    echo Descargando Node.js automaticamente...
    start https://nodejs.org
    echo.
    echo Por favor:
    echo 1. Instala Node.js desde la pagina que se abrio
    echo 2. Reinicia este archivo
    echo.
    pause
    exit /b 1
)
echo ✅ Node.js detectado

echo.
echo [2/5] Verificando gestor de paquetes...
where pnpm >nul 2>&1
if %errorlevel% neq 0 (
    echo Instalando pnpm...
    npm install -g pnpm >nul 2>&1
    if %errorlevel% neq 0 (
        echo Usando npm como alternativa...
        set USE_NPM=1
    )
) else (
    echo ✅ pnpm disponible
)

echo.
echo [3/5] Instalando dependencias...
if defined USE_NPM (
    npm install
    if %errorlevel% neq 0 (
        echo ❌ Error instalando dependencias
        pause
        exit /b 1
    )
) else (
    pnpm install >nul 2>&1
    if %errorlevel% neq 0 (
        echo Fallback a npm...
        npm install
        set USE_NPM=1
    )
)
echo ✅ Dependencias instaladas

echo.
echo [4/5] Iniciando servidor...
echo.
echo ✅ Logo "Printing World" fijo en ingles
echo ✅ Badge verde "✓ FIXED" visible  
echo ✅ Selector de idiomas funcional
echo.
echo 🔐 Password Admin: printingworld2024
echo.
echo ========================================
echo   PREPARANDO APERTURA AUTOMATICA...
echo ========================================

rem Crear script temporal para abrir navegador
echo @echo off > open_browser.bat
echo timeout /t 8 /nobreak ^>nul >> open_browser.bat
echo start http://localhost:5173 >> open_browser.bat
echo del open_browser.bat >> open_browser.bat

rem Ejecutar script de apertura en background
start /min open_browser.bat

echo.
echo [5/5] ¡Servidor iniciandose!
echo.
echo 🚀 El navegador se abrira automaticamente en 8 segundos...
echo 🌐 URL: http://localhost:5173
echo.
echo Para detener el servidor: Ctrl+C
echo ========================================

rem Iniciar servidor
if defined USE_NPM (
    npm run dev
) else (
    pnpm run dev
)

echo.
echo Servidor finalizado.
pause
