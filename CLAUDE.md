# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

This is a **React + TypeScript game** using **Entity Component System (ECS)** architecture with **Pixi.js** for rendering and **Jotai** for state management.

### ECS Implementation

- **Entities**: Objects with unique IDs and component dictionaries (`src/game/utils/ecsUtils.ts`)
- **Components**: Data containers that define entity properties (`src/game/components/`)
- **Systems**: Logic that operates on entities with specific components (`src/game/systems/`)

Key ECS utilities:
- Use `ComponentOperations.ts` for component access/modification
- Use `EntityFactory.ts` for creating entities from templates
- Use `MappingUtils.ts` for rendering utilities
- Entity templates are in `src/game/templates/EntityTemplates.ts`

## Code Conventions

- **Minimal comments**: Only comment complex, hard-to-follow code
- **Self-documenting code** preferred over extensive commenting
- **TypeScript strict mode** enabled
- Follow established patterns when creating new systems or components

## Important Files

- `src/game/GameSystem.ts` - Main game initialization and game loop
- `src/game/components/ComponentOperations.ts` - Component manipulation utilities
- `src/game/utils/ecsUtils.ts` - Core ECS types and utilities
- `src/game/templates/EntityTemplates.ts` - Predefined entity configurations
- `vitest.config.ts` - Test configuration with coverage thresholds