import { BaseRenderSystem } from './BaseRenderSystem';
import type { UpdateArgs } from '../Framework/Systems';
import { getComponentIfExists } from '../../components/ComponentOperations';
import { ComponentType } from '../../components';

export class MapRenderSystem extends BaseRenderSystem {
  constructor() {
    super('map');
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
