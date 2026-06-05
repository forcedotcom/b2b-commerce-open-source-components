import { perBillingTermUnitLabel, expiresOnDateText, month, year } from './labels';
const billingTermUnitInLowerCaseMap = new Map([['Month', (month ?? 'Month').toLowerCase()], ['Year', (year ?? 'Year').toLowerCase()]]);
export function getSubscriptionFrequencyLabel(billingTermUnit) {
  const billingTermInLowerCase = billingTermUnitInLowerCaseMap.get(billingTermUnit) ?? billingTermUnit;
  return (perBillingTermUnitLabel ?? '').replace('{billingTermUnit}', billingTermInLowerCase);
}
export const getExpiringOnDateText = formattedDate => {
  return (expiresOnDateText ?? '').replace('{0}', formattedDate);
};