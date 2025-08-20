export const VARIATION_DROP_DOWN_TYPE = 'Dropdown';
export function isProductOutOfStock(availableQuantity, purchaseQuantityRuleMinimum) {
  const availableToOrder = availableQuantity ?? null;
  purchaseQuantityRuleMinimum = purchaseQuantityRuleMinimum ?? 1;
  return availableToOrder !== null && (availableToOrder === 0 || purchaseQuantityRuleMinimum > availableToOrder);
}
export function getDefaultSelectedProductSellingModel(productSellingModels) {
  let productSellingModelId, subscriptionTerm;
  if (productSellingModels && productSellingModels?.length > 0) {
    const oneTimeSubscription = productSellingModels.find(psm => psm.sellingModelType === 'OneTime');
    if (oneTimeSubscription) {
      productSellingModelId = oneTimeSubscription.id;
      subscriptionTerm = oneTimeSubscription.pricingTerm ?? undefined;
    } else {
      const subscriptionPSM = productSellingModels.find(psm => psm.sellingModelType === 'Evergreen' || psm.sellingModelType === 'TermDefined');
      if (subscriptionPSM) {
        productSellingModelId = subscriptionPSM.id;
        subscriptionTerm = subscriptionPSM.subscriptionTermRule?.minimum ?? undefined;
      }
    }
  }
  return {
    productSellingModelId,
    subscriptionTerm
  };
}
export function transformPurchaseQuantityRule(data) {
  return {
    increment: data?.increment ? Number(data.increment) : 1,
    maximum: data?.maximum ? Number(data.maximum) : Number.MAX_SAFE_INTEGER,
    minimum: data?.minimum ? Number(data.minimum) : 1
  };
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