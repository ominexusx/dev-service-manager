@echo off
setlocal

echo 🚀 Starting Dev Service Manager...
echo.

REM Check if node_modules exists
if not exist "node_modules" (
    echo 📦 Installing dependencies...
    call pnpm install
    echo.
)

REM Build Electron files first
echo 🔨 Building Electron backend...
call npx tsc -p tsconfig.electron.json

echo ✨ Launching application in development mode...
echo.
echo This will start:
echo   - Vite dev server (React hot reload)
echo   - TypeScript watch (Electron auto-recompile)
echo   - Electron app window
echo.
echo Press Ctrl+C to stop all processes
echo.

REM Run development mode
call pnpm dev

endlocal
