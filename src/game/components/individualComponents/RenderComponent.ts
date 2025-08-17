import { ComponentType } from '../ComponentTypes';

export type RenderSection = 'game' | 'sidebar' | 'map' | 'hud';
export type RenderComponentProps = { section: RenderSection };

export class RenderComponent {
  type = ComponentType.Render;
  section: RenderSection;

  constructor(props: RenderComponentProps) {
    this.section = props.section;
  }
}
