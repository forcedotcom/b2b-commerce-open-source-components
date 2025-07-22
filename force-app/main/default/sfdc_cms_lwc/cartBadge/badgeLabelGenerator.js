import { maximumCount } from './labels';
import { NUMBER_FORMATTER } from './constants';
export default function badgeLabelGenerator(count, maxLimit) {
  let returnValue;
  const countValueExists = count !== null && count !== undefined && count > 0;
  if (countValueExists) {
    returnValue = count > maxLimit ? maximumCount.replace('{maximumCount}', NUMBER_FORMATTER.format(maxLimit)) : NUMBER_FORMATTER.format(count);
  }
  return returnValue;
}