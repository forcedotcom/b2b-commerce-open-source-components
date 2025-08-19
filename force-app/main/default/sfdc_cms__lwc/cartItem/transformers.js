export function changeSign(value, makePositive) {
  if (!value) {
    return value;
  }
  let returnValue = value;
  const isNegative = value < 0;
  if (isNegative && makePositive || !isNegative && !makePositive) {
    returnValue = value * -1;
  }
  return returnValue;
}