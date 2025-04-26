import { ComponentType } from '../components/ComponentTypes';
import type { Entity } from './ecsUtils';

/**
 * Partitions a list of entities into two lists:
 * - One containing entities with the "RenderInSidebar" component.
 * - One containing entities without the "RenderInSidebar" component.
 *
 * @param entities The list of entities to partition.
 * @returns A tuple with two lists: [withRenderInSidebar, withoutRenderInSidebar].
 */
export const partitionEntitiesBySidebarRender = (
  entities: Entity[],
): [Entity[], Entity[]] => {
  const withRenderInSidebar: Entity[] = [];
  const withoutRenderInSidebar: Entity[] = [];

  entities.forEach((entity) => {
    if (entity.components[ComponentType.RenderInSidebar]) {
      withRenderInSidebar.push(entity);
    } else {
      withoutRenderInSidebar.push(entity);
    }
  });

  return [withRenderInSidebar, withoutRenderInSidebar];
};
