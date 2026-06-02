const getItemFields = (item, fieldMapping) => {
  const fields = {};
  fieldMapping.forEach(fieldConfig => {
    const fieldName = fieldConfig.name;
    if (!fieldName) {
      return;
    }
    if (item.fields?.[fieldName]) {
      const field = item.fields[fieldName];
      const fieldValue = field.text || '';
      fields[fieldName] = fieldValue;
    } else if (item.product?.fields?.[fieldName]) {
      const field = item.product.fields[fieldName];
      const fieldValue = field.text || '';
      fields[fieldName] = fieldValue;
    }
  });
  return fields;
};
const transformVariationAttributes = variationAttributes => {
  if (!variationAttributes || !Array.isArray(variationAttributes)) {
    return {};
  }
  const transformed = {};
  variationAttributes.forEach(attr => {
    const typedAttr = attr;
    if (typedAttr.apiName) {
      transformed[typedAttr.apiName] = {
        label: typedAttr.label,
        value: typedAttr.value,
        apiName: typedAttr.apiName,
        sequence: typedAttr.sequence
      };
    }
  });
  return transformed;
};
const buildChildCountMap = items => {
  const countMap = new Map();
  items.forEach(item => {
    const parentId = item.fields?.ParentQuoteLineItemId?.text?.trim();
    if (parentId) {
      countMap.set(parentId, (countMap.get(parentId) ?? 0) + 1);
    }
  });
  return countMap;
};
export const transformQuoteToCartItems = (quoteLineItems, fieldMapping, productUnavailableMessage) => {
  const validItems = quoteLineItems.filter(item => !!item);
  const childCountMap = buildChildCountMap(validItems);
  return validItems.filter(item => {
    const parentId = item.fields?.ParentQuoteLineItemId?.text?.trim();
    return !parentId;
  }).map(item => {
    const canViewProduct = item.product?.canViewProduct ?? true;
    const messages = !canViewProduct && productUnavailableMessage ? [{
      message: productUnavailableMessage,
      severity: 'Info',
      type: 'Inventory'
    }] : undefined;
    return {
      id: item.id,
      name: item.product?.name ?? undefined,
      quantity: Number(item.fields?.Quantity?.text) || 0,
      itemizedAdjustmentAmount: undefined,
      salesPrice: item.fields?.UnitPrice?.text ?? undefined,
      amount: undefined,
      listPrice: item.fields?.TotalStrikethroughPrice?.text ?? undefined,
      price: item.fields?.TotalPrice?.text ?? undefined,
      unitAdjustedPriceWithItemAdj: undefined,
      ProductDetails: {
        name: item.product?.name ?? undefined,
        productId: item.product?.id ?? undefined,
        sku: item.product?.sku ?? undefined,
        thumbnailImage: item.product?.image,
        variationAttributes: transformVariationAttributes(item.product?.variationAttributes ?? undefined),
        fields: getItemFields(item, fieldMapping),
        purchaseQuantityRule: item.product?.purchaseQuantityRule ?? undefined
      },
      productClass: item.product?.fields?.ProductClass?.text ?? undefined,
      childProductCount: childCountMap.get(item.id) ?? 0,
      firstPymtPrice: undefined,
      firstPymtTotalListPrice: undefined,
      canViewProduct,
      Messages: messages,
      quoteLineItemId: item.id
    };
  });
};