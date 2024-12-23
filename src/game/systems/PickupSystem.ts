import type { System, UpdateArgs } from './Systems';
import { getEntitiesAtPosition, getPlayerEntity } from '../utils/EntityUtils';
import type { InteractingComponent , PositionComponent } from '../components/Components';
import { ComponentType, CarriedItemComponent } from '../components/Components';
import { getComponent, hasComponent, removeComponent, removeFromMap, setComponent } from '../utils/ComponentUtils';

export class PickupSystem implements System {
    update({ entities }: UpdateArgs) {
        const playerEntity = getPlayerEntity(entities);
        if (!playerEntity) return;

        const interactingComponent = getComponent<InteractingComponent>(playerEntity, ComponentType.Interacting);
        const positionComponent = getComponent<PositionComponent>(playerEntity, ComponentType.Position);
        if (!positionComponent || !interactingComponent) return;

        const itemsAtPosition = getEntitiesAtPosition(positionComponent).filter(entity =>
            hasComponent(entity, ComponentType.Pickable)
        );

        if (itemsAtPosition.length > 0) {
            const firstItem = itemsAtPosition[0];
            const carriedItemComponent = new CarriedItemComponent({ item: firstItem.id });
            removeFromMap(firstItem);
            setComponent(playerEntity, carriedItemComponent);
            removeComponent(playerEntity, ComponentType.Interacting);
        }
    }
}