export const capitalise = (str: string) => {
  return str.charAt(0).toUpperCase() + str.slice(1);
};

export const capitaliseSentence = (str: string) => {
  return str
    .split(' ')
    .map((word) => capitalise(word))
    .join(' ');
};
