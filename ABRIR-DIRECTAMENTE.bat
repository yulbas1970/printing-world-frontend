@echo off
title PRINTING WORLD - APERTURA DIRECTA (Sin servidor)
color 0A
cls

echo.
echo ================================================================
echo                    APERTURA DIRECTA
echo               (No necesita servidor - Abre HTML)
echo ================================================================
echo.

echo [✅] Este metodo abre el archivo HTML directamente
echo [✅] No necesita instalar nada (Node.js, Python, etc.)
echo [✅] Funciona inmediatamente
echo [✅] Compatible con cualquier navegador
echo.
echo ================================================================

rem Verificar que existe el archivo HTML
if not exist "PRINTING-WORLD-STANDALONE.html" (
    echo ❌ Error: No se encuentra PRINTING-WORLD-STANDALONE.html
    echo.
    echo Asegurate de que este archivo este en la misma carpeta que:
    echo - PRINTING-WORLD-STANDALONE.html
    echo.
    pause
    exit /b 1
)

echo ✅ Archivo HTML encontrado
echo.
echo 🚀 Abriendo Printing World en tu navegador...
echo.
echo ================================================================
echo                    INFORMACION IMPORTANTE
echo ================================================================
echo.
echo ✅ Logo "Printing World" fijo en ingles
echo ✅ Badge verde "✓ FIXED" visible  
echo ✅ Selector de idiomas funcional
echo ✅ Version standalone completa
echo.
echo 🔐 Password Admin: printingworld2024
echo 🌐 Version: Standalone HTML
echo.
echo ================================================================
echo              ¡ABRIENDO EN 3 SEGUNDOS!
echo ================================================================
echo.

rem Countdown
echo 3...
timeout /t 1 /nobreak >nul
echo 2...
timeout /t 1 /nobreak >nul  
echo 1...
timeout /t 1 /nobreak >nul
echo.
echo 🌐 ¡ABRIENDO AHORA!

rem Abrir el archivo HTML directamente
start "" "PRINTING-WORLD-STANDALONE.html"

echo.
echo ================================================================
echo                      ¡ARCHIVO ABIERTO!
echo ================================================================
echo.
echo Si no se abrio automaticamente:
echo 1. Busca el archivo "PRINTING-WORLD-STANDALONE.html"
echo 2. Haz doble clic en el
echo 3. O arrastralo a tu navegador
echo.
echo ¡Listo! Ya tienes tu web funcionando sin servidor.
echo.
pause
