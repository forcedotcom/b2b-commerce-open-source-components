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