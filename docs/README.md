# Documentation

This folder contains all project documentation organized by topic and purpose.

## Directory Structure

```
docs/
├── README.md                    # This file - Documentation overview
├── testing/                     # Testing-related documentation
│   ├── testing-guide.md         # Comprehensive testing guide for ECS architecture
│   ├── ecs-testing-patterns.md  # ECS-specific testing patterns and best practices
│   └── test-utilities-reference.md # Reference for test utilities and helper functions
└── development/                 # Development and operations documentation
    ├── ci-cd-configuration-guide.md # CI/CD pipeline configuration and setup
    ├── pre-merge-checks.md      # Local quality checks that replicate GitHub Actions
    └── ecs-architecture.md      # ECS architecture and Entity Interaction System documentation
```

## Documentation Types

### Testing Documentation (`testing/`)

Complete documentation for the comprehensive testing suite including:

- **Testing Guide**: Main testing documentation with patterns, examples, and best practices
- **ECS Testing Patterns**: Specific patterns for testing Entity-Component-System architecture
- **Test Utilities Reference**: Documentation for test helper functions and utilities

### Development Documentation (`development/`)

Development workflow and operational documentation:

- **CI/CD Configuration Guide**: Setup and configuration of continuous integration/deployment
- **Pre-Merge Checks**: Local quality checks that replicate GitHub Actions (prevents CI failures)
- **ECS Architecture**: Comprehensive Entity-Component-System architecture documentation including the Entity Interaction System

## Quick Navigation

### For Developers

- Start with [`testing/testing-guide.md`](testing/testing-guide.md) for comprehensive testing information
- Check [`development/ecs-architecture.md`](development/ecs-architecture.md) for ECS and Entity Interaction System details
- Review [`development/ci-cd-configuration-guide.md`](development/ci-cd-configuration-guide.md) for CI/CD setup
- Use [`development/pre-merge-checks.md`](development/pre-merge-checks.md) for local quality validation

## Related Files

- **Root [`README.md`](../README.md)**: Main project overview and setup instructions
- **GitHub Configuration**: GitHub-specific files in [`.github/`](../.github/) for GitHub integration
- **Task Files**: Development task files in [`tasks/`](../tasks/) for active development workflow

## Maintenance

This documentation is automatically maintained and updated as part of the development workflow. When adding new documentation:

1. Place files in the appropriate category folder
2. Update this README.md to reflect new additions
3. Ensure cross-references and links are updated
4. Follow the established naming conventions (lowercase with hyphens)
