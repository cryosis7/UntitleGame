import { BaseRenderSystem } from './BaseRenderSystem';
import { mapAtom, store } from '../../utils/Atoms';
import type { UpdateArgs } from '../Systems';
import { getComponentAbsolute, hasComponent } from '../../components/ComponentOperations';
import { ComponentType } from '../../components/ComponentTypes';
import type { RenderComponent } from '../../components/individualComponents/RenderComponent';

export class MapRenderSystem extends BaseRenderSystem {
  constructor() {
    const map = store.get(mapAtom);
    super(map.getSpriteContainer(), 'map', [0, 0]);
  }

  update({ map }: UpdateArgs) {
    if (!map.hasChanged) {
      return;
    }
    const entities = map.getAllEntities();
    // Filter entities that should be rendered in the map section
    const mapEntities = entities.filter((entity) => {
      if (hasComponent(entity, ComponentType.Render)) {
        const renderComponent = getComponentAbsolute(entity, ComponentType.Render) as RenderComponent;
        return renderComponent.section === 'map';
      }
      // If no render component, default to map rendering for map entities
      return true;
    });
    
    this.updateStageAndPositions(mapEntities);

    map.hasChanged = false;
  }
}
