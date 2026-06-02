const PRODUCT_UNAVAILABLE_MESSAGE = 'FAILED_LOAD_PRODUCT_DETAILS';
function isPurchasedProductSummaryData(product) {
  return Object.prototype.hasOwnProperty.call(product, 'isAvailable');
}
function isProductInformationData(product) {
  return Object.prototype.hasOwnProperty.call(product, 'prices');
}
function isFieldsRecord(fields) {
  return fields != null && !Array.isArray(fields);
}
export function isWishlistItemData(product) {
  return typeof product === 'object' && product != null && Reflect.has(product, 'wishlistItemId');
}
const convertToFieldValueData = function (input) {
  return Object.fromEntries(Object.entries(input).map(([key, value]) => [key, {
    value: value ?? null
  }]));
};
function convertToProductAttributeSummary(input) {
  return Object.entries(input).map(([apiName, data]) => ({
    apiName,
    label: data.label,
    sequence: data.sequence || 0,
    value: data.value
  }));
}
const extractPrice = function (key, product) {
  if (isProductInformationData(product)) {
    const price = product.prices?.[key];
    return price ? parseFloat(price) : price === undefined ? undefined : null;
  }
  return null;
};
const extractStockKeepingUnit = function (fields) {
  if (!isFieldsRecord(fields)) {
    return null;
  }
  const sku = fields?.StockKeepingUnit?.value;
  return sku || null;
};
export function transformProductData(product) {
  const salesPrice = isPurchasedProductSummaryData(product) ? product.salesPrice : extractPrice('unitPrice', product);
  const listPrice = isPurchasedProductSummaryData(product) ? product.listPrice : extractPrice('listPrice', product);
  return {
    id: product.id,
    sku: isPurchasedProductSummaryData(product) ? product.sku ?? null : extractStockKeepingUnit(product.fields),
    name: product.name,
    thumbnailImage: isPurchasedProductSummaryData(product) ? product.thumbnailImage : product.defaultImage,
    mediaGroups: product.mediaGroups,
    fields: product.fields,
    variationAttributeSet: product.variationAttributeSet,
    purchaseQuantityRule: product.purchaseQuantityRule,
    productSellingModelInformation: product.productSellingModelInformation,
    isAvailable: isPurchasedProductSummaryData(product) ? product.isAvailable : true,
    currencyIsoCode: isPurchasedProductSummaryData(product) ? product.currencyIsoCode : '',
    salesPrice,
    listPrice,
    urlName: !isPurchasedProductSummaryData(product) && product.urlName || undefined,
    promotionalPrices: isPurchasedProductSummaryData(product) || !product.prices?.promotionalPrices ? undefined : product.prices.promotionalPrices,
    productClass: product.productClass ?? null,
    isConfigurationAllowed: product.isConfigurationAllowed ?? false,
    productVariationInfoData: isPurchasedProductSummaryData(product) ? {
      attributesToProductMappings: [],
      variationAttributeInfo: {}
    } : product.variationInfo
  };
}
export function transformWishlistItemData(product) {
  return {
    id: product.productSummary?.productId ?? null,
    sku: product.productSummary?.sku ?? null,
    name: product.productSummary?.name ?? null,
    thumbnailImage: product.productSummary?.thumbnailImage ?? null,
    mediaGroups: product.productSummary?.mediaGroups ?? null,
    fields: convertToFieldValueData(product.productSummary?.fields || {}),
    variationAttributeSet: {
      attributes: convertToProductAttributeSummary(product.productSummary?.variationAttributes || {})
    },
    purchaseQuantityRule: product.productSummary?.purchaseQuantityRule ?? null,
    productSellingModelInformation: null,
    isAvailable: PRODUCT_UNAVAILABLE_MESSAGE !== product?.error?.errorCode,
    currencyIsoCode: product.currencyIsoCode,
    salesPrice: product.salesPrice,
    listPrice: product.listPrice,
    promotionalPrices: undefined,
    productClass: product.productSummary?.productClass ?? null,
    isConfigurationAllowed: product.productSummary?.isConfigurationAllowed ?? false
  };
}