# HealthVision AI - Firebase Hosting Deployment Script
# Run this in PowerShell to deploy your app

Write-Host ""
Write-Host "====================================================" -ForegroundColor Cyan
Write-Host "  HealthVision AI - Firebase Hosting Deployment" -ForegroundColor Cyan
Write-Host "====================================================" -ForegroundColor Cyan
Write-Host ""

# Step 1: Build the app
Write-Host "[Step 1/3] Building your app..." -ForegroundColor Yellow
Write-Host ""

npm run build

if ($LASTEXITCODE -ne 0) {
    Write-Host "Build failed!" -ForegroundColor Red
    Read-Host "Press Enter to exit"
    exit 1
}

Write-Host ""
Write-Host "====================================================" -ForegroundColor Cyan
Write-Host "[Step 2/3] Authenticating with Firebase..." -ForegroundColor Cyan
Write-Host "====================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "You will be asked to:" -ForegroundColor White
Write-Host "  1. Visit a URL in your browser" -ForegroundColor White
Write-Host "  2. Sign in with your Google account" -ForegroundColor White
Write-Host "  3. Get an authorization code" -ForegroundColor White
Write-Host "  4. Paste it here" -ForegroundColor White
Write-Host ""

firebase login

if ($LASTEXITCODE -ne 0) {
    Write-Host "Authentication failed!" -ForegroundColor Red
    Read-Host "Press Enter to exit"
    exit 1
}

Write-Host ""
Write-Host "====================================================" -ForegroundColor Cyan
Write-Host "[Step 3/3] Deploying to Firebase Hosting..." -ForegroundColor Cyan
Write-Host "====================================================" -ForegroundColor Cyan
Write-Host ""

firebase deploy --project healthvision-ai-e647d

Write-Host ""
Write-Host "====================================================" -ForegroundColor Green
Write-Host "Deployment Complete!" -ForegroundColor Green
Write-Host "====================================================" -ForegroundColor Green
Write-Host ""
Write-Host "Your app is now live at:" -ForegroundColor Green
Write-Host "https://healthvision-ai-e647d.web.app" -ForegroundColor Cyan
Write-Host ""
Read-Host "Press Enter to exit"
