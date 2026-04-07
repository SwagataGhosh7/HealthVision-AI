@echo off
REM HealthVision AI - Firebase Hosting Deployment Script
REM Run this script to deploy your app to Firebase Hosting

echo.
echo ====================================================
echo  HealthVision AI - Firebase Hosting Deployment
echo ====================================================
echo.

REM Step 1: Build the app
echo [Step 1/3] Building your app...
echo.
call npm run build
if errorlevel 1 (
    echo Build failed!
    pause
    exit /b 1
)

echo.
echo ====================================================
echo [Step 2/3] Authenticating with Firebase...
echo ====================================================
echo.
echo You will be asked to:
echo   1. Visit a URL in your browser
echo   2. Sign in with your Google account
echo   3. Get an authorization code
echo   4. Paste it here
echo.

call firebase login

if errorlevel 1 (
    echo Authentication failed!
    pause
    exit /b 1
)

echo.
echo ====================================================
echo [Step 3/3] Deploying to Firebase Hosting...
echo ====================================================
echo.

call firebase deploy --project healthvision-ai-e647d

echo.
echo ====================================================
echo Deployment Complete!
echo ====================================================
echo.
echo Your app is now live at:
echo https://healthvision-ai-e647d.web.app
echo.
pause
