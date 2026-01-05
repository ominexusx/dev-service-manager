Write-Host "🚀 Building Dev Service Manager..." -ForegroundColor Cyan
Write-Host ""

# Check if node_modules exists
if (-not (Test-Path "node_modules")) {
    Write-Host "📦 Installing dependencies..." -ForegroundColor Yellow
    pnpm install
    Write-Host ""
}

# Clean dist and release folders
Write-Host "🧹 Cleaning previous builds..." -ForegroundColor Yellow
if (Test-Path "dist") { Remove-Item -Recurse -Force "dist" }
if (Test-Path "release") { Remove-Item -Recurse -Force "release" }

# Build the app
Write-Host "📦 Packaging application for Windows..." -ForegroundColor Green
Write-Host "This may take a few minutes..."
Write-Host ""

# Run the package script
pnpm package

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "✅ Build complete!" -ForegroundColor Green
    Write-Host "You can find the installer in the 'release' folder." -ForegroundColor Cyan
    Invoke-Item "release"
}
else {
    Write-Host ""
    Write-Host "❌ Build failed!" -ForegroundColor Red
}
