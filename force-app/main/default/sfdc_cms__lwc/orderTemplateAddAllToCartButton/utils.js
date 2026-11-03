import { MAX_NAME_LENGTH, TRAILING_DOTS } from './constants';
export function getTruncatedName(name) {
  if (!name) {
    return '';
  }
  if (name.length <= MAX_NAME_LENGTH) {
    return name;
  }
  return name.substring(0, MAX_NAME_LENGTH - TRAILING_DOTS.length) + TRAILING_DOTS;
}