import { transformCartItemData, remapData } from './transformers';
export function remapCartItems(cartItemSummaryData) {
  if (!cartItemSummaryData) {
    return undefined;
  }
  const cartItemDescDataMap = {
    id: 'cartItemId',
    name: 'name',
    type: 'type',
    messages: 'messagesSummary',
    subscriptionId: 'productSellingModelId',
    subscriptionType: 'sellingModelType',
    subscriptionTermUnit: 'billingFrequency',
    parentCartItemId: 'parentCartItemId',
    productClass: 'productClass',
    childProductCount: 'childProductCount',
    subType: 'subType'
  };
  const cartItemNumberDataMap = {
    quantity: 'quantity',
    salesPrice: 'salesPrice',
    itemizedAdjustmentAmount: 'itemizedAdjustmentAmount',
    adjustmentAmount: 'totalAdjustmentAmount',
    amount: 'totalAmount',
    listPrice: 'totalListPrice',
    price: 'totalPrice',
    tax: 'totalTax',
    unitAdjustedPrice: 'unitAdjustedPrice',
    unitAdjustedPriceWithItemAdj: 'unitAdjustedPriceWithItemAdj',
    unitAdjustmentAmount: 'unitAdjustmentAmount',
    unitItemAdjustmentAmount: 'unitItemAdjustmentAmount',
    subscriptionTerm: 'subscriptionTerm'
  };
  const productDetailsDataMap = {
    name: 'name',
    fields: 'fields',
    purchaseQuantityRule: 'purchaseQuantityRule',
    sku: 'sku',
    thumbnailImage: 'thumbnailImage',
    productId: 'productId',
    variationAttributes: 'variationAttributes',
    productSubscriptionInformation: 'productSubscriptionInformation',
    productUrlName: 'productUrlName'
  };
  const remappedCartItems = cartItemSummaryData.map(cartItemSummary => {
    const cartItem = cartItemSummary.cartItem;
    const cartItemDataBase = remapData(cartItemDescDataMap, cartItem);
    const cartItemNumberData = transformCartItemData(cartItem, cartItemNumberDataMap);
    const productDetailData = remapData(productDetailsDataMap, cartItem?.productDetails);
    const enhancedCartItemDataBase = {
      ...cartItemDataBase,
      subscriptionType: productDetailData.productSubscriptionInformation?.sellingModelType
    };
    return {
      ...enhancedCartItemDataBase,
      ...cartItemNumberData,
      ProductDetails: productDetailData
    };
  });
  return remappedCartItems;
}