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