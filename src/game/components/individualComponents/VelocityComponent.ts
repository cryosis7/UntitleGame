import { ComponentType } from '../Components';

export type VelocityComponentProps = { vx: number; vy: number };

export class VelocityComponent {
  type = ComponentType.Velocity;
  vx: number;
  vy: number;

  constructor({ vx, vy }: VelocityComponentProps) {
    this.vx = vx;
    this.vy = vy;
  }
}
