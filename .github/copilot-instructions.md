# Copilot Instructions for Untitled Game

## Architecture Overview

This is a **React + TypeScript game** using **Entity Component System (ECS)** architecture with **Pixi.js** for rendering. The game runs embedded in a React app with **Jotai** for global state management.

### Key Architectural Patterns

**ECS Implementation:**

- **Entities**: Objects with unique IDs (`src/game/utils/ecsUtils.ts`)
- **Components**: Attributes that can be attached to entities to implement behaviour, located in `src/game/components/individualComponents/`
- **Systems**: Logic processors in `src/game/systems/` that implement `System` interface
- **ComponentTypes enum** acts as the single source of truth for all component types

## Development Conventions

- Use utilities from `ComponentOperations.ts`
- Create systems following established patterns.
- Positions are grid coordinates, not pixels
- Use utilities in `MappingUtils.ts` for rendering
- Use comments wisely. Do not comment everything. Prefer self documenting code.
  - Only use comments when the code is complex and hard to follow.
- Detailed guides and practices are available in `./docs/`.
