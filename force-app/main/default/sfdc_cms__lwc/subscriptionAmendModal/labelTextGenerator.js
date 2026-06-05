import LABELS from './labels';
const billingTermUnitInLowerCaseMap = new Map([['Month', (LABELS.month ?? 'Month').toLowerCase()], ['Year', (LABELS.year ?? 'Year').toLowerCase()]]);
export function getSubscriptionFrequencyLabel(billingTermUnit) {
  const billingTermInLowerCase = billingTermUnitInLowerCaseMap.get(billingTermUnit) ?? billingTermUnit;
  return (LABELS.perBillingTermUnitLabel ?? '').replace('{billingTermUnit}', billingTermInLowerCase);
}
export function getSubscriptionAmendmentSuccessMsg(amendStartDate) {
  return (LABELS.amendSubscriptionSuccessMsg ?? '').replace('{amendStartDate}', amendStartDate);
}