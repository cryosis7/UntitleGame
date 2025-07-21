# Documentation

This folder contains all project documentation organized by topic and purpose.

## Directory Structure

```
docs/
├── README.md                    # This file - Documentation overview
├── testing/                     # Testing-related documentation
│   ├── testing-guide.md         # Comprehensive testing guide for ECS architecture
│   ├── ecs-testing-patterns.md  # ECS-specific testing patterns and best practices
│   ├── test-utilities-reference.md # Reference for test utilities and helper functions
│   └── testing-suite-final-summary.md # Final summary of testing suite implementation
├── development/                 # Development and operations documentation
│   ├── ci-cd-configuration-guide.md # CI/CD pipeline configuration and setup
│   ├── copilot-instructions.md  # GitHub Copilot configuration and instructions
│   └── ecs-architecture.md      # ECS architecture and Entity Interaction System documentation
├── projects/                    # Project-specific documentation
│   ├── testing-suite/          # Testing Suite Implementation Project
│   │   ├── prd-testing-suite.md # Product Requirements Document
│   │   └── task-list-testing-suite.md # Detailed task breakdown
│   └── unlock-system/          # Item Unlock System Project
│       ├── prd-item-unlock-system.md # Product Requirements Document
│       └── task-list-item-unlock-system.md # Detailed task breakdown
├── prompts/                     # AI prompt templates and instructions
│   ├── create-prd.prompt.md     # Template for creating PRDs
│   ├── create-tasks.prompt.md   # Template for creating task lists
│   ├── implement-tasks.prompt.md # Template for task implementation
│   └── update-feature.prompt.md # Template for feature updates
└── instructions/                # System and workflow instructions
    └── memory.instructions.md   # Memory management instructions for AI systems
```

## Documentation Types

### Testing Documentation (`testing/`)

Complete documentation for the comprehensive testing suite including:

- **Testing Guide**: Main testing documentation with patterns, examples, and best practices
- **ECS Testing Patterns**: Specific patterns for testing Entity-Component-System architecture
- **Test Utilities Reference**: Documentation for test helper functions and utilities
- **Testing Suite Summary**: Final implementation summary and achievements

### Development Documentation (`development/`)

Development workflow and operational documentation:

- **CI/CD Configuration Guide**: Setup and configuration of continuous integration/deployment
- **Copilot Instructions**: GitHub Copilot configuration and usage guidelines
- **ECS Architecture**: Comprehensive Entity-Component-System architecture documentation including the Entity Interaction System

### Project Documentation (`projects/`)

Detailed documentation for specific features and implementations:

- **Testing Suite**: Complete testing infrastructure implementation
- **Unlock System**: Item unlock and progression system (planned)

### Prompts (`prompts/`)

AI prompt templates for consistent development workflows:

- Templates for creating PRDs, task lists, and implementation guides
- Standardized prompts for feature development and updates

### Instructions (`instructions/`)

System-level instructions and configurations:

- Memory management for AI systems
- Workflow and process instructions

## Quick Navigation

### For Developers

- Start with [`testing/testing-guide.md`](testing/testing-guide.md) for comprehensive testing information
- Check [`development/ecs-architecture.md`](development/ecs-architecture.md) for ECS and Entity Interaction System details
- Review [`development/ci-cd-configuration-guide.md`](development/ci-cd-configuration-guide.md) for CI/CD setup
- Check [`projects/`](projects/) for detailed project documentation

### For AI Systems

- Use templates in [`prompts/`](prompts/) for consistent development workflows
- Follow [`instructions/memory.instructions.md`](instructions/memory.instructions.md) for memory management
- Reference [`development/copilot-instructions.md`](development/copilot-instructions.md) for Copilot configuration

### For Project Management

- Review PRDs in [`projects/*/prd-*.md`](projects/) for project requirements
- Check task lists in [`projects/*/task-list-*.md`](projects/) for implementation progress
- Use [`prompts/create-prd.prompt.md`](prompts/create-prd.prompt.md) for new project documentation

## Related Files

- **Root [`README.md`](../README.md)**: Main project overview and setup instructions
- **GitHub Configuration**: Original files remain in [`.github/`](../.github/) for GitHub integration
- **Task Files**: Original task files remain in [`tasks/`](../tasks/) for active development workflow

## Maintenance

This documentation is automatically maintained and updated as part of the development workflow. When adding new documentation:

1. Place files in the appropriate category folder
2. Update this README.md to reflect new additions
3. Ensure cross-references and links are updated
4. Follow the established naming conventions (lowercase with hyphens)
