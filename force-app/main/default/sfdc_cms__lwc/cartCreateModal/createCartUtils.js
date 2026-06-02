import Toast from 'site/commonToast';
import timeZone from '@salesforce/i18n/timeZone';
const DEFAULT_CART_NAME_PREFIX = 'Untitled Cart - ';
export function showCreateCartToast(label, variant, target) {
  Toast.show({
    label,
    variant
  }, target);
}
export function getDefaultCartName() {
  const now = new Date();
  const dateTimeStr = now.toLocaleString('sv-SE', {
    timeZone,
    hour12: false
  });
  const ms = String(now.getMilliseconds()).padStart(3, '0').substring(0, 3);
  return `${DEFAULT_CART_NAME_PREFIX}${dateTimeStr}.${ms}`;
}