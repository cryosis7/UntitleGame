# Untitled Game

[![Tests and Coverage](https://github.com/cryosis7/UntitleGame/actions/workflows/test.yml/badge.svg)](https://github.com/cryosis7/UntitleGame/actions/workflows/test.yml)
[![Code Quality](https://github.com/cryosis7/UntitleGame/actions/workflows/code-quality.yml/badge.svg)](https://github.com/cryosis7/UntitleGame/actions/workflows/code-quality.yml)
[![Security Scan](https://github.com/cryosis7/UntitleGame/actions/workflows/security.yml/badge.svg)](https://github.com/cryosis7/UntitleGame/actions/workflows/security.yml)
[![codecov](https://codecov.io/gh/cryosis7/UntitleGame/branch/main/graph/badge.svg)](https://codecov.io/gh/cryosis7/UntitleGame)

This project is a game built using the Entity Component System (ECS) framework and Pixi.js as the rendering engine. The game is embedded in a React TypeScript application.

## Table of Contents

- [Technologies Used](#technologies-used)
- [Architecture](#architecture)
- [Scripts](#scripts)
- [Project Structure](#project-structure)
- [Inspiration](#inspiration)

## Technologies Used

- [React](https://react.dev/)
- [TypeScript](https://www.typescriptlang.org/)
- [Pixi.js](https://pixijs.com/)
- [Vite](https://vitejs.dev/)
- [Vitest](https://vitest.dev/)
- [React Testing Library](https://github.com/testing-library/react-testing-library)

## Architecture

### Entity Component System (ECS)

The ECS architecture is a design pattern that is commonly used in game development. It is composed of three main parts:

1. **Entities**: These are the objects in the game. They are essentially IDs that are associated with various components.
2. **Components**: These are data containers that hold the properties of the entities. For example, a `PositionComponent` might hold `x` and `y` coordinates.
3. **Systems**: These are the logic that operates on the entities and their components. For example, a `RenderSystem` might update the rendering of all entities that have a `SpriteComponent`.

### Implementation with Pixi.js

Pixi.js is used as the rendering engine to draw the game objects on the screen. Here's how the ECS system is integrated with Pixi.js:

1. **Entity Creation**: Entities are created and assigned unique IDs. Any relavent components are also added to the entity at object creation.
2. **Component Management**: Components are stored in a way that allows systems to efficiently query and update them.
3. **System Execution**: Systems are executed in a game loop. Each system queries the entities that have the required components and performs operations on them.
4. **Rendering**: A `RenderSystem` is responsible for drawing the entities on the screen using Pixi.js. It queries all entities that have a `SpriteComponent` and uses Pixi.js to render them.

### Example

Here is a simplified example of how an entity with a `PositionComponent` and `SpriteComponent` might be rendered:

```typescript
// Define components
export class PositionComponent {
  type = 'position';
  x: number;
  y: number;

  constructor(x: number, y: number) {
    this.x = x;
    this.y = y;
  }
}

export class SpriteComponent {
  type = 'sprite';
  sprite: PIXI.Sprite;

  constructor(sprite: string) {
    this.sprite = PIXI.Sprite.from(sprite);
  }
}

// Create an entity
const entity = createEntity([
  new PositionComponent(100, 200),
  new SpriteComponent('path/to/image.png'),
]);

// System to update position
function movementSystem(entities: Entity[], time: PIXI.Ticker) {
  entities.forEach((entity) => {
    const position = getComponent<PositionComponent>(entity, 'position');
    if (position) {
      position.x += 1;
      position.y += 1;
    }
  });
}

// System to render entities
function renderSystem(entities: Entity[]) {
  entities.forEach((entity) => {
    const position = getComponent<PositionComponent>(entity, 'position');
    const sprite = getComponent<SpriteComponent>(entity, 'sprite');
    if (position && sprite) {
      sprite.sprite.x = position.x;
      sprite.sprite.y = position.y;
    }
  });
}

// Main game loop
function gameLoop(app: PIXI.Application) {
  const entities = getAllEntities();
  movementSystem(entities, app.ticker);
  renderSystem(entities);
  requestAnimationFrame(() => gameLoop(app));
}

// Initialize Pixi.js application
const app = new PIXI.Application({ width: 800, height: 600 });
document.body.appendChild(app.view);
gameLoop(app);
```

## Scripts

- `dev` - Start the development server and open the browser.
- `build` - Build the project for production.
- `preview` - Locally preview the production build.
- `test` - Launch the test runner.
- `test:ui` - Launch the test runner with a UI.
- `format` - Format the code using Prettier.
- `lint` - Lint the code using ESLint.
- `lint:fix` - Fix linting issues.
- `type-check` - Run TypeScript type checks.

## Project Structure

TODO
