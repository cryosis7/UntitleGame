#!/bin/bash

# Setup script to install git hooks for pre-merge checks

echo "🔧 Setting up git hooks for pre-merge checks..."

# Create .git/hooks directory if it doesn't exist
mkdir -p .git/hooks

# Copy our pre-commit hook
cp .github/hooks/pre-commit .git/hooks/pre-commit

# Make it executable
chmod +x .git/hooks/pre-commit

echo "✅ Git hooks installed successfully!"
echo ""
echo "📋 Available commands:"
echo "  npm run pre-merge        - Run all pre-merge checks (same as GitHub Actions)"
echo "  npm run pre-merge:fix    - Auto-fix linting and formatting issues"
echo "  git commit               - Will now automatically run pre-merge checks"
echo ""
echo "💡 To skip pre-commit checks (not recommended): git commit --no-verify"
