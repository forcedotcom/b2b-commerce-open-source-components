import currencyFormatter from 'site/commonFormatterCurrency';
import { Labels } from './labels';
export function getTermDefinedSubscriptionLabel(labelTemplate, subscriptionTerm, placeHolderText = '{subscriptionTerm}') {
  return labelTemplate?.replace(placeHolderText, subscriptionTerm ?? '').trim() ?? '';
}
export function getPriceLabel(labelTemplate, amount, currencyCode, placeHolderText = '{0}') {
  const currencyValue = currencyFormatter(currencyCode, amount, 'symbol');
  return labelTemplate?.replace(placeHolderText, currencyValue) ?? '';
}
export function getProductLabel(labelTemplate, name, placeHolderText = '{name}') {
  return labelTemplate?.replace(placeHolderText, name ?? '').trim() ?? '';
}
export function getProductCountNameLabel(labelTemplate, name, namePlaceHolder = '{name}', count, countPlaceHolder = '{count}') {
  let newText = labelTemplate;
  newText = newText?.replace(namePlaceHolder, name ?? '').trim().replace(countPlaceHolder, count ?? '').trim() ?? '';
  return newText;
}
export function getBundleChildProductCountLabel(count, countPlaceHolder = '{count}') {
  if (!count) {
    return '';
  }
  return Labels.bundleChildProductCount.replace(countPlaceHolder, count.toString()).trim();
}