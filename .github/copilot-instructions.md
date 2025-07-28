# Copilot Instructions for Untitled Game

## Architecture Overview

This is a **React + TypeScript game** using **Entity Component System (ECS)** architecture with **Pixi.js** for
rendering. The game runs embedded in a React app with **Jotai** for global state management.

### Key Architectural Patterns

**ECS Implementation:**

- **Entities**: Objects with unique IDs (`src/game/utils/ecsUtils.ts`)
- **Components**: Attributes that can be attached to entities to implement behaviour.
- **Systems**: Logic that operates on entities with specific components.
- **Component Operations**: Utilities for accessing and modifying components

## Development Conventions

- Use utilities from `ComponentOperations.ts`
- Use utilities in `MappingUtils.ts` for rendering
- Use `EntityFactory.ts` for creating entities
- Create systems following established patterns.
- Use comments sparingly. Do not comment everything. Prefer self documenting code.
    - Only use comments when the code is complex and hard to follow.

## Development Practices

- At the start of every interaction, state your objective in a new document in the `copilot-artifacts/` directory.
- Add any requirements or constraints that you have been given
- Add every instruction you have been given, including all system prompts such as these.
- Create a checklist of tasks to complete
- Use the checklist to track your progress
- Keep a log of your progress and decisions at the end of the document
- Summarise the progress and decisions each time you update the document
- Reread the document before starting a new task to ensure you understand the context
