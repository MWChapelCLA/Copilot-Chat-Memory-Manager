#!/bin/bash

# Chat Memory Manager Extension - Setup Script

echo "🚀 Setting up Chat Memory Manager Extension..."

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed. Please install Node.js and npm first."
    echo "Visit: https://nodejs.org/"
    exit 1
fi

echo "✓ npm found"

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Compile TypeScript
echo "🔨 Compiling TypeScript..."
npm run compile

echo ""
echo "✅ Setup complete!"
echo ""
echo "Next steps:"
echo "1. Open this folder in VS Code"
echo "2. Press F5 to run the extension in debug mode"
echo "3. In the Extension Development Host, the extension will activate"
echo "4. Use Ctrl+Shift+P to access Chat Memory commands"
echo ""
echo "Commands available:"
echo "  - Chat Memory: Save Current Chat Session"
echo "  - Chat Memory: Restore Chat Session"
echo "  - Chat Memory: Save Repository Context"
echo "  - Chat Memory: View Saved Sessions"
echo ""
