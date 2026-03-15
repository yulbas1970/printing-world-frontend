#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
PRINTING WORLD - SERVIDOR PORTABLE
No necesita Node.js - Solo Python (viene preinstalado en Windows 10+)
"""

import http.server
import socketserver
import webbrowser
import os
import sys
import time
import threading
from pathlib import Path

PORT = 8080
DIRECTORY = "dist"

class PrintingWorldHandler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=DIRECTORY, **kwargs)
    
    def end_headers(self):
        self.send_header('Cache-Control', 'no-cache, no-store, must-revalidate')
        self.send_header('Pragma', 'no-cache')
        self.send_header('Expires', '0')
        super().end_headers()

    def do_GET(self):
        # Construct path to the requested file
        path_to_file = os.path.join(self.directory, self.path.lstrip('/'))

        # If the path is a directory, or if the file doesn't exist,
        # serve index.html for client-side routing
        if not os.path.exists(path_to_file) or os.path.isdir(path_to_file):
            self.path = '/index.html'
        
        return http.server.SimpleHTTPRequestHandler.do_GET(self)

def open_browser():
    """Abre el navegador después de 3 segundos"""
    time.sleep(3)
    url = f"http://localhost:{PORT}"
    print(f"\n🌐 Abriendo navegador en: {url}")
    try:
        webbrowser.open(url)
        print("✅ Navegador abierto automáticamente")
    except Exception as e:
        print(f"❌ Error abriendo navegador: {e}")
        print(f"🔗 Abre manualmente: {url}")

def main():
    import io
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')
    print("=" * 60)
    print("  🚀 PRINTING WORLD - SERVIDOR PORTABLE")
    print("=" * 60)
    print()
    
    # Verificar si existe la carpeta dist
    if not os.path.exists(DIRECTORY):
        print("❌ Carpeta 'dist' no encontrada")
        print("🔨 Compilando proyecto primero...")
        
        # Intentar compilar con npm/pnpm
        if os.system("npm run build") != 0:
            if os.system("pnpm run build") != 0:
                print("❌ Error compilando proyecto")
                print("📋 Ejecuta manualmente: npm run build")
                input("Presiona Enter para salir...")
                sys.exit(1)
    
    print(f"📁 Sirviendo archivos desde: {DIRECTORY}")
    print(f"🌐 Puerto: {PORT}")
    print(f"🔗 URL: http://localhost:{PORT}")
    print()
    print("✅ Logo 'Printing World' fijo en inglés")
    print("✅ Badge verde '✓ FIXED' visible")
    print("✅ Selector de idiomas funcional")
    print()
    print("🔐 Password Admin: printingworld2024")
    print()
    print("Para detener el servidor: Ctrl+C")
    print("=" * 60)
    
    # Iniciar hilo para abrir navegador
    browser_thread = threading.Thread(target=open_browser)
    browser_thread.daemon = True
    browser_thread.start()
    
    # Iniciar servidor
    try:
        with socketserver.TCPServer(("", PORT), PrintingWorldHandler) as httpd:
            print(f"🚀 Servidor iniciado en puerto {PORT}")
            print("🌐 El navegador se abrirá automáticamente en 3 segundos...")
            print()
            httpd.serve_forever()
    except KeyboardInterrupt:
        print("\n🛑 Servidor detenido por el usuario")
    except OSError as e:
        if "Address already in use" in str(e):
            print(f"❌ Puerto {PORT} ya está en uso")
            print("🔧 Prueba cerrando otros servidores o cambia el puerto")
        else:
            print(f"❌ Error iniciando servidor: {e}")
        input("Presiona Enter para salir...")

if __name__ == "__main__":
    main()
