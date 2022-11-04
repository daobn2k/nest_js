import { toLower, toUpper } from 'lodash';

/**
 * Remove special characters and numbers
 * @param word string has contained special characters
 * @param type - "upper" | "lower" | "inherit", default is "inherit"
 * @return new string not contained special characters
 */
export const removeSpecialCharacters = (
  word: string,
  type: 'upper' | 'lower' | 'inherit' = 'inherit',
): string => {
  const nWord: string = word.replace(/[^A-Za-z]+/g, '');

  if (type === 'lower') {
    return toLower(nWord);
  }

  if (type === 'upper') {
    return toUpper(nWord);
  }

  return nWord;
};
