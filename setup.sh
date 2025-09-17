#!/bin/bash

echo "🚀 Setting up Karate Visual Builder..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 16+ first."
    echo "   Visit: https://nodejs.org/"
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 16 ]; then
    echo "❌ Node.js version 16+ is required. Current version: $(node -v)"
    exit 1
fi

echo "✅ Node.js $(node -v) detected"

# Install dependencies
echo "📦 Installing dependencies..."
npm install

if [ $? -eq 0 ]; then
    echo "✅ Dependencies installed successfully"
else
    echo "❌ Failed to install dependencies"
    exit 1
fi

# Create necessary directories
echo "📁 Creating project structure..."
mkdir -p src/components
mkdir -p src/lib
mkdir -p src/types
mkdir -p src/utils
mkdir -p src/data
mkdir -p public

echo "✅ Project structure created"

echo ""
echo "🎉 Setup complete! You can now start the development server:"
echo "   npm start"
echo ""
echo "📖 For more information, see README.md"
