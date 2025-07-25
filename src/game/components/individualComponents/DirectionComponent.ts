import { isValidDirectionProps } from '../../utils/EntityFactory';
import { ComponentType } from '../ComponentTypes';

export type Direction = 'up' | 'down' | 'left' | 'right';
export type DirectionComponentProps = { direction: Direction };

export class DirectionComponent {
  type = ComponentType.Direction;
  direction: Direction;

  constructor(props: DirectionComponentProps) {
    if (!isValidDirectionProps(props)) {
      throw new Error(
        `Invalid direction component were provided: ${JSON.stringify(props, null, 2)}`,
      );
    }
    this.direction = props.direction;
  }
}
