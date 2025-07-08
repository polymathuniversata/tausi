#!/usr/bin/env bash

# Development script for Tausi
echo "🛠️  Building Tausi..."
bun run build

if [ $? -eq 0 ]; then
    echo "✅ Build successful!"
    echo "🧪 Running command: $@"
    echo ""
    bun run dist/cli.js "$@"
else
    echo "❌ Build failed!"
    exit 1
fi
