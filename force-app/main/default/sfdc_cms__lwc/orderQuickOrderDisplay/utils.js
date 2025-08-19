export function isThereAnyProductToAdd(quickOrderEntries) {
  return quickOrderEntries.some(entry => {
    return Boolean(entry.productSummaryData?.id);
  });
}
export function isThereAnyProductWithInvalidQuantity(quickOrderEntries) {
  return quickOrderEntries.some(entry => {
    return Boolean(entry.quantityErrorState);
  });
}
export function isEntryButtonDisabled(quickOrderEntries, maximumEntryLength, addToCartInProgress) {
  return quickOrderEntries && maximumEntryLength && quickOrderEntries.length >= maximumEntryLength || addToCartInProgress;
}