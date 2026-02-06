export function getProductSellingModelIds(productSellingModels) {
  return (productSellingModels || []).map(productSellingModel => productSellingModel.id);
}
function updateNegotiatedPriceForRange(quantityOrTerm, tiers, defaultPrice) {
  if (typeof quantityOrTerm === 'number') {
    const quantityOrTermFloor = Math.floor(quantityOrTerm);
    const applicableTier = tiers.find(tier => (tier.upperBound === null || quantityOrTermFloor <= Number(tier.upperBound)) && quantityOrTermFloor >= Number(tier.lowerBound));
    if (applicableTier !== undefined) {
      return applicableTier.tierUnitPrice;
    }
  }
  return defaultPrice;
}
export function calculateNegotiatedPriceForPriceBookEntry(priceEntry, quantity, subscriptionTerm) {
  const priceAdjustment = priceEntry.priceAdjustment;
  if (priceAdjustment && priceAdjustment.adjustmentMethod === 'Range') {
    const quantityOrTerm = priceAdjustment.scheduleType === 'Volume' ? quantity : subscriptionTerm;
    return updateNegotiatedPriceForRange(quantityOrTerm, priceAdjustment.priceAdjustmentTiers, priceEntry.unitPrice);
  }
  return priceEntry.unitPrice;
}
export function transformToProductPricingResultForProductSellingModels(productDetailData, productPricing, quantity) {
  const productPricingResult = {
    ...productPricing,
    quantity: quantity
  };
  const productSellingModelMap = productDetailData?.productSellingModels?.reduce((map, productSellingModel) => {
    map.set(productSellingModel.id, productSellingModel);
    return map;
  }, new Map());
  const normalisedProductPriceEntryData = productPricingResult.productPriceEntries?.map(priceEntry => {
    const productSellingModel = productSellingModelMap?.get(priceEntry.productSellingModelId);
    if (productSellingModel?.sellingModelType === 'TermDefined') {
      const defaultMaxTerms = 50;
      const defaultIncrement = 1;
      const {
        minimum,
        increment,
        maximum
      } = productSellingModel?.subscriptionTermRule || {};
      let subscriptionTermStart = minimum || productSellingModel.pricingTerm;
      const subscriptionTermIncrement = increment || defaultIncrement;
      const subscriptionTermEnd = maximum || subscriptionTermStart + subscriptionTermIncrement * (defaultMaxTerms - 1);
      const subscriptionTermPriceData = [];
      while (subscriptionTermStart <= subscriptionTermEnd) {
        const negotiatedPrice = calculateNegotiatedPriceForPriceBookEntry(priceEntry, quantity, subscriptionTermStart);
        subscriptionTermPriceData.push({
          term: subscriptionTermStart,
          negotiatedPrice: negotiatedPrice
        });
        subscriptionTermStart += subscriptionTermIncrement;
      }
      priceEntry = {
        ...priceEntry,
        subscriptionTermPrices: subscriptionTermPriceData
      };
    }
    const negotiatedPrice = calculateNegotiatedPriceForPriceBookEntry(priceEntry, quantity);
    return {
      ...priceEntry,
      negotiatedPrice: negotiatedPrice
    };
  });
  productPricingResult.productPriceEntries = normalisedProductPriceEntryData;
  return productPricingResult;
}