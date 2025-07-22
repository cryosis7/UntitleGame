# Setup script to install git hooks for pre-merge checks (PowerShell version)

Write-Host "🔧 Setting up git hooks for pre-merge checks..." -ForegroundColor Yellow

# Create .git/hooks directory if it doesn't exist
New-Item -ItemType Directory -Force -Path ".git\hooks" | Out-Null

# Copy our pre-commit hook
Copy-Item ".github\hooks\pre-commit" ".git\hooks\pre-commit" -Force

Write-Host "✅ Git hooks installed successfully!" -ForegroundColor Green
Write-Host ""
Write-Host "📋 Available commands:" -ForegroundColor Cyan
Write-Host "  npm run pre-merge        - Run all pre-merge checks (same as GitHub Actions)" -ForegroundColor White
Write-Host "  npm run pre-merge:fix    - Auto-fix linting and formatting issues" -ForegroundColor White
Write-Host "  git commit               - Will now automatically run pre-merge checks" -ForegroundColor White
Write-Host ""
Write-Host "💡 To skip pre-commit checks (not recommended): git commit --no-verify" -ForegroundColor Yellow
