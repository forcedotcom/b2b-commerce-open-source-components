import { processOrderItemAdjustmentsData } from './processOrderItemAdjustmentsData';
const TOTAL_AMOUNT_WITH_TAX = 'TotalAmtWithTax';
const FIRST_PAYMENT_TOTAL_PRICE_FIELD = 'TotalFirstPaymentPrice';
const TOTAL_PRICE_FIELD = 'TotalPrice';
const SUBSCRIPTION_ASSET_ID_FIELD = 'AssetId';
const SUBSCRIPTION_TERM_FIELD = 'SubscriptionTerm';
const PRODUCT_IS_ASSETISABLE_FIELD = 'IsAssetizable';
const ORDER_ITEM_SUMMARY_ENTITY_NAME = 'OrderItemSummary';
const PRODUCT_ENTITY_NAME = 'Product2';
const FIRST_PAYMENT_FIELDS_TO_EXISTING_FIELDS_MAP = {
  'OrderItemSummary.TotalFirstPaymentPrice': 'OrderItemSummary.TotalPrice',
  'OrderItemSummary.TotalFirstPaymentTaxAmount': 'OrderItemSummary.TotalTaxAmount',
  'OrderItemSummary.TotalFirstPaymentAdjustmentAmount': 'OrderItemSummary.TotalAdjustmentAmount',
  'OrderItemSummary.TotalLineFirstPaymentAmount': 'OrderItemSummary.TotalLineAmount',
  'OrderItemSummary.TotalLineFirstPaymentTaxAmount': 'OrderItemSummary.TotalLineTaxAmount',
  'OrderItemSummary.TotalFirstPaymentAmountWithTax': 'OrderItemSummary.TotalAmtWithTax'
};
const getPriceForItem = (item, pricingField) => {
  return Number(item.fields?.[pricingField]?.text ?? 0);
};
const rollUpChildItemPrices = (item, pricingField) => {
  const parentPrice = getPriceForItem(item, pricingField);
  const childrenTotal = item.associatedLineItems.reduce((sum, childItem) => sum + getPriceForItem(childItem, pricingField), 0);
  const totalPrice = parentPrice + childrenTotal;
  return totalPrice > 0 ? totalPrice : undefined;
};
const getTotalPriceInfoForOrderItem = item => {
  const priceFromFirstPaymentField = rollUpChildItemPrices(item, FIRST_PAYMENT_TOTAL_PRICE_FIELD);
  let priceFromTotalPriceField;
  if (!priceFromFirstPaymentField) {
    const fallbackPricingField = item.taxLocale === 'Gross' ? TOTAL_AMOUNT_WITH_TAX : TOTAL_PRICE_FIELD;
    priceFromTotalPriceField = rollUpChildItemPrices(item, fallbackPricingField);
  }
  return {
    totalPrice: priceFromFirstPaymentField ? priceFromFirstPaymentField : priceFromTotalPriceField,
    firstPaymentPriceExists: priceFromFirstPaymentField ? true : false
  };
};
const getFieldDetailsForOrderItemSummary = (item, field) => {
  if (!Reflect.has(FIRST_PAYMENT_FIELDS_TO_EXISTING_FIELDS_MAP, `${ORDER_ITEM_SUMMARY_ENTITY_NAME}.${field.name}`)) {
    return item.fields[field.name];
  }
  const oldFieldName = FIRST_PAYMENT_FIELDS_TO_EXISTING_FIELDS_MAP[`${ORDER_ITEM_SUMMARY_ENTITY_NAME}.${field.name}`].split('.')[1];
  const firstPaymentFieldValue = item.fields[field.name]?.text ? Number(item.fields[field.name].text) : undefined;
  return {
    ...(item.fields[field.name] ?? item.fields[oldFieldName]),
    dataName: field.name,
    text: firstPaymentFieldValue ? item.fields[field.name]?.text : item.fields[oldFieldName]?.text
  };
};
export function itemFieldsList(productFieldMapping, item) {
  return productFieldMapping.reduce((result, field) => {
    if (field.entity === 'OrderAdjustmentAggregateSummary') {
      const value = field.name === 'TotalLinePromotionAmount' ? item.adjustmentAggregates.totalLinePromotionAmount : item.adjustmentAggregates.totalPromotionDistAmount;
      if (value && Number(value) !== 0) {
        result.push({
          label: field.label,
          text: value,
          type: 'Currency',
          dataName: field.name
        });
      }
    } else if (field.entity === ORDER_ITEM_SUMMARY_ENTITY_NAME) {
      const entityFieldForOrderItemSummary = getFieldDetailsForOrderItemSummary(item, field);
      if (entityFieldForOrderItemSummary?.text) {
        result.push({
          ...entityFieldForOrderItemSummary,
          label: field.label
        });
      }
    } else if (item.product?.fields[field.name] && field.entity === PRODUCT_ENTITY_NAME) {
      result.push({
        ...item.product.fields[field.name],
        label: field.label
      });
    }
    return result;
  }, []);
}
export function formatOrderItems(itemsData, productFieldMapping, childProductFieldMapping, showTotal, otherAdjustmentsLabel) {
  const items = JSON.parse(JSON.stringify(itemsData));
  return items?.reduce((result, item) => {
    const itemFields = itemFieldsList(productFieldMapping, item);
    const isItemValid = Boolean(item.product?.canViewProduct);
    const variants = [];
    if (item.product != null) {
      const variationAttributes = Object.values(item.product?.variationAttributes);
      variationAttributes.forEach(variation => {
        variants.push({
          name: variation.label,
          value: variation.value
        });
      });
      item.product.media.url = item.product.media.thumbnailUrl || item.product.media.url;
    }
    const subscriptionTerm = item.fields[SUBSCRIPTION_TERM_FIELD]?.text ? Number(item.fields[SUBSCRIPTION_TERM_FIELD]?.text) : undefined;
    const assetId = item.fields[SUBSCRIPTION_ASSET_ID_FIELD]?.text;
    const isAssetizable = item.product?.fields[PRODUCT_IS_ASSETISABLE_FIELD]?.text === 'true';
    const totalPriceInfo = showTotal ? getTotalPriceInfoForOrderItem(item) : {
      totalPrice: undefined,
      firstPaymentPriceExists: false
    };
    result.push({
      ...item.product,
      name: item.product?.fields?.Name?.text ?? '',
      orderItemSummaryId: item.id?.slice(0, 15),
      fields: itemFields,
      totalPrice: totalPriceInfo.totalPrice,
      firstPaymentPriceExists: totalPriceInfo.firstPaymentPriceExists,
      isValid: isItemValid,
      variants: variants,
      adjustments: processOrderItemAdjustmentsData(item, otherAdjustmentsLabel || ''),
      productId: item.product?.id ?? '',
      productSellingModel: item.productSellingModel,
      processExceptions: item.processExceptions,
      subscriptionTerm: subscriptionTerm,
      assetId: assetId,
      isAssetizable: isAssetizable,
      itemClass: item.itemClass,
      dynamicAttributes: item.product?.dynamicAttributes,
      associatedOrderItems: item.itemClass === 'Bundle' ? formatOrderItems(item.associatedLineItems, childProductFieldMapping, childProductFieldMapping, showTotal, otherAdjustmentsLabel) : []
    });
    return result;
  }, []);
}
export function processOrderItemData(orderDeliveryGroup, newFormattedItems, nextPageToken) {
  return {
    ...orderDeliveryGroup,
    orderItemsErrorMessage: undefined,
    orderItems: orderDeliveryGroup.orderItems ? orderDeliveryGroup.orderItems.concat(newFormattedItems) : newFormattedItems,
    orderItemsHasNextPage: nextPageToken ? true : false,
    orderItemNextPageToken: nextPageToken
  };
}