const DEFAULT_MEDIA = {
  alternateText: null,
  contentVersionId: null,
  id: null,
  mediaType: null,
  sortOrder: 0,
  thumbnailUrl: null,
  title: null,
  url: null
};
export const defaultSkuLabel = 'SKU';
export const defaultQuantityLabel = 'Qty';
const quantityFieldName = 'Quantity';
const skuFieldName = 'SKU';
const WISHLIST_ITEM_DEFAULT_QUANTITY = 1;
function transformVariantsArray(variationAttributes) {
  if (!variationAttributes) {
    return [];
  }
  return Object.values(variationAttributes).map(attr => ({
    name: attr.label || '',
    value: attr.value || ''
  }));
}
export function createFieldsArray(quantity, sku, modalLabels) {
  const quantityField = {
    dataName: quantityFieldName,
    label: modalLabels?.quantityLabel || defaultQuantityLabel,
    text: quantity != null ? quantity.toString() : '0',
    type: 'DOUBLE'
  };
  const fields = [quantityField];
  if (sku != null && sku.trim() !== '') {
    fields.push({
      dataName: skuFieldName,
      label: modalLabels?.skuLabel || defaultSkuLabel,
      text: sku,
      type: 'STRING'
    });
  }
  return fields;
}
function transformChildToOrderItem(child, modalLabels) {
  const product = child.productSummary;
  const fields = createFieldsArray(child.quantity, product?.sku, modalLabels);
  return {
    orderItemSummaryId: child.wishlistItemId || '',
    id: child.wishlistItemId ?? undefined,
    name: product?.name ?? null,
    totalPrice: 0,
    productId: product?.productId || '',
    media: product?.thumbnailImage || DEFAULT_MEDIA,
    fields: fields,
    isValid: true,
    variants: transformVariantsArray(product?.variationAttributes),
    associatedOrderItems: [],
    itemClass: product?.productClass ?? null,
    productSellingModel: null,
    processExceptions: [],
    dynamicAttributes: product?.dynamicAttributes ?? null
  };
}
export function convertWishlistItemToOrderItem(item, childItemsData, modalLabels) {
  const product = item?.productSummary;
  const fields = createFieldsArray(item?.quantity ?? WISHLIST_ITEM_DEFAULT_QUANTITY, product?.sku, modalLabels);
  const associatedOrderItems = (childItemsData?.items ?? []).map(child => transformChildToOrderItem(child, modalLabels));
  return {
    orderItemSummaryId: item?.wishlistItemId || '',
    id: item?.wishlistItemId ?? undefined,
    name: product?.name ?? null,
    totalPrice: 0,
    productId: product?.productId || '',
    media: product?.thumbnailImage || DEFAULT_MEDIA,
    fields: fields,
    isValid: true,
    variants: transformVariantsArray(product?.variationAttributes),
    associatedOrderItems: associatedOrderItems,
    itemClass: product?.productClass ?? null,
    productSellingModel: null,
    processExceptions: [],
    dynamicAttributes: product?.dynamicAttributes ?? null
  };
}