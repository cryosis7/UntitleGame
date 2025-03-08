import type { HandlingComponent } from '../components/Components';
import {
  CarriedItemComponent,
  ComponentType,
  PositionComponent,
} from '../components/Components';
import {
  getComponentIfExists,
  hasComponent,
  removeComponent,
  removeMapComponents,
  setComponent,
} from '../utils/ComponentUtils';
import type { System, UpdateArgs } from './Systems';
import { getEntitiesAtPosition, getPlayerEntity } from '../utils/EntityUtils';

export class PickupSystem implements System {
  update({ entities }: UpdateArgs) {
    const playerEntity = getPlayerEntity(entities);
    if (!playerEntity) return;

    const handlingComponent = getComponentIfExists<HandlingComponent>(
      playerEntity,
      ComponentType.Handling,
    );
    const positionComponent = getComponentIfExists<PositionComponent>(
      playerEntity,
      ComponentType.Position,
    );
    if (!positionComponent || !handlingComponent) return;

    const carriedItemComponent = getComponentIfExists<CarriedItemComponent>(
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
