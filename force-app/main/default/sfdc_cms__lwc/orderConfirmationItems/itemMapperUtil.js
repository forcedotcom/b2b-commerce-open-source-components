const normalizeSubscriptionTermUnit = subscriptionTermUnit => {
  return subscriptionTermUnit === 'Months' ? 'Monthly' : subscriptionTermUnit;
};
const TOTAL_AMOUNT_WITH_TAX = 'TotalAmtWithTax';
const TOTAL_PRICE_FIELD = 'TotalPrice';
const getSubscriptionPriceVal = subscriptionPrice => {
  if (subscriptionPrice && Number(subscriptionPrice) > 0) {
    return subscriptionPrice;
  }
  return undefined;
};
const DATE = 'DATE';
const DATE_TIME = 'DATETIME';
const getFieldValue = field => {
  const isDateTypeField = field?.type?.toUpperCase() === DATE || field?.type?.toUpperCase() === DATE_TIME;
  if (isDateTypeField && field.text) {
    return new Date(field.text).toISOString();
  }
  return field?.text ?? undefined;
};
const getItemFields = item => {
  const fields = {};
  if (item?.fields) {
    for (const field of Object.keys(item.fields)) {
      fields[field] = getFieldValue(item.fields?.[field]);
    }
  }
  if (item?.product?.fields) {
    for (const field of Object.keys(item.product.fields)) {
      if (!(field in fields)) {
        fields[field] = getFieldValue(item.product.fields?.[field]);
      }
    }
  }
  return fields;
};
const getPriceByTaxLocale = (item, isDataFromCart) => {
  if (!isDataFromCart && item.taxLocale === 'Gross') {
    return Number(item.fields?.[TOTAL_AMOUNT_WITH_TAX]?.text ?? 0);
  }
  return Number(item.fields?.[TOTAL_PRICE_FIELD]?.text ?? 0);
};
const rollUpChildItemPrices = (item, isDataFromCart) => {
  const parentPrice = getPriceByTaxLocale(item, isDataFromCart);
  const childrenTotal = item.associatedLineItems.reduce((sum, childItem) => {
    const childPrice = getPriceByTaxLocale(childItem, isDataFromCart);
    return sum + childPrice;
  }, 0);
  const totalPrice = parentPrice + childrenTotal;
  return totalPrice > 0 ? totalPrice : undefined;
};
const rollUpFirstPaymentPrices = item => {
  const parentPrice = Number(item?.fields?.TotalFirstPaymentPrice?.text) || 0;
  const childrenTotal = item.associatedLineItems.reduce((sum, childItem) => {
    const childPrice = Number(childItem?.fields?.TotalFirstPaymentPrice?.text) || 0;
    return sum + childPrice;
  }, 0);
  const totalFirstPaymentPrice = parentPrice + childrenTotal;
  return totalFirstPaymentPrice > 0 ? totalFirstPaymentPrice.toFixed(2) : undefined;
};
export const transformDeliveryToCartItems = (deliveryItems, isDataFromCart = false) => {
  return deliveryItems.map(item => ({
    id: item?.id,
    name: item?.product?.fields?.Name?.text ?? undefined,
    quantity: Number(item?.fields?.Quantity?.text),
    itemizedAdjustmentAmount: item?.fields?.ItemizedAdjustmentAmount?.text ?? undefined,
    salesPrice: item?.fields?.ListPrice?.text ?? undefined,
    amount: item?.fields?.TotalListPrice?.text ?? undefined,
    listPrice: item?.fields?.ReferencePrice?.text ?? undefined,
    price: rollUpChildItemPrices(item, isDataFromCart)?.toString(),
    unitAdjustedPriceWithItemAdj: item?.fields?.UnitAdjustedPriceWithItemAdj?.text ?? undefined,
    ProductDetails: {
      name: item?.product?.fields?.Name?.text ?? undefined,
      productId: item?.product?.id,
      sku: item?.product?.fields?.StockKeepingUnit?.text ?? undefined,
      thumbnailImage: item?.product?.media,
      variationAttributes: item?.product?.variationAttributes,
      dynamicAttributes: item?.product?.dynamicAttributes,
      fields: getItemFields(item)
    },
    productClass: item?.itemClass,
    childProductCount: Number(item?.fields?.ChildProductCount?.text || item?.associatedLineItems?.length || 0),
    firstPymtPrice: getSubscriptionPriceVal(rollUpFirstPaymentPrices(item)),
    firstPymtTotalListPrice: getSubscriptionPriceVal(item?.fields?.TotalFirstPymtListPrice?.text),
    subscriptionTermUnit: normalizeSubscriptionTermUnit(item?.productSellingModel?.pricingTermUnit) ?? undefined,
    subscriptionTerm: item?.fields?.SubscriptionTerm?.text ?? undefined,
    subscriptionType: item?.productSellingModel?.sellingModelType ?? undefined,
    isConfigurationAllowed: Object.keys(item?.product?.dynamicAttributes ?? {}).length > 0
  }));
};