# Pre-Merge Checks Setup

This project includes pre-merge checks that replicate the same quality gates as GitHub Actions, allowing you to catch issues locally before they reach CI/CD.

## Quick Start

### 1. Run Pre-Merge Checks Manually

```bash
# Run all checks (same as GitHub Actions)
npm run pre-merge

# If checks fail, auto-fix what can be fixed
npm run pre-merge:fix

# Then run checks again to verify
npm run pre-merge
```

### 2. Set Up Automatic Pre-Commit Hooks (Recommended)

```bash
# Install git hooks to run checks automatically on commit
npm run setup-hooks

# Now all commits will automatically run pre-merge checks
git commit -m "your commit message"

# To skip hooks in emergency (not recommended)
git commit --no-verify -m "emergency commit"
```

## What Gets Checked

The pre-merge checks run the same validations as GitHub Actions:

1. **🔍 Type Checking** - TypeScript compilation check without emitting files
2. **🧹 Linting** - ESLint rules validation
3. **✨ Code Formatting** - Prettier formatting validation
4. **🧪 Tests** - Full test suite execution (745 tests)
5. **🏗️ Build** - Vite build validation

## Available Scripts

| Script                  | Description                                     |
| ----------------------- | ----------------------------------------------- |
| `npm run pre-merge`     | Run all quality checks (same as GitHub Actions) |
| `npm run pre-merge:fix` | Auto-fix linting and formatting issues          |
| `npm run setup-hooks`   | Install git pre-commit hooks                    |
| `npm run type-check`    | Run TypeScript type checking only               |
| `npm run lint`          | Run ESLint validation only                      |
| `npm run format:check`  | Check Prettier formatting only                  |
| `npm run test`          | Run test suite only                             |
| `npm run build`         | Run build validation only                       |

## Workflow Recommendations

### Before Creating a Pull Request

```bash
# 1. Run pre-merge checks
npm run pre-merge

# 2. If any checks fail, fix them
npm run pre-merge:fix

# 3. Run checks again to verify all issues are resolved
npm run pre-merge

# 4. Commit and push
git add .
git commit -m "feat: your feature description"
git push
```

### Daily Development

With git hooks installed (`npm run setup-hooks`), the workflow is automatic:

```bash
# Make your changes
# ...

# Commit (hooks run automatically)
git commit -m "feat: your changes"

# If hooks fail:
npm run pre-merge:fix  # Fix auto-fixable issues
# Address any remaining issues manually
git add .
git commit -m "feat: your changes"  # Try again
```

## Troubleshooting

### Common Issues

**TypeScript Errors:**

```bash
npm run type-check
# Fix reported type errors manually
```

**Linting Issues:**

```bash
npm run lint:fix  # Auto-fix most issues
npm run lint      # Check remaining issues
```

**Formatting Issues:**

```bash
npm run format    # Auto-format all files
```

**Test Failures:**

```bash
npm run test      # See detailed test output
npm run test:ui   # Use Vitest UI for debugging
```

**Build Issues:**

```bash
npm run build     # See detailed build output
```

### Skip Hooks (Emergency Only)

```bash
# Skip pre-commit hooks (use sparingly)
git commit --no-verify -m "emergency fix"
```

## Integration with GitHub Actions

These local checks run the exact same validations as the GitHub Actions workflows:

- **Tests Workflow** (`.github/workflows/test.yml`) → `npm run test`
- **Code Quality Workflow** (`.github/workflows/code-quality.yml`) → `npm run type-check lint format:check build`

By running `npm run pre-merge` locally, you can be confident your PR will pass CI/CD checks.

## Benefits

✅ **Catch Issues Early** - Fix problems locally before pushing  
✅ **Faster Feedback** - No waiting for GitHub Actions to run  
✅ **Consistent Standards** - Same checks as CI/CD  
✅ **Automatic Enforcement** - Git hooks prevent bad commits  
✅ **Developer Experience** - Clear error messages and fix suggestions
