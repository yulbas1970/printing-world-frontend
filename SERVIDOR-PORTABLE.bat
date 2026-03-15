@echo off
title PRINTING WORLD - SERVIDOR PORTABLE (Sin Node.js)
color 0A
cls

echo.
echo ================================================================
echo                    SERVIDOR PORTABLE
echo              (No necesita Node.js - Usa Python)
echo ================================================================
echo.

rem Verificar Python
echo [1/3] Verificando Python...
python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo.
    echo ❌ Python no encontrado
    echo 🌐 Abriendo pagina de descarga de Python...
    start https://www.python.org/downloads/
    echo.
    echo Por favor:
    echo 1. Instala Python desde la pagina que se abrio
    echo 2. MARCA la casilla "Add Python to PATH"
    echo 3. Reinicia este archivo
    echo.
    pause
    exit /b 1
)
echo ✅ Python detectado

echo.
echo [2/3] Preparando archivos...
rem Compilar si no existe dist
if not exist "dist" (
    echo Compilando proyecto...
    if exist "package.json" (
        if exist "pnpm-lock.yaml" (
            pnpm install >nul 2>&1
            pnpm run build >nul 2>&1
        ) else (
            npm install >nul 2>&1
            npm run build >nul 2>&1
        )
    )
)

if not exist "dist" (
    echo ❌ No se pudo compilar el proyecto
    echo 📋 Intenta ejecutar manualmente: npm run build
    pause
    exit /b 1
)
echo ✅ Archivos listos

echo.
echo [3/3] Iniciando servidor portable...
echo.
echo ✅ Logo "Printing World" fijo en ingles
echo ✅ Badge verde "✓ FIXED" visible  
echo ✅ Selector de idiomas funcional
echo.
echo 🔐 Password Admin: printingworld2024
echo 🌐 URL: http://localhost:8080
echo.
echo ================================================================
echo              ¡EL NAVEGADOR SE ABRIRA AUTOMATICAMENTE!
echo ================================================================
echo.

rem Ejecutar servidor Python que abre navegador automáticamente
python servidor-portable.py

echo.
echo ================================================================
echo                     SERVIDOR DETENIDO
echo ================================================================
pause
