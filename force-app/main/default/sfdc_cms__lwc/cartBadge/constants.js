import LOCALE from '@salesforce/i18n/locale';
export const DEFAULTS = {
  totalCartCount: 0
};
export const MAX_CART_ITEMS_COUNT = 999;
export const PROCEED_TO_CART_EVT = 'cartbuttoniconclicked';
export const NUMBER_FORMATTER = new Intl.NumberFormat(LOCALE, {
  maximumFractionDigits: 20
});