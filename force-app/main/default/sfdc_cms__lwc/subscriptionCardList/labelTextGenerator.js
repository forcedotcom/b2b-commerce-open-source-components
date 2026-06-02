import { singleSubscriptionWarningTitle, multipleSubscriptionsWarningTitle } from './labels';
export const getSPMDeleteWarningTitleForSingleSubscription = paymentMethodName => {
  return singleSubscriptionWarningTitle.replace('{0}', paymentMethodName);
};
export const getSPMDeleteWarningTitleForMultipleSubscription = (paymentMethodName, subscriptionCount) => {
  return multipleSubscriptionsWarningTitle.replace('{0}', paymentMethodName).replace('{1}', subscriptionCount.toString());
};