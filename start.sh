#!/bin/bash

# Dev Service Manager - Quick Start Script

echo "🚀 Starting Dev Service Manager..."
echo ""

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    pnpm install
    echo ""
fi

# Build Electron files first
echo "🔨 Building Electron backend..."
npx tsc -p tsconfig.electron.json

echo "✨ Launching application in development mode..."
echo ""
echo "This will start:"
echo "  - Vite dev server (React hot reload)"
echo "  - TypeScript watch (Electron auto-recompile)"
echo "  - Electron app window"
echo ""
echo "Press Ctrl+C to stop all processes"
echo ""

# Run development mode with all processes
pnpm dev
