# Copilot Instructions for Untitled Game

## Architecture Overview

This is a **React + TypeScript game** using **Entity Component System (ECS)** architecture with **Pixi.js** for rendering. The game runs embedded in a React app with **Jotai** for global state management.

### Key Architectural Patterns

**ECS Implementation:**

- **Entities**: Objects with unique IDs (`src/game/utils/ecsUtils.ts`)
- **Components**: Attributes that can be attached to entities to implement behaviour, located in `src/game/components/individualComponents/`
- **Systems**: Logic processors in `src/game/systems/` that implement `System` interface
- **ComponentTypes enum** acts as the single source of truth for all component types

**State Management:**

- **Jotai atoms** in `src/game/utils/Atoms.ts` manage game state (entities, systems, map config)

## Component System Conventions

**Component Operations:**

- Use utilities from `ComponentOperations.ts`

**Entity Templates:**

- Define reusable entity configs in `src/game/templates/EntityTemplates.ts`
- Use `createEntitiesFromTemplates()` for instantiation

## System Development

**System Interface:**
Create systems by implementing the base system class.

**System Registration:**

- Add systems in `GameSystem.ts`
- Order matters - register systems in execution order

## Map and Positioning

**Grid-Based Movement:**

- Positions are grid coordinates, not pixels
- Use utilities in `MappingUtils.ts` for rendering

## Required Development Practices

- When modifying this codebase, always consider ECS data flow.
