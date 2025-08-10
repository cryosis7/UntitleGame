# GitHub Actions Workflow Template

This directory contains GitHub Actions workflow templates for the project.

## Installation Instructions

To activate the PR checks workflow:

1. Create the `.github/workflows/` directory if it doesn't exist:
   ```bash
   mkdir -p .github/workflows/
   ```

2. Copy the workflow file:
   ```bash
   cp github-actions/pr-checks.yml.template .github/workflows/pr-checks.yml
   ```

3. Commit and push the changes:
   ```bash
   git add .github/workflows/pr-checks.yml
   git commit -m "Add GitHub Actions PR checks workflow"
   git push
   ```

## Workflow Details

The `pr-checks.yml.template` workflow includes:

- **Lint**: Runs ESLint to check code quality
- **Type Check**: Runs TypeScript compiler to check types
- **Test**: Runs the test suite using Vitest
- **Build**: Builds the project to ensure it compiles correctly

### Best Practice Decision

The workflow uses **multiple jobs** instead of a single combined job for:
- Better parallelization (faster execution)
- Clear visibility of which specific check fails
- Easier to re-run individual failed checks
- Standard GitHub Actions pattern

### Configuration Details

- Triggers on `pull_request` and `pull_request_target` events
- Targets the `master` branch
- Uses Node.js 18 with Yarn caching for optimal performance
- Uses `yarn install --frozen-lockfile` for reproducible builds
- Each job runs independently for better CI/CD practices