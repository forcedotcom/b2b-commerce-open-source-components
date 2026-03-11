import { transformToProductPricingResultForProductSellingModels } from './utils';
export function transformPurchaseQuantityRule(data) {
  return {
    increment: data?.increment ? Number(data.increment) : 1,
    maximum: data?.maximum ? Number(data.maximum) : Number.MAX_SAFE_INTEGER,
    minimum: data?.minimum ? Number(data.minimum) : 1
  };
}
export function transformMediaContents(mediaGroups) {
  return (mediaGroups || []).reduce((acc, group) => {
    if (group.usageType === 'Standard') {
      const mediaItems = group.mediaItems || [];
      mediaItems.forEach(item => {
        acc.push({
          alternativeText: item.alternateText ?? item.title ?? null,
          id: item.id,
          fullUrl: item.url,
          smallUrl: item.thumbnailUrl || item.url,
          mediaType: item.mediaType
        });
      });
    }
    return acc;
  }, []);
}
export function transformProductFields(productDetailSummaryFieldMapping, allProductFields, skuFieldLabel) {
  let fieldMappingData = [];
  if (allProductFields === undefined) {
    return undefined;
  }
  if (productDetailSummaryFieldMapping?.length > 0) {
    fieldMappingData = JSON.parse(productDetailSummaryFieldMapping);
  }
  const fieldData = fieldMappingData.filter(function (field) {
    return allProductFields[field.name];
  }).map(function (field) {
    return {
      label: field.label,
      name: field.name,
      value: allProductFields[field.name],
      type: field.type
    };
  });
  if (skuFieldLabel) {
    fieldData.unshift({
      label: skuFieldLabel,
      name: 'StockKeepingUnit',
      value: allProductFields.StockKeepingUnit,
      type: 'STRING'
    });
  }
  return fieldData;
}
export const transformToProductInventoryResult = data => {
  if (!data?.success) {
    return {};
  }
  const result = {};
  const createProductEntryIfEmpty = productId => {
    if (!result[productId]) {
      result[productId] = {
        levels: []
      };
    }
  };
  const createInventoryLevel = (product, locationSourceId, locationSourceKey) => ({
    availableToFulfill: product.availableToFulfill,
    availableToOrder: product.availableToOrder,
    onHand: product.onHand,
    locationSourceId,
    locationSourceKey,
    productId: product.product2Id
  });
  const processInventoryProduct = (product, locationSourceId, locationSourceKey) => {
    const currentProductId = product.product2Id;
    createProductEntryIfEmpty(currentProductId);
    result[currentProductId].levels.push(createInventoryLevel(product, locationSourceId, locationSourceKey));
  };
  const processTotalInventory = product => {
    const currentProductId = product.product2Id;
    createProductEntryIfEmpty(currentProductId);
    result[currentProductId].details = {
      availableToFulfill: product.availableToFulfill,
      availableToOrder: product.availableToOrder,
      onHand: product.onHand,
      productId: currentProductId
    };
    if (product.variants?.length) {
      product.variants.forEach(variant => {
        const variantProductId = variant.product2Id;
        createProductEntryIfEmpty(variantProductId);
        result[variantProductId].details = {
          availableToFulfill: variant.availableToFulfill,
          availableToOrder: variant.availableToOrder,
          onHand: variant.onHand,
          productId: variantProductId
        };
      });
    }
  };
  data.locationGroups?.forEach(locationGroup => {
    locationGroup.inventoryProducts.forEach(product => {
      processInventoryProduct(product, locationGroup.locationGroupId, 'locationGroup');
    });
  });
  data.locations?.forEach(location => {
    location.inventoryProducts.forEach(product => {
      processInventoryProduct(product, location.locationId, 'location');
    });
  });
  data.totalInventory?.forEach(processTotalInventory);
  return result;
};
export function transformProductDetailData(data) {
  if (data) {
    const tempData = JSON.parse(JSON.stringify(data));
    if (tempData?.purchaseQuantityRule) {
      tempData.purchaseQuantityRule = transformPurchaseQuantityRule(tempData.purchaseQuantityRule);
      tempData.quantity = tempData.purchaseQuantityRule.minimum;
    } else if (data) {
      tempData.quantity = 1;
    }
    return tempData;
  }
  return data;
}
export const transformToSinglePromotionData = data => {
  if (!data || !Array.isArray(data.promotionProductEvaluationResults) || data.promotionProductEvaluationResults.length === 0) {
    return undefined;
  }
  const result = data.promotionProductEvaluationResults.at(0);
  return {
    productId: result.productId,
    salesPrice: result.salesPrice,
    promotionalPrice: result.promotionalPrice,
    promotionPriceAdjustmentList: result.promotionPriceAdjustmentList,
    errorMessage: result.errorMessage,
    isSuccess: result.isSuccess
  };
};
export function transformToProductPricingResult(data, quantity) {
  let productPricingResult = {
    ...data,
    negotiatedPrice: data.unitPrice
  };
  if (typeof quantity === 'number') {
    const tiers = data.priceAdjustment?.priceAdjustmentTiers || [];
    let negotiatedPrice = data.unitPrice;
    const quantityInteger = Math.floor(quantity);
    const applicableTier = tiers.find(tier => (tier.upperBound === null || quantityInteger <= Number(tier.upperBound)) && quantityInteger >= Number(tier.lowerBound));
    if (applicableTier !== undefined) {
      negotiatedPrice = applicableTier.tierUnitPrice;
    }
    productPricingResult = {
      ...data,
      negotiatedPrice,
      quantity
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