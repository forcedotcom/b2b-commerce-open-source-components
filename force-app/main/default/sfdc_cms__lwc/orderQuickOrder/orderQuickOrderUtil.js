export function getEntriesWithProductDetails(quickOrderEntries) {
  return quickOrderEntries.filter(entry => {
    return Boolean(entry.productSummaryData?.id);
  });
}
export function createAddToCartPayload(quickOrderEntries) {
  return getEntriesWithProductDetails(quickOrderEntries).reduce((acc, entry) => {
    const productId = entry.productSummaryData?.id;
    const quantity = entry.quantity;
    if (productId && quantity) {
      acc[productId] = (acc[productId] || 0) + quantity;
    }
    return acc;
  }, {});
}
export function initializeQuickOrderEntries(numberOfEntries) {
  const quickOrderEntries = [];
  for (let i = 0; i < numberOfEntries; i++) {
    quickOrderEntries.push({
      id: i,
      quantity: 1
    });
  }
  return quickOrderEntries;
}
export function addEmptyEntries(numberOfEntriesToAdd, quickOrderEntries, idCounter, maxNumberOfEntries) {
  for (let i = 0; i < numberOfEntriesToAdd; i++) {
    if (quickOrderEntries.length === maxNumberOfEntries) {
      return quickOrderEntries;
    }
    quickOrderEntries.push({
      id: idCounter,
      quantity: 1
    });
    idCounter += 1;
  }
  return quickOrderEntries;
}
export function updateEntry(entryToUpdate, quickOrderEntries) {
  const index = quickOrderEntries.findIndex(entry => entry.id === entryToUpdate.id);
  if (index !== -1) {
    quickOrderEntries[index] = entryToUpdate;
  }
  return quickOrderEntries;
}
export function deleteEntry(entryToRemove, quickOrderEntries) {
  return quickOrderEntries.filter(entry => entry.id !== entryToRemove.id);
}
export function getInvalidEntries(addToCartApiResponse, quickOrderEntries) {
  if (!addToCartApiResponse.hasErrors) {
    return [];
  }
  const productsAddedSuccessfully = addToCartApiResponse.results.filter(({
    result
  }) => result.productId !== undefined).map(({
    result
  }) => {
    return result.productId;
  });
  const invalidProductsSet = new Set();
  return quickOrderEntries.filter(entry => {
    const productId = entry.productSummaryData?.id;
    if (!productId || productsAddedSuccessfully.includes(productId)) {
      return false;
    }
    if (invalidProductsSet.has(productId)) {
      return false;
    }
    invalidProductsSet.add(productId);
    return true;
  });
}