import { createEverGreenSellingModelSubscriptionDetailOption, createTermDefinedSubscriptionDetailOption, getSubscriptionTypeOption } from './productSubscriptionOptionGenerator';
export function generateProductSubscriptionOptions(productSellingModels, currency) {
  const subscriptionTypeOptions = [];
  const subscriptionDetailOptionsMap = new Map();
  let isEverGreenSellingModelExist = false;
  productSellingModels.forEach(productSellingModelData => {
    const sellingTypeOption = getSubscriptionTypeOption(productSellingModelData.detail.sellingModelType, productSellingModelData.detail.pricingTermUnit);
    const subscriptionDetailOptions = subscriptionDetailOptionsMap.get(sellingTypeOption.value) ?? [];
    if (productSellingModelData.detail.sellingModelType === 'Evergreen') {
      if (!isEverGreenSellingModelExist) {
        subscriptionTypeOptions.unshift(sellingTypeOption);
        isEverGreenSellingModelExist = true;
      }
      subscriptionDetailOptions.push(createEverGreenSellingModelSubscriptionDetailOption(productSellingModelData.productSellingModelId, productSellingModelData.detail.pricingTermUnit, productSellingModelData.price.negotiatedPrice, currency));
    } else if (productSellingModelData.detail.sellingModelType === 'TermDefined') {
      subscriptionTypeOptions.push(sellingTypeOption);
      productSellingModelData.price.subscriptionTermPrices?.forEach(subscriptionTermPrice => {
        subscriptionDetailOptions.push(createTermDefinedSubscriptionDetailOption(productSellingModelData.productSellingModelId, subscriptionTermPrice.term, productSellingModelData.detail.pricingTermUnit, subscriptionTermPrice.negotiatedPrice, currency));
      });
    }
    subscriptionDetailOptionsMap.set(sellingTypeOption.value, subscriptionDetailOptions);
  });
  return {
    subscriptionTypeOptions,
    subscriptionDetailOptionsMap
  };
}