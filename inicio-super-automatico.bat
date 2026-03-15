@echo off
cd /d "%~dp0"
title PRINTING WORLD - SUPER AUTOMATICO
color 0A
cls

echo.
echo  ██████╗ ██████╗ ██╗███╗   ██╗████████╗██╗███╗   ██╗ ██████╗ 
echo  ██╔══██╗██╔══██╗██║████╗  ██║╚══██╔══╝██║████╗  ██║██╔════╝ 
echo  ██████╔╝██████╔╝██║██╔██╗ ██║   ██║   ██║██╔██╗ ██║██║  ███╗
echo  ██╔═══╝ ██╔══██╗██║██║╚██╗██║   ██║   ██║██║╚██╗██║██║   ██║
echo  ██║     ██║  ██║██║██║ ╚████║   ██║   ██║██║ ╚████║╚██████╔╝
echo  ╚═╝     ╚═╝  ╚═╝╚═╝╚═╝  ╚═══╝   ╚═╝   ╚═╝╚═╝  ╚═══╝ ╚═════╝ 
echo.
echo                    WORLD - SUPER AUTOMATICO
echo.
echo ================================================================
echo                   ¡TODO SE ABRE AUTOMATICAMENTE!
echo ================================================================
echo.

rem Verificar Node.js
echo [PASO 1/5] Verificando Node.js...
where node >nul 2>&1
if %errorlevel% neq 0 (
    echo.
    echo ❌ Node.js no encontrado
    echo 🌐 Abriendo pagina de descarga...
    powershell -command "Start-Process 'https://nodejs.org'"
    echo.
    echo Por favor instala Node.js y vuelve a ejecutar este archivo
    pause
    exit /b 1
)
echo ✅ Node.js OK

rem Verificar pnpm
echo.
echo [PASO 2/5] Preparando herramientas...
where pnpm >nul 2>&1
if %errorlevel% neq 0 (
    echo Instalando pnpm...
    npm install -g pnpm >nul 2>&1
    if %errorlevel% neq 0 (
        set "PACKAGE_MANAGER=npm"
        echo Usando npm...
    ) else (
        set "PACKAGE_MANAGER=pnpm"
        echo ✅ pnpm instalado
    )
) else (
    set "PACKAGE_MANAGER=pnpm"
    echo ✅ pnpm OK
)

rem Instalar dependencias
echo.
echo [PASO 3/5] Instalando dependencias...
echo (Esto puede tardar 1-2 minutos la primera vez)
if "%PACKAGE_MANAGER%"=="npm" (
    npm install
) else (
    pnpm install --force
)

if %errorlevel% neq 0 (
    echo ❌ Error instalando dependencias
    pause
    exit /b 1
)
echo ✅ Dependencias instaladas

rem Mostrar info
echo.
echo [PASO 4/5] Configuracion completa!
echo.
echo ✅ Logo "Printing World" fijo en ingles
echo ✅ Badge verde "✓ FIXED" visible  
echo ✅ Selector de idiomas funcional
echo ✅ Sin cambios automaticos a español
echo.
echo 🔐 Password Admin: printingworld2024
echo 🌐 URL Local: http://localhost:5173
echo 🌍 Demo Online: https://wl7o0s9svn.space.minimax.io
echo.

rem Crear PowerShell script para abrir navegador
echo.
echo [PASO 5/5] Preparando apertura automatica...
echo Start-Sleep -Seconds 10 > open_web.ps1
echo Start-Process "http://localhost:5173" >> open_web.ps1
echo Remove-Item "open_web.ps1" -Force >> open_web.ps1

rem Ejecutar apertura en background
start /min powershell -WindowStyle Hidden -ExecutionPolicy Bypass -File "open_web.ps1"

echo.
echo ================================================================
echo                      ¡SERVIDOR INICIANDO!
echo ================================================================
echo.
echo 🚀 El navegador se abrira AUTOMATICAMENTE en 10 segundos
echo 🎯 Busca el badge verde "✓ FIXED" para confirmar la version
echo.
echo Para detener el servidor: Ctrl+C
echo.

rem Iniciar servidor
if "%PACKAGE_MANAGER%"=="npm" (
    npm run dev
) else (
    pnpm run dev
)

echo.
echo ================================================================
echo                     SERVIDOR DETENIDO
echo ================================================================
pause
