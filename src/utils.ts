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
