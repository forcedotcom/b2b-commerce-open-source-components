import format from 'site/commonFormatterCurrency';
import { getSubscriptionDetailOptionLabel, getTermDefinedSubscriptionTypeOptionLabel, getTermDefinedSubscriptionDetailOptionLabel } from './labelTextGenerator';
import { getPriceTermUnitFrequencyLabel, getPriceTermUnitLabel, getSubscriptionTermUnitLabel } from './priceTermUnitService';
import { evergreen } from './labels';
export function getSubscriptionTypeOptionValue(sellingModelType, priceTermUnit) {
  if (sellingModelType === 'TermDefined' && priceTermUnit) {
    return `${sellingModelType}-${priceTermUnit}`;
  }
  return sellingModelType ?? '';
}
export function getSubscriptionDetailOptionValue(productSellingModelId, subscriptionTerm) {
  if (subscriptionTerm) {
    return `{"productSellingModelId":"${productSellingModelId}", "subscriptionTerm":${subscriptionTerm}}`;
  }
  return `{"productSellingModelId":"${productSellingModelId}"}`;
}
export function getSubscriptionTypeOption(sellingModelType, priceTermUnit) {
  const optionValue = getSubscriptionTypeOptionValue(sellingModelType, priceTermUnit);
  if (sellingModelType === 'TermDefined' && priceTermUnit) {
    return {
      label: getTermDefinedSubscriptionTypeOptionLabel(getPriceTermUnitFrequencyLabel(priceTermUnit)),
      value: optionValue
    };
  }
  return {
    label: evergreen,
    value: optionValue
  };
}
export function createEverGreenSellingModelSubscriptionDetailOption(productSellingModelId, priceTermUnit, negotiatedPrice, currency) {
  const optionValue = getSubscriptionDetailOptionValue(productSellingModelId);
  return {
    label: getSubscriptionDetailOptionLabel(getPriceTermUnitFrequencyLabel(priceTermUnit), format(currency, negotiatedPrice), getPriceTermUnitLabel(priceTermUnit)),
    value: optionValue
  };
}
export function createTermDefinedSubscriptionDetailOption(productSellingModelId, subscriptionTerm, priceTermUnit, negotiatedPrice, currency) {
  const optionValue = getSubscriptionDetailOptionValue(productSellingModelId, subscriptionTerm);
  return {
    label: getTermDefinedSubscriptionDetailOptionLabel(subscriptionTerm, getSubscriptionTermUnitLabel(priceTermUnit, subscriptionTerm), format(currency, negotiatedPrice), getPriceTermUnitLabel(priceTermUnit)),
    value: optionValue
  };
}