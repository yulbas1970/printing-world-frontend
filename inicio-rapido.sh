#!/bin/bash
echo "========================================"
echo "  PRINTING WORLD - INICIO AUTOMATICO"
echo "========================================"
echo ""

# Verificar Node.js
if ! command -v node &> /dev/null; then
    echo "ERROR: Node.js no está instalado"
    echo "Por favor instala Node.js desde: https://nodejs.org"
    echo ""
    echo "Abriendo página de descarga..."
    if command -v open &> /dev/null; then
        open https://nodejs.org  # macOS
    elif command -v xdg-open &> /dev/null; then
        xdg-open https://nodejs.org  # Linux
    fi
    exit 1
fi

echo "✅ Node.js detectado"
echo ""

# Verificar/instalar pnpm
if ! command -v pnpm &> /dev/null; then
    echo "Instalando pnpm..."
    npm install -g pnpm
    if [ $? -ne 0 ]; then
        echo "Error instalando pnpm, usando npm..."
        usar_npm=true
    fi
fi

if [ "$usar_npm" != "true" ]; then
    echo "✅ pnpm listo"
    echo ""
    echo "📦 Instalando dependencias..."
    pnpm install
    if [ $? -ne 0 ]; then
        usar_npm=true
    fi
fi

if [ "$usar_npm" = "true" ]; then
    echo ""
    echo "📦 Usando npm como alternativa..."
    npm install
    if [ $? -ne 0 ]; then
        echo "ERROR: No se pudieron instalar las dependencias"
        exit 1
    fi
fi

echo ""
echo "🚀 Iniciando servidor..."
echo "🌐 Tu página se abrirá automáticamente en 5 segundos..."
echo ""
echo "✅ Logo \"Printing World\" fijo en inglés"
echo "✅ Badge verde \"✓ FIXED\" visible"
echo "✅ Selector de idiomas funcional"
echo ""
echo "🔐 Password Admin: printingworld2024"
echo ""
echo "Para detener el servidor: Ctrl+C"
echo "========================================"

# Esperar 5 segundos y abrir navegador
sleep 5
if command -v open &> /dev/null; then
    open http://localhost:5173  # macOS
elif command -v xdg-open &> /dev/null; then
    xdg-open http://localhost:5173  # Linux
fi

# Iniciar servidor
if [ "$usar_npm" = "true" ]; then
    npm run dev
else
    pnpm run dev
fi
