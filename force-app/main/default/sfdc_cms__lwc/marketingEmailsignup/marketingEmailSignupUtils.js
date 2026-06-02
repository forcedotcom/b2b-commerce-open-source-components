import Toast from 'site/commonToast';
export function transformMarketingConsentSubscriptions(communications) {
  return communications?.map(subscription => {
    return {
      id: subscription.commSubscriptionChannelTypeId,
      title: subscription.title,
      description: subscription.description,
      value: subscription.consentStatus === 'OptIn'
    };
  }) || [];
}
export function showErrorToast(message, target) {
  Toast.show({
    label: message,
    variant: 'error'
  }, target);
}