import labels from './labels';
export function truncateWithEllipsis(str, maxLength) {
  if (str == null || maxLength == null || maxLength < 4 || str.length <= maxLength) {
    return str ?? '';
  }
  return str.slice(0, maxLength - 3) + '...';
}
export const CART_NAME_DISPLAY_TEXT_MAX_LENGTH = 80;
export const CART_DESCRIPTION_DISPLAY_TEXT_MAX_LENGTH = 100;
export function parseTotalProductCount(data) {
  const raw = data?.totalProductCount;
  if (raw == null || raw === '') {
    return null;
  }
  const n = Number.parseInt(raw, 10);
  return Number.isFinite(n) ? n : null;
}
export function parseGrandTotalAmount(data) {
  const raw = data?.grandTotalAmount;
  if (raw == null || raw === '') {
    return null;
  }
  const n = Number.parseFloat(raw);
  return Number.isFinite(n) ? n : null;
}
export function getCartName(data) {
  return truncateWithEllipsis(data?.name ?? '', CART_NAME_DISPLAY_TEXT_MAX_LENGTH);
}
export function getCartDescription(data) {
  return truncateWithEllipsis(data?.description ?? '', CART_DESCRIPTION_DISPLAY_TEXT_MAX_LENGTH);
}
export function getCurrencyCode(data) {
  return data?.currencyIsoCode ?? '';
}
export function getCartTypePillLabel(data, customLabel) {
  if (data?.isSecondary === false) {
    return customLabel || labels.defaultCartTypePillLabel;
  }
  return '';
}
export function getItemsDisplayText(data) {
  const quantity = parseTotalProductCount(data);
  if (quantity == null || quantity < 0) {
    return '';
  }
  return `${quantity} ${labels.itemsLabel}`;
}
export function hasItemsLine(data) {
  const count = parseTotalProductCount(data);
  return count != null && count >= 0;
}
export function hasPrice(data) {
  const value = parseGrandTotalAmount(data);
  const code = getCurrencyCode(data);
  return value != null && Boolean(code);
}
export function hasItemsAndTotal(data) {
  return hasItemsLine(data) || hasPrice(data);
}
export function hasDescription(data) {
  return Boolean(getCartDescription(data).trim());
}
export function shouldShowCartTypePill(data) {
  return data?.isSecondary === false;
}