#!/bin/bash

# Certificate Verification System - Setup Script
# This script sets up the entire project with all dependencies

echo "🚀 Setting up Certificate Verification System..."
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js from https://nodejs.org/"
    exit 1
fi

echo "✅ Node.js is installed: $(node -v)"
echo ""

# Check if Ganache CLI is installed
if ! command -v ganache-cli &> /dev/null; then
    echo "⚠️  Ganache CLI is not installed globally"
    echo "Installing Ganache CLI globally..."
    npm install -g ganache-cli
fi

echo "✅ Ganache CLI is installed"
echo ""

# Install project dependencies
echo "📦 Installing project dependencies..."
npm install

if [ $? -eq 0 ]; then
    echo "✅ Dependencies installed successfully"
else
    echo "❌ Failed to install dependencies"
    exit 1
fi

echo ""
echo "🔧 Creating .env file from template..."

# Create .env from .env.example if it doesn't exist
if [ ! -f .env ]; then
    cp .env.example .env
    echo "✅ Created .env file"
    echo "⚠️  Please update .env with your contract address from deployment"
else
    echo "⚠️  .env file already exists, skipping..."
fi

echo ""
echo "✨ Setup complete!"
echo ""
echo "🎯 Next steps:"
echo "1. Open a new terminal and start Ganache:"
echo "   ganache-cli"
echo ""
echo "2. Deploy the smart contract:"
echo "   npx hardhat run scripts/deploy.js --network ganache"
echo ""
echo "3. Update CONTRACT_ADDRESS in .env with the deployed contract address"
echo ""
echo "4. Start the server (in another terminal):"
echo "   npm run dev"
echo ""
echo "5. Open your browser to http://localhost:3000"
echo ""
