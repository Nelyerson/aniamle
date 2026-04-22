@echo off
echo ==========================================
echo  WildBot RAG Server — Iniciando...
echo ==========================================
echo.

cd /d "%~dp0"

:: Verificar si node_modules existe
if not exist "node_modules" (
  echo [1/2] Instalando dependencias por primera vez...
  npm install
  echo.
)

echo [2/2] Iniciando servidor RAG con Groq...
echo.
echo Abre tu navegador en: http://localhost:3000
echo Presiona Ctrl+C para detener el servidor
echo.
node server.js
pause
