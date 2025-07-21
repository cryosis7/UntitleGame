import { ComponentType } from '../ComponentTypes';

export type PositionComponentProps = { x: number; y: number };

export class PositionComponent {
  type = ComponentType.Position;
  x: number;
  y: number;

  constructor({ x, y }: PositionComponentProps) {
    this.x = x;
    this.y = y;
  }
}
