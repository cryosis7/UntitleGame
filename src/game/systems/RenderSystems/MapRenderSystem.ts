import { BaseRenderSystem } from './BaseRenderSystem';
import { store } from '../../../App';
import { getMapRenderConfigAtom } from '../../atoms/Atoms';

export class MapRenderSystem extends BaseRenderSystem {
  constructor() {
    super(store.get(getMapRenderConfigAtom));
  }
}
