import {
  CarriedItemComponent,
  ComponentType,
  PositionComponent,
} from '../components';
import {
  getComponentIfExists,
  hasComponent,
  removeComponent,
  removeMapComponents,
  setComponent,
} from '../components/ComponentOperations';
import type { BaseSystem, UpdateArgs } from './Framework/Systems';
import { getEntitiesAtPosition, getEntitiesWithComponent } from '../utils/EntityUtils';

export class PickupSystem implements BaseSystem {
  update({ entities }: UpdateArgs) {
    const playerEntities = getEntitiesWithComponent(
      ComponentType.Player,
      entities,
    );

    for (const playerEntity of playerEntities) {
      const handlingComponent = getComponentIfExists(
        playerEntity,
        ComponentType.Handling,
      );
      const positionComponent = getComponentIfExists(
        playerEntity,
        ComponentType.Position,
      );
      if (!positionComponent || !handlingComponent) continue;

      const carriedItemComponent = getComponentIfExists(
        playerEntity,
        ComponentType.CarriedItem,
      );
      if (carriedItemComponent) {
        // Place an item
        const itemEntity = entities.find(
          (entity) => entity.id === carriedItemComponent.item,
        );
        if (itemEntity) {
          setComponent(itemEntity, new PositionComponent(positionComponent));
          removeComponent(playerEntity, ComponentType.CarriedItem);
        }
      } else {
        // Pick up an item
        const itemsAtPosition = getEntitiesAtPosition(positionComponent).filter(
          (entity) => hasComponent(entity, ComponentType.Pickable),
        );

        if (itemsAtPosition.length > 0) {
          const firstItem = itemsAtPosition[0];
          const newCarriedItemComponent = new CarriedItemComponent({
            item: firstItem.id,
          });
          removeMapComponents(firstItem);
          setComponent(playerEntity, newCarriedItemComponent);
        }
      }

      removeComponent(playerEntity, ComponentType.Handling);
    }
  }
}
