@echo off
title Fasty Shop Server
color 0A
echo.
echo ================================================
echo    FASTY SHOP - Starting Server...
echo ================================================
echo.

:: Check if node_modules exists, if not run npm install
if not exist "node_modules" (
    echo Installing dependencies... please wait...
    npm install
    echo.
)

echo Server is starting...
echo.
echo !! Open your browser and go to: http://localhost:5000
echo !! DO NOT open HTML files directly from the folder
echo.
echo Press Ctrl+C to stop the server.
echo.

node server.js

pause
