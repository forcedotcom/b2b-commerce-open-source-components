import { subscriptionDetailOptionLabel, termDefinedSubscriptionDetailOptionLabel, termDefinedSubscriptionTypeOptionLabel } from './labels';
export function getTermDefinedSubscriptionTypeOptionLabel(frequency) {
  return termDefinedSubscriptionTypeOptionLabel.replace('{frequency}', frequency);
}
export function getTermDefinedSubscriptionDetailOptionLabel(subscriptionTerm, subscriptionTermTermUnit, price, priceTermUnit) {
  return termDefinedSubscriptionDetailOptionLabel.replace('{subscriptionTerm}', String(subscriptionTerm)).replace('{subscriptionTermTermUnit}', subscriptionTermTermUnit).replace('{price}', price).replace('{priceTermUnit}', priceTermUnit);
}
export function getSubscriptionDetailOptionLabel(optionName, price, priceTermUnit) {
  return subscriptionDetailOptionLabel.replace('{optionName}', optionName).replace('{price}', price).replace('{priceTermUnit}', priceTermUnit);
}