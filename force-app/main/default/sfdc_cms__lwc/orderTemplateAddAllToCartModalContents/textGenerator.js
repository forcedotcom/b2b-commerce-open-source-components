import LABELS from './labels';
export function generateModalSubheading(succeededProductCount = 0, failedProductCount = 0) {
  let subheading;
  if (succeededProductCount > 1 && failedProductCount === 1) {
    subheading = LABELS.itemsAddedItemUnavailable.replace('{0}', succeededProductCount.toString());
  } else if (succeededProductCount === 1 && failedProductCount > 1) {
    subheading = LABELS.itemAddedItemsUnavailable.replace('{0}', failedProductCount.toString());
  } else if (succeededProductCount === 1 && failedProductCount === 1) {
    subheading = LABELS.itemAddedItemUnavailable;
  } else if (succeededProductCount > 1 && failedProductCount > 1) {
    subheading = LABELS.itemsAddedItemsUnavailable?.replace('{0}', succeededProductCount.toString());
    subheading = subheading?.replace('{1}', failedProductCount.toString());
  } else if (succeededProductCount === 0) {
    subheading = LABELS.noItemsAvailable;
  }
  return subheading;
}