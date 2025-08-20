import { month, months, year, years, monthly, yearly } from './labels';
export const frequencyLableMap = new Map([['Months', monthly], ['Annual', yearly]]);
export const priceTermUnitMap = new Map([['Months', month.toLowerCase()], ['Annual', year.toLowerCase()]]);
export const subscriptionPriceTermUnitMap = new Map([['Months', month], ['Annual', year]]);
export const pluralSubscriptionPriceTermUnitMap = new Map([['Months', months], ['Annual', years]]);
export function getPriceTermUnitFrequencyLabel(priceTermUnit) {
  return frequencyLableMap.get(priceTermUnit) ?? priceTermUnit;
}
export function getPriceTermUnitLabel(priceTermUnit) {
  return priceTermUnitMap.get(priceTermUnit) ?? priceTermUnit;
}
export function getSubscriptionTermUnitLabel(priceTermUnit, subscriptionTerm) {
  return (subscriptionTerm > 1 ? pluralSubscriptionPriceTermUnitMap.get(priceTermUnit) : subscriptionPriceTermUnitMap.get(priceTermUnit)) ?? priceTermUnit;
}