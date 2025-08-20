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
function transformTierAdjustmentContents(data) {
  const priceAdjustments = data.priceAdjustment ? data.priceAdjustment.priceAdjustmentTiers : [];
  return priceAdjustments.map(tier => {
    const content = {
      ...tier
    };
    return content;
  });
}
function calculateNegotiatedPrice(data, quantity) {
  const transformedPriceAdjustmentContents = transformTierAdjustmentContents(data);
  const tiers = transformedPriceAdjustmentContents;
  let negotiatedPrice = data.unitPrice;
  const quantityInteger = Math.floor(quantity);
  const applicableTier = tiers.find(tier => (tier.upperBound === null || quantityInteger <= Number(tier.upperBound)) && quantityInteger >= Number(tier.lowerBound));
  if (applicableTier !== undefined) {
    negotiatedPrice = applicableTier.tierUnitPrice;
  }
  return negotiatedPrice;
}
export function transformToProductPricingResult(data, quantity) {
  let productPricingResult = {
    ...data,
    negotiatedPrice: data.unitPrice
  };
  if (typeof quantity === 'number') {
    const calculatedNegotiatedPrice = calculateNegotiatedPrice(data, quantity);
    productPricingResult = {
      ...data,
      ...{
        negotiatedPrice: calculatedNegotiatedPrice,
        quantity: quantity
      }
    };
  }
  return productPricingResult;
}
export function transformPricingData(productDetails, pricingData, quantity) {
  const productPricingResult = transformToProductPricingResult(pricingData, quantity);
  if (Array.isArray(productDetails?.productSellingModels) && productDetails?.productSellingModels?.length) {
    return transformToProductPricingResultForProductSellingModels(productDetails, productPricingResult, quantity);
  }
  return productPricingResult;
}
export const transformToProductTaxResult = data => {
  if (!data) {
    return {};
  }
  const {
    taxLocaleType,
    taxesInfo
  } = data;
  return Object.keys(taxesInfo).reduce((acc, curr) => {
    acc[curr] = {
      productId: curr,
      taxLocaleType,
      taxPolicies: taxesInfo[curr].taxesInfoList.map(taxInfo => {
        return {
          ...taxInfo,
          taxRatePercentage: taxInfo.taxRatePercentage
        };
      })
    };
    return acc;
  }, {});
};