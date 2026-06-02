import Toast from 'site/commonToast';
import { MAX_NAME_LENGTH, TRAILING_DOTS } from './constants';
export function getTruncatedName(name) {
  if (name === undefined || name.length <= MAX_NAME_LENGTH) {
    return name;
  }
  return name.substring(0, MAX_NAME_LENGTH - TRAILING_DOTS.length) + TRAILING_DOTS;
}
export function getTotalProductCount(totalProductCount) {
  if (typeof totalProductCount === 'number') {
    return Number.isFinite(totalProductCount) && totalProductCount >= 0 ? Math.trunc(totalProductCount) : 0;
  }
  const parsedCount = Number.parseInt(totalProductCount ?? '0', 10);
  return Number.isNaN(parsedCount) || parsedCount < 0 ? 0 : parsedCount;
}
export function getCartCountByType(countType, totalProductCount, uniqueProductCount) {
  if (countType === 'UniqueProductCount') {
    return String(getTotalProductCount(uniqueProductCount));
  }
  return String(getTotalProductCount(totalProductCount));
}
export function getCartMenuLabel(cartName, count, itemsLabel, showItemCount = true) {
  if (!cartName) {
    return cartName;
  }
  if (!showItemCount) {
    return cartName;
  }
  const itemCount = getTotalProductCount(count);
  return `${cartName} (${itemCount} ${itemsLabel})`;
}
export function showAddToSecondaryCartSuccessToast(label, target) {
  Toast.show({
    label,
    variant: 'success'
  }, target);
}
export function showSecondaryCartErrorToast(label, target) {
  Toast.show({
    label,
    variant: 'error'
  }, target);
}
export function showAddToSecondaryCartErrorToast(label, target) {
  showSecondaryCartErrorToast(label, target);
}