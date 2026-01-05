Write-Host "🚀 Starting Dev Service Manager..." -ForegroundColor Cyan
Write-Host ""

# Check if node_modules exists
if (-not (Test-Path "node_modules")) {
    Write-Host "📦 Installing dependencies..." -ForegroundColor Yellow
    pnpm install
    Write-Host ""
}

# Build Electron files first
Write-Host "🔨 Building Electron backend..." -ForegroundColor Yellow
npx tsc -p tsconfig.electron.json

Write-Host "✨ Launching application in development mode..." -ForegroundColor Green
Write-Host ""
Write-Host "This will start:"
Write-Host "  - Vite dev server (React hot reload)"
Write-Host "  - TypeScript watch (Electron auto-recompile)"
Write-Host "  - Electron app window"
Write-Host ""
Write-Host "Press Ctrl+C to stop all processes" -ForegroundColor Gray
Write-Host ""

# Run development mode
pnpm dev
