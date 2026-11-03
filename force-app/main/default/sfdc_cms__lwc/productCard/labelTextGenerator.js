export function getLabelForToast(label, productName) {
  return label.replace('{productName}', productName);
}
export function getSubscriptionPillText(sellingModelType, subscriptionTermUnit, subscriptionTerm, labels) {
  const isMonthly = subscriptionTermUnit === 'Monthly';
  const isAnnual = subscriptionTermUnit === 'Annual';
  if (sellingModelType === 'Evergreen') {
    if (isMonthly) {
      return labels.evergreenMonthlySubscriptionTypeText;
    }
    if (isAnnual) {
      return labels.evergreenAnnualSubscriptionTypeText;
    }
  }
  if (sellingModelType === 'TermDefined') {
    if (isMonthly) {
      return labels.termDefinedMonthlySubscriptionTypeText.replace('{subscriptionTerm}', subscriptionTerm != null ? String(subscriptionTerm) : '');
    }
    if (isAnnual) {
      return labels.termDefinedAnnualSubscriptionTypeText.replace('{subscriptionTerm}', subscriptionTerm != null ? String(subscriptionTerm) : '');
    }
  }
  return '';
}