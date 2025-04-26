import { BaseRenderSystem } from './BaseRenderSystem';
import { getMapRenderConfigAtom } from '../../atoms/Atoms';
import { store } from '../../../App';

export class EntityRenderSystem extends BaseRenderSystem {
  constructor() {
    super(store.get(getMapRenderConfigAtom));
  }
}
