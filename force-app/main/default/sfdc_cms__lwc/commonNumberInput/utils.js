const INTERNAL_DECIMAL_SEPARATOR = '.';
function appendZeroToDecimal(value) {
  const firstChar = value.charAt(0);
  if (firstChar === INTERNAL_DECIMAL_SEPARATOR) {
    return 0 + value;
  }
  const lastChar = value.charAt(value.length - 1);
  if (lastChar === INTERNAL_DECIMAL_SEPARATOR) {
    return value + 0;
  }
  return value;
}
function removeGroupingSeparator(value, groupingSeparator) {
  return value.replace(new RegExp(`[${groupingSeparator}]*`, 'g'), '');
}
function parseValue(value, decimalSeparator, groupingSeparator) {
  const [left, right] = value.split(decimalSeparator);
  const cleanLeft = removeGroupingSeparator(left, groupingSeparator);
  const hasOnlyNumbers = cleanLeft.replace(/[+-]?\d*/, '').length === 0;
  if (hasOnlyNumbers) {
    const joinedValue = [cleanLeft, right].join('.');
    return appendZeroToDecimal(joinedValue);
  }
  return undefined;
}
export function numberFormattedValue(value, decimalSeparator, groupingSeparator) {
  return Number(parseValue(value, decimalSeparator, groupingSeparator));
}
export function isNumberType(n) {
  return typeof n === 'number';
}
export function isLessThanOrEqual(number1, number2) {
  if (isNumberType(number1) && isNumberType(number2)) {
    return number2 <= number1;
  }
  return false;
}
export function stringOnlyHasNumbers(value) {
  if (typeof value === 'number') {
    return !Number.isNaN(Number(value));
  } else if (typeof value === 'string') {
    return !Number.isNaN(Number(value)) && value.length !== 0;
  }
  return false;
}
export function findReason(state) {
  for (const key in state) {
    if (state[key]) {
      return [key, state[key]];
    }
  }
  return ['valid', true];
}
export function first(arr, fallback) {
  if (Array.isArray(arr) && arr[0]) {
    return arr[0];
  }
  return fallback ?? null;
}