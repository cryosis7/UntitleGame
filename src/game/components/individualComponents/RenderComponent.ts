import { ComponentType } from '../ComponentTypes';

export enum RenderSection {
  Game = 'game',
  Sidebar = 'sidebar',
  Map = 'map',
  Hud = 'hud'
}

export type RenderComponentProps = { section: RenderSection };

export class RenderComponent {
  type = ComponentType.Render;
  section: RenderSection;

  constructor(props: RenderComponentProps) {
    this.section = props.section;
  }
}
