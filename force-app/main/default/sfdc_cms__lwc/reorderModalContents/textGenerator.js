import LABELS from './labels';
export function generateModalSubheading(succeededProductCount = 0, failedProductCount = 0) {
  let subheading;
  if (succeededProductCount > 1 && failedProductCount === 1) {
    subheading = LABELS.itemsAddedItemNotAvailableInStoreHelpText.replace('{0}', succeededProductCount.toString());
  } else if (succeededProductCount === 1 && failedProductCount > 1) {
    subheading = LABELS.itemAddedItemsNotAvailableInStoreHelpText.replace('{0}', failedProductCount.toString());
  } else if (succeededProductCount === 1 && failedProductCount === 1) {
    subheading = LABELS.itemAddedItemNotAvailableInStoreHelpText;
  } else if (succeededProductCount > 1 && failedProductCount > 1) {
    subheading = LABELS.itemsAddedItemsNotAvailableInStoreHelpText?.replace('{0}', succeededProductCount.toString());
    subheading = subheading?.replace('{1}', failedProductCount.toString());
  } else if (succeededProductCount === 0) {
    subheading = LABELS.noItemsAvailableHelpText;
  }
  return subheading;
}