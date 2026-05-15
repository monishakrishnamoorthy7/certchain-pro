@echo off
REM Certificate Verification System - Setup Script (Windows)
REM This script sets up the entire project with all dependencies

echo 🚀 Setting up Certificate Verification System...
echo.

REM Check if Node.js is installed
node -v >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js is not installed. Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
)

echo ✅ Node.js is installed: 
node -v
echo.

REM Check if Ganache CLI is installed
where ganache-cli >nul 2>&1
if %errorlevel% neq 0 (
    echo ⚠️  Ganache CLI is not installed globally
    echo Installing Ganache CLI globally...
    call npm install -g ganache-cli
)

echo ✅ Ganache CLI is installed
echo.

REM Install project dependencies
echo 📦 Installing project dependencies...
call npm install

if %errorlevel% equ 0 (
    echo ✅ Dependencies installed successfully
) else (
    echo ❌ Failed to install dependencies
    pause
    exit /b 1
)

echo.
echo 🔧 Creating .env file from template...

REM Create .env from .env.example if it doesn't exist
if not exist .env (
    copy .env.example .env
    echo ✅ Created .env file
    echo ⚠️  Please update .env with your contract address from deployment
) else (
    echo ⚠️  .env file already exists, skipping...
)

echo.
echo ✨ Setup complete!
echo.
echo 🎯 Next steps:
echo 1. Open a new terminal and start Ganache:
echo    ganache-cli
echo.
echo 2. Deploy the smart contract:
echo    npx hardhat run scripts/deploy.js --network ganache
echo.
echo 3. Update CONTRACT_ADDRESS in .env with the deployed contract address
echo.
echo 4. Start the server (in another terminal):
echo    npm run dev
echo.
echo 5. Open your browser to http://localhost:3000
echo.
pause
