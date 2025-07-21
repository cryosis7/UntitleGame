# CI/CD Configuration Guide

## Overview

This document outlines the GitHub Actions CI/CD setup for the ECS game project, including automated testing, coverage reporting, and branch protection configuration.

## Workflows

### 1. Tests and Coverage (`test.yml`)

**Triggers:** Push to main/feature branches, Pull Requests to main
**Purpose:** Run comprehensive test suite with coverage reporting

**Features:**

- Multi-Node.js version testing (18.x, 20.x)
- Type checking with TypeScript
- ESLint code quality checks
- Unit and integration test execution
- Coverage report generation and validation
- PR comments with coverage details
- Artifact uploads for test results and build files

**Coverage Thresholds (Aspirational):**

- Lines: 80%
- Functions: 90%
- Branches: 75%
- Statements: 80%

**Current Baseline (T015):** ~41% line coverage

### 2. Code Quality (`code-quality.yml`)

**Triggers:** Push to main/feature branches, Pull Requests to main
**Purpose:** Ensure code quality and security standards

**Features:**

- TypeScript type checking
- ESLint linting
- Prettier formatting validation
- Security vulnerability scanning
- Dependency audit

### 3. Dependency Management (`dependency-management.yml`)

**Triggers:** Weekly schedule (Mondays 9 AM UTC), Manual dispatch
**Purpose:** Monitor and update project dependencies

**Features:**

- Automated dependency vulnerability checks
- Weekly outdated dependency reports
- Manual dependency update PRs
- Security audit reports

## Branch Protection Configuration

### Recommended Settings for `main` branch:

1. **Go to repository Settings > Branches**
2. **Add rule for `main` branch:**

```yaml
# Required status checks
require_status_checks_to_pass: true
required_status_checks:
  - 'Run Tests and Coverage (18.x)'
  - 'Run Tests and Coverage (20.x)'
  - 'Build Check'
  - 'Code Quality Checks'

# Restrictions
require_branches_to_be_up_to_date: true
require_pull_request_reviews: true
required_approving_review_count: 1
dismiss_stale_reviews: true

# Additional protections
restrict_pushes: true
allow_force_pushes: false
allow_deletions: false
require_linear_history: false

# Admin settings
enforce_admins: false # Allow admins to bypass for hotfixes
```

### Pull Request Template

Create `.github/pull_request_template.md`:

```markdown
## Description

Brief description of changes

## Testing

- [ ] Unit tests added/updated
- [ ] Integration tests pass
- [ ] Coverage maintained/improved

## Type of Change

- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Coverage Report

Coverage will be automatically reported in PR comments.

## Checklist

- [ ] Code follows project style guidelines
- [ ] Self-review completed
- [ ] Tests added for new functionality
- [ ] Documentation updated if needed
```

## CI/CD Pipeline Flow

### For Feature Development:

1. **Create feature branch** from `main`
2. **Develop and test locally** using:
   ```bash
   yarn test:watch:coverage
   yarn lint
   yarn type-check
   ```
3. **Push to feature branch** → Triggers:
   - Tests and Coverage workflow
   - Code Quality workflow
4. **Create Pull Request** → Triggers:
   - All workflows run
   - Coverage report posted as comment
   - Branch protection checks enforced
5. **Review and merge** → Requires:
   - All status checks passing
   - Code review approval
   - Branch up-to-date

### For Main Branch:

1. **Merge triggers** full CI pipeline
2. **Coverage reports** uploaded to Codecov
3. **Build artifacts** stored
4. **Weekly dependency checks** monitor security

## Test Execution Strategy

### Local Development:

```bash
# Quick test run
yarn test

# Test with coverage
yarn test:coverage

# Watch mode with coverage
yarn test:watch:coverage

# Validate coverage thresholds (aspirational)
yarn coverage:validate
```

### CI Environment:

- **Matrix testing** across Node.js 18.x and 20.x
- **Parallel job execution** for efficiency
- **Artifact preservation** for debugging
- **Failure notifications** via GitHub

## Coverage Reporting

### Coverage Providers:

1. **Istanbul** (local/CI generation)
2. **Codecov** (trend tracking)
3. **GitHub Actions** (PR comments)

### Coverage Exclusions:

- Test files (`**/__tests__/**`, `**/*.test.*`)
- Configuration files (`**/*.config.*`)
- Type definitions (`**/*.d.ts`)
- Build output (`dist/`, `node_modules/`)
- Setup files (`src/setupTests.ts`)

### Coverage Validation:

- **Baseline established**: 40.71% lines (T015)
- **Target thresholds**: 80% lines, 90% functions
- **Progressive improvement**: Track coverage trends
- **Fail-safe approach**: Warnings rather than hard failures

## Troubleshooting

### Common CI Issues:

1. **Test failures in CI but not locally:**
   - Check Node.js version differences
   - Verify environment variables
   - Review test isolation

2. **Coverage not generating:**
   - Ensure coverage scripts in package.json
   - Check vitest.config.ts coverage settings
   - Verify Istanbul provider configuration

3. **Dependency conflicts:**
   - Use `yarn install --frozen-lockfile`
   - Check for version mismatches
   - Review yarn.lock file

4. **Build failures:**
   - Check TypeScript configuration
   - Verify all imports are available
   - Review build command settings

### Debugging Workflows:

- **Job summaries** provide detailed reports
- **Artifacts** contain test results and coverage data
- **Action logs** show step-by-step execution
- **Matrix strategy** helps isolate environment issues

## Security Considerations

### Automated Security:

- **Dependency scanning** via yarn audit
- **Vulnerability monitoring** via Dependabot
- **Branch protection** prevents direct pushes
- **Required reviews** ensure code oversight

### Token Management:

- **GITHUB_TOKEN** used for PR comments
- **Minimal permissions** for workflow actions
- **Secure artifact** handling
- **No sensitive data** in logs

## Maintenance

### Weekly Tasks:

- Review dependency management reports
- Monitor coverage trends
- Check for security vulnerabilities
- Update workflow actions if needed

### Monthly Tasks:

- Review CI/CD performance metrics
- Update Node.js versions if needed
- Audit workflow permissions
- Update documentation as needed

## Performance Optimization

### CI Speed Improvements:

- **Yarn caching** reduces install time
- **Matrix parallelization** runs concurrent jobs
- **Conditional steps** skip unnecessary work
- **Artifact reuse** between jobs

### Test Performance:

- **Selective test execution** for coverage
- **Parallel test running** via Vitest
- **Mock optimization** reduces overhead
- **Resource cleanup** prevents memory leaks

## Integration with Development Tools

### IDE Integration:

- **VS Code extensions** for ESLint, Prettier
- **Test discovery** via Vitest extension
- **Coverage highlighting** in editors
- **Git hooks** for pre-commit checks

### GitHub Integration:

- **Status checks** in PR interface
- **Coverage trends** via Codecov
- **Automated notifications** for failures
- **Branch protection** enforcement

This CI/CD setup provides a robust foundation for maintaining code quality while supporting rapid development cycles.
