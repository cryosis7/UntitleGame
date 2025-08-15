# CLAUDE.md

This is a **React + TypeScript game** using **Entity Component System (ECS)** architecture with **Pixi.js** for
rendering and **Jotai** for state management.

## Key ECS utilities:

- `src/game/components/ComponentOperations.ts` for component access/modification
- `src/game/utils/ecsUtils.ts` - Core ECS types and utilities
- `EntityFactory.ts` for creating entities from templates
- Use the Jotai store in `Atoms.ts` for global state management
- `src/game/GameSystem.ts` - Main game initialization and game loop

## Code Conventions

- **Minimal comments**: Only comment complex code
- **Self-documenting code** preferred over extensive commenting
- **Always use Yarn instead of npm**
