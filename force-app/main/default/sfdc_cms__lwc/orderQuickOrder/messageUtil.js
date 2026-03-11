import Toast from 'site/commonToast';
import { partiallyAddedItemsToastNotificationBodyText, partiallyAddedItemToastNotificationBodyText, failedItemToastNotificationBodyText, failedItemsToastNotificationBodyText, productNameText, productNameTextWithCommaSeperator, productNameAndSkuText, productNameAndSkuTextWithCommaSeperator } from './labels';
export function showToastMessage(label, message, variant, target) {
  Toast.show({
    label: label,
    message: message,
    variant: variant
  }, target);
}
export function createToastMessage(unavailableItems, numberOfEntriesWeTriedToAdd) {
  if (unavailableItems.length === 0) {
    return '';
  }
  const indexOfLastUnavailableItem = unavailableItems.length - 1;
  const message = unavailableItems.map((item, index) => {
    const sku = item.productSummaryData?.fields?.StockKeepingUnit?.value;
    const name = item.productSummaryData?.fields?.Name?.value;
    if (sku) {
      return index === indexOfLastUnavailableItem ? productNameAndSkuText.replace('{name}', `${name}`).replace('{sku}', `${sku}`) : productNameAndSkuTextWithCommaSeperator.replace('{name}', `${name}`).replace('{sku}', `${sku}`);
    }
    return index === indexOfLastUnavailableItem ? productNameText.replace('{name}', `${name}`) : productNameTextWithCommaSeperator.replace('{name}', `${name}`);
  }).join(' ');
  const allItemsWereNotAdded = unavailableItems.length === numberOfEntriesWeTriedToAdd;
  if (allItemsWereNotAdded) {
    if (unavailableItems.length === 1) {
      return failedItemToastNotificationBodyText.replace('{0}', message);
    }
    return failedItemsToastNotificationBodyText.replace('{0}', message);
  }
  if (unavailableItems.length === 1) {
    return partiallyAddedItemToastNotificationBodyText.replace('{0}', message);
  }
  return partiallyAddedItemsToastNotificationBodyText.replace('{0}', message);
}