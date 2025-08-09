# Creating Components

Components are data containers that define entity properties in the ECS system.

## 1. Create the Component File

Create a new file in `src/game/components/individualComponents/YourComponent.ts`:

```typescript
import { ComponentType } from '../ComponentTypes';

export type YourComponentProps = { /* define your data structure */ };

export class YourComponent {
  type = ComponentType.YourComponent;

  // Add your properties here

  constructor(props: YourComponentProps) {
    // Initialize properties from props
  }
}
```

## 2. Register the Component

In `src/game/components/ComponentTypes.ts`:

1. Add to `ComponentType` enum:
   ```typescript
   YourComponent = 'yourComponent',
   ```

2. Add to `FullComponentDictionary` type:
   ```typescript
   [ComponentType.YourComponent]: YourComponent;
   ```

3. Add props to `ComponentProps` union if needed:
   ```typescript
   | YourComponentProps
   ```

## 3. Export from Index

Add to `src/game/components/index.ts`:

```typescript
export { YourComponent } from './individualComponents/YourComponent';
export type { YourComponentProps } from './individualComponents/YourComponent';
```

## 4. Update EntityFactory (if needed)

If your component has props, it requires props validation. Add to `src/game/utils/EntityFactory.ts`:

1. Import your component types
2. Add validation function:
   ```typescript
   function isValidYourComponentProps(obj: any): obj is YourComponentProps {
     // Add validation logic for your props
     return obj && /* validation conditions */;
   }
   ```

3. Add case to `isValidComponentProps` switch:
   ```typescript
   case ComponentType.YourComponent:
     return isValidYourComponentProps(props);
   ```

4. Add case to `createComponentsFromTemplate`:
   ```typescript
   case ComponentType.YourComponent:
     return new YourComponent(props as YourComponentProps);
   ```

## Example

See `PositionComponent.ts` for a simple data component or `SpriteComponent.ts` for a component with string data.