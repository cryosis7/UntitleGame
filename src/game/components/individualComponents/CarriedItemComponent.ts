import { ComponentType } from '../ComponentTypes';

export type CarriedItemComponentProps = { item: string };

export class CarriedItemComponent {
  type = ComponentType.CarriedItem;
  item: string;

  constructor({ item }: CarriedItemComponentProps) {
    this.item = item;
  }
}
