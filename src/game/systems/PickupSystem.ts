import {
  getComponentIfExists,
  hasComponent,
  removeComponent,
  setComponent,
} from '../components/ComponentOperations';
import type { SystemBase, UpdateArgs } from './SystemBase';
import { getEntitiesAtPosition, getPlayerEntity } from '../utils/EntityUtils';
import { ComponentType } from '../components/ComponentTypes';
import { PositionComponent } from '../components/individualComponents/PositionComponent';
import { CarriedItemComponent } from '../components/individualComponents/CarriedItemComponent';

export class PickupSystem implements SystemBase {
  update({ entities }: UpdateArgs) {
    const playerEntity = getPlayerEntity(entities);
    if (!playerEntity) return;

    const handlingComponent = getComponentIfExists(
      playerEntity,
      ComponentType.Handling,
    );
    const positionComponent = getComponentIfExists(
      playerEntity,
      ComponentType.Position,
    );
    if (!positionComponent || !handlingComponent) return;

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
        removeComponent(
          firstItem,
          ComponentType.Position,
          ComponentType.Velocity,
        );
        setComponent(playerEntity, newCarriedItemComponent);
      }
    }

    removeComponent(playerEntity, ComponentType.Handling);
  }
}
