#!/usr/bin/env pwsh
# Backstage Docker Multi-stage Build Script
# This script builds the Backstage application using Docker multi-stage build

param(
    [string]$Tag = "backstage:multistage",
    [switch]$NoBuildKit = $false,
    [int]$Memory = 8192
)

Write-Host "🚀 Building Backstage with Docker multi-stage build..." -ForegroundColor Cyan
Write-Host "📦 Target image: $Tag" -ForegroundColor Green

# Enable Docker BuildKit for better caching and performance (unless disabled)
if (-not $NoBuildKit) {
    $env:DOCKER_BUILDKIT = "1"
    Write-Host "✅ Docker BuildKit enabled" -ForegroundColor Green
} else {
    Write-Host "⚠️  Docker BuildKit disabled" -ForegroundColor Yellow
}

# Build the Docker image
try {
    Write-Host "📋 Building Docker image..." -ForegroundColor Blue
    Write-Host "💾 Using Node.js memory limit: ${Memory}MB" -ForegroundColor Cyan
    docker image build . -f packages/backend/Dockerfile -t $Tag --build-arg NODE_OPTIONS="--max-old-space-size=$Memory"
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Build completed successfully!" -ForegroundColor Green
        Write-Host "🐳 To run the container:" -ForegroundColor Cyan
        Write-Host "   docker run -it -p 7007:7007 $Tag" -ForegroundColor White
    } else {
        Write-Host "❌ Build failed!" -ForegroundColor Red
        exit 1
    }
} catch {
    Write-Host "❌ Error occurred during build: $_" -ForegroundColor Red
    exit 1
}