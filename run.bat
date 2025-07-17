@echo off
setlocal enabledelayedexpansion

echo 🚀 Starting Discord Bot with Docker...

REM Check if .env file exists
if not exist ".env" (
    echo ❌ Error: .env file not found!
    echo Please create a .env file with your DISCORD_TOKEN
    echo You can copy from .env.example:
    echo copy .env.example .env
    echo Then edit .env with your actual Discord token
    pause
    exit /b 1
)

REM Check if Docker is running
docker info >nul 2>&1
if errorlevel 1 (
    echo ❌ Error: Docker is not running!
    echo Please start Docker Desktop and try again
    pause
    exit /b 1
)

REM Load environment variables from .env file
for /f "tokens=*" %%i in (.env) do (
    set %%i
)

REM Validate that DISCORD_TOKEN is set
if "!DISCORD_TOKEN!"=="" (
    echo ❌ Error: DISCORD_TOKEN not found in .env file!
    echo Please add your Discord bot token to the .env file
    pause
    exit /b 1
)

echo ✅ Environment variables loaded
echo 🔧 Building and starting the bot...

REM Build and run the container
docker-compose up --build

echo 🛑 Bot stopped
pause
