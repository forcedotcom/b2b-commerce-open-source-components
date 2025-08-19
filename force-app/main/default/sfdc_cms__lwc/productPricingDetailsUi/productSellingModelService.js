export function getProductSellingModelNegotiatedPrice(priceEntryData, subscriptionTerm) {
  return priceEntryData?.subscriptionTermPrices?.find(subscriptionTermPrice => subscriptionTermPrice.term === subscriptionTerm)?.negotiatedPrice ?? priceEntryData?.negotiatedPrice;
}
export function isSubscriptionActive(priceType, productSellingModelType) {
  return priceType === 'ActiveSellingModelPrice' && (productSellingModelType === 'Evergreen' || productSellingModelType === 'TermDefined');
}
export function isPromotionPriceApplicable(priceType, activeProductSellingModelType) {
  return priceType === 'OneTimeSellingModelPrice' && activeProductSellingModelType === 'OneTime' || !priceType && !activeProductSellingModelType;
}
export function getEffectivePrice(lifeTimePrice, sellingModelPrice, normalPrice, priceType) {
  switch (priceType) {
    case 'OneTimeSellingModelPrice':
      return lifeTimePrice;
    case 'ActiveSellingModelPrice':
      return sellingModelPrice;
    default:
      return normalPrice;
  }
}
export function getNormalizedValue(value) {
  return value ?? '';
}