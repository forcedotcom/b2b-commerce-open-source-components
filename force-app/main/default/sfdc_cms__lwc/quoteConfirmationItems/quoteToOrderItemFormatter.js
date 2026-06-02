function quoteItemFieldsList(fieldMapping, item) {
  return fieldMapping.reduce((result, fieldConfig) => {
    const fieldName = fieldConfig.name;
    if (!fieldName) {
      return result;
    }
    const sourceField = item.fields?.[fieldName] ?? item.product?.fields?.[fieldName];
    if (sourceField?.text != null) {
      result.push({
        dataName: fieldName,
        label: fieldConfig.label,
        text: sourceField.text,
        type: sourceField.type ?? 'string'
      });
    }
    return result;
  }, []);
}
export function formatQuoteItemToOrderItem(entry, productFieldMapping, childProductFieldMapping) {
  const item = entry.item;
  const associatedLineItems = entry.associatedLineItems ?? [];
  const product = item.product;
  const image = product?.image;
  const media = {
    alternateText: image?.alternateText ?? null,
    contentVersionId: image?.contentVersionId ?? null,
    id: image?.id ?? null,
    mediaType: image?.mediaType ?? null,
    sortOrder: image?.sortOrder ?? 0,
    thumbnailUrl: image?.thumbnailUrl ?? null,
    title: image?.title ?? null,
    url: image?.url ?? image?.thumbnailUrl ?? null
  };
  const variants = (product?.variationAttributes ?? []).map(attr => ({
    name: attr.label,
    value: attr.value
  }));
  const totalPriceText = item.fields?.TotalPrice?.text;
  const totalPrice = totalPriceText != null ? Number(totalPriceText) : undefined;
  const productClass = item.product?.fields?.ProductClass?.text;
  const itemClass = productClass === 'Bundle' || productClass === 'Set' || productClass === 'Simple' || productClass === 'Variation' || productClass === 'VariationParent' ? productClass : null;
  const associatedOrderItems = itemClass === 'Bundle' && associatedLineItems.length > 0 ? associatedLineItems.map(child => formatQuoteItemToOrderItem({
    item: child,
    associatedLineItems: []
  }, childProductFieldMapping, childProductFieldMapping)) : [];
  const canViewProduct = product?.canViewProduct ?? true;
  return {
    orderItemSummaryId: item.id?.slice(0, 15) ?? '',
    name: product?.fields?.Name?.text ?? product?.name ?? '',
    fields: quoteItemFieldsList(productFieldMapping, item),
    totalPrice,
    isValid: canViewProduct,
    variants,
    adjustments: [],
    productId: product?.id ?? '',
    productSellingModel: null,
    processExceptions: [],
    itemClass,
    associatedOrderItems,
    media,
    errorCode: product?.error?.code ?? null,
    errorMessage: product?.error?.message ?? null,
    canViewProduct
  };
}