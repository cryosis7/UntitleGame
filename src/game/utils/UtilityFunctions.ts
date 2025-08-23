import { Position } from '../map/GameMap';
import { PositionComponent } from '../components';

export const capitalise = (str: string) => {
  return str.charAt(0).toUpperCase() + str.slice(1);
};

export const capitaliseSentence = (str: string) => {
  return str
    .split(' ')
    .map((word) => capitalise(word))
    .join(' ');
};

export const partitionArray = <T>(
  array: T[],
  filter: (element: T) => boolean,
): [T[], T[]] => {
  const array1: T[] = [];
  const array2: T[] = [];

  for (const element of array) {
    if (filter(element)) {
      array1.push(element);
    } else {
      array2.push(element);
    }
  }

  return [array1, array2];
};

export const arePositionsEqual = (
  pos1: Position | PositionComponent,
  pos2: Position | PositionComponent,
): boolean => {
  if (!pos1 || !pos2) {
    return false;
  }
  return pos1.x === pos2.x && pos1.y === pos2.y;
};
