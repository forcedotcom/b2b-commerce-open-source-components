import Toast from 'site/commonToast';
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
export function formatMessage(template, ...values) {
  return template.replace(/\{(\d+)\}/g, (_match, index) => values[Number(index)] ?? '');
}
export function getSafeCount(count) {
  if (typeof count === 'number') {
    return Number.isFinite(count) && count >= 0 ? Math.trunc(count) : 0;
  }
  const parsed = Number.parseInt(count ?? '0', 10);
  return Number.isNaN(parsed) || parsed < 0 ? 0 : parsed;
}
export function getOrderTemplateCountByType(countType, uniqueProductCount, totalProductCount) {
  if (countType === 'UniqueProductCount') {
    return getSafeCount(uniqueProductCount);
  }
  if (totalProductCount === null || totalProductCount === undefined || totalProductCount === '') {
    return getSafeCount(uniqueProductCount);
  }
  return getSafeCount(totalProductCount);
}
export function getTemplateMenuLabel(templateName, count, itemsPluralLabel, itemSingularLabel, showItemCount) {
  const name = getTruncatedName(templateName);
  if (!showItemCount || count === null || count === undefined) {
    return name;
  }
  const countLabel = count === 1 ? itemSingularLabel : itemsPluralLabel;
  return `${name} (${count} ${countLabel})`;
}
export function showOrderTemplateSuccessToast(label, target) {
  Toast.show({
    label,
    variant: 'success'
  }, target);
}
export function showOrderTemplateErrorToast(label, target) {
  Toast.show({
    label,
    variant: 'error'
  }, target);
}