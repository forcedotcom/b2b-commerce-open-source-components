import { perBillingTermUnitLabel, expiringInNDaysPillText, expiringIn1DayPillText, expiringTodayPillText, month, year } from './labels';
const billingTermUnitInLowerCaseMap = new Map([['Month', month.toLowerCase()], ['Year', year.toLowerCase()]]);
export function getSubscriptionFrequencyLabel(billingTermUnit) {
  const billingTermInLowerCase = billingTermUnitInLowerCaseMap.get(billingTermUnit) ?? billingTermUnit;
  return perBillingTermUnitLabel.replace('{billingTermUnit}', billingTermInLowerCase);
}
export const getExpiringInNDaysText = daysLeft => {
  if (daysLeft === 0) {
    return expiringTodayPillText;
  }
  if (daysLeft === 1) {
    return expiringIn1DayPillText;
  }
  return expiringInNDaysPillText.replace('{0}', daysLeft.toString());
};