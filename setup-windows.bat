@echo off
REM Travel Tracker - Windows Setup Script
REM This script sets up the Travel Tracker application on Windows

setlocal enabledelayedexpansion

color 0A
echo.
echo =========================================
echo Travel Tracker - Windows Setup
echo =========================================
echo.

REM Check if Node.js is installed
node --version >nul 2>&1
if %errorlevel% neq 0 (
    color 0C
    echo [ERROR] Node.js is not installed
    echo Please download and install Node.js from: https://nodejs.org/
    echo.
    pause
    exit /b 1
)

echo [✓] Node.js is installed: 
node --version
echo.

REM Check if npm is installed
npm --version >nul 2>&1
if %errorlevel% neq 0 (
    color 0C
    echo [ERROR] npm is not installed
    echo.
    pause
    exit /b 1
)

echo [✓] npm is installed: 
npm --version
echo.

REM Check if .env exists
if not exist .env (
    echo [!] Creating .env from .env.example...
    copy .env.example .env
    echo [✓] .env created
    echo.
    echo [!] IMPORTANT: Edit .env file and set your PostgreSQL password!
    echo.
    pause
)

REM Install dependencies
echo [*] Installing dependencies...
call npm install
if %errorlevel% neq 0 (
    color 0C
    echo [ERROR] Failed to install dependencies
    echo.
    pause
    exit /b 1
)
echo [✓] Dependencies installed
echo.

REM PostgreSQL Check
echo [*] Checking PostgreSQL...
psql --version >nul 2>&1
if %errorlevel% neq 0 (
    color 0C
    echo.
    echo [!] PostgreSQL might not be installed or not in PATH
    echo Please ensure PostgreSQL is installed and add it to your PATH
    echo Download from: https://www.postgresql.org/download/windows/
    echo.
    pause
) else (
    echo [✓] PostgreSQL is installed: 
    psql --version
    echo.
)

echo.
echo =========================================
echo Setup Complete!
echo =========================================
echo.
echo Next steps:
echo 1. Edit .env file and enter your PostgreSQL password
echo 2. Open Command Prompt and run: npm run db:setup
echo 3. Then run: npm start
echo 4. Open http://localhost:3000 in your browser
echo.
echo Commands:
echo   npm start        - Start the application
echo   npm run dev      - Start with auto-reload
echo   npm run db:setup - Setup database
echo   npm run db:reset - Reset database (deletes data)
echo.
pause
