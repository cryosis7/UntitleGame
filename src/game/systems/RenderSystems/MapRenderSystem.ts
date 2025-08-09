import { BaseRenderSystem } from './BaseRenderSystem';
import { mapAtom, store } from '../../utils/Atoms';
import type { UpdateArgs } from '../Systems';
import { getComponentIfExists } from '../../components/ComponentOperations';
import { ComponentType } from '../../components/ComponentTypes';

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
      const renderComponent = getComponentIfExists(entity, ComponentType.Render);
      
      if (!renderComponent) {
        // If no render component, default to map rendering for map entities
        return true;
      }
      
      return renderComponent.section === 'map';
    });
    
    this.updateStageAndPositions(mapEntities);

    map.hasChanged = false;
  }
}
