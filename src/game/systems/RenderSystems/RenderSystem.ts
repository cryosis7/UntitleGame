import type { System, UpdateArgs } from '../Systems';
import { store } from '../../../App';
import { mapAtom } from '../../utils/Atoms';
import { MapRenderSystem } from './MapRenderSystem';
import { EntityRenderSystem } from './EntityRenderSystem';
import { hasComponent } from '../../components/ComponentOperations';
import { ComponentType } from '../../components/ComponentTypes';
import type { Entity } from '../../utils/ecsUtils';
import { SidebarRenderSystem } from './SidebarRenderSystem';

export class RenderSystem implements System {
  private mapRenderSystem: MapRenderSystem;
  private sidebarRenderSystem: SidebarRenderSystem;
  private entityRenderSystem: EntityRenderSystem;

  constructor() {
    const map = store.get(mapAtom);
    this.mapRenderSystem = new MapRenderSystem(map);
    this.sidebarRenderSystem = new SidebarRenderSystem();
    this.entityRenderSystem = new EntityRenderSystem();
  }

  update({ entities, map }: UpdateArgs) {
    if (map.hasChanged) {
      this.mapRenderSystem.update(map.getAllEntities());
      map.hasChanged = false;
    }
    const sideBarEntities: Entity[] = [];
    const gameEntities: Entity[] = []; // TODO: Actually add a component for these ones.
    entities.forEach((entity) => {
      if (hasComponent(entity, ComponentType.RenderInSidebar)) {
        sideBarEntities.push(entity);
      } else {
        gameEntities.push(entity);
      }
    });

    this.sidebarRenderSystem.update(sideBarEntities);
    this.entityRenderSystem.update(gameEntities);
  }
}
