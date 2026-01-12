#!/bin/bash

# Build and test script for Docker environment

set -e

echo "🐳 Starting Chat Memory Manager Extension Docker Environment..."

# Build the Docker image
echo "📦 Building Docker image..."
docker-compose build

# Start the container
echo "🚀 Starting container..."
docker-compose up -d

# Wait for container to be ready
echo "⏳ Waiting for container to be ready..."
sleep 3

# Install dependencies
echo "📥 Installing dependencies..."
docker-compose exec -T vscode-extension-dev npm install

# Compile TypeScript
echo "🔨 Compiling TypeScript..."
docker-compose exec -T vscode-extension-dev npm run compile

# Run linter
echo "🔍 Running linter..."
docker-compose exec -T vscode-extension-dev npm run lint || true

echo ""
echo "✅ Environment is ready!"
echo ""
echo "📋 Available commands:"
echo "  docker-compose exec vscode-extension-dev bash    # Access container shell"
echo "  docker-compose exec vscode-extension-dev npm run watch    # Watch mode"
echo "  docker-compose exec vscode-extension-dev npm run compile  # Compile"
echo "  docker-compose exec vscode-extension-dev npm run lint     # Run linter"
echo ""
echo "🎯 To develop in VS Code:"
echo "  1. Install 'Dev Containers' extension"
echo "  2. Press F1 > 'Dev Containers: Reopen in Container'"
echo "  3. Press F5 to debug the extension"
echo ""
