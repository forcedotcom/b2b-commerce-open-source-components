export function isProductAvailable(availableToOrder, product) {
  const minimum = Number(product?.purchaseQuantityRule?.minimum) || 1;
  return (availableToOrder ?? minimum) - minimum >= 0;
}
export function transformToVariationAttributeSet(product) {
  if (!product || typeof product !== 'object' || !('variationAttributeSet' in product) || !('variationInfo' in product)) {
    return {
      attributes: []
    };
  }
  const {
    variationAttributeSet,
    variationInfo
  } = product;
  const attributes = variationAttributeSet?.attributes || {};
  const variationAttributeInfo = variationInfo?.variationAttributeInfo || {};
  return {
    attributes: Object.keys(attributes).reduce((acc, key) => {
      return variationAttributeInfo?.[key] && attributes[key] ? [...acc, {
        value: attributes[key],
        sequence: variationAttributeInfo[key].sequence,
        label: variationAttributeInfo[key].label
      }] : acc;
    }, [])
  };
}
export function transformToProductRecommendation(product, productPricing, availableToOrder, isChecked = true, isMainProduct = false) {
  const prices = {
    listPrice: productPricing.listPrice,
    unitPrice: productPricing.unitPrice,
    productId: product.id,
    success: true,
    error: null,
    pricebookEntryId: productPricing.pricebookEntryId
  };
  const isAvailable = isProductAvailable(availableToOrder, product);
  return {
    id: product.id,
    productClass: product.productClass,
    name: product.fields?.Name,
    fields: product?.fields,
    defaultImage: product?.defaultImage,
    prices,
    variationAttributeSet: transformToVariationAttributeSet(product),
    purchaseQuantityRule: product?.purchaseQuantityRule,
    isMainProduct,
    isChecked: isAvailable ? isChecked : false,
    isDisabled: !isAvailable
  };
}
export function transformToAlignItemsProperty(sectionContentAlignment) {
  switch (sectionContentAlignment) {
    case 'left':
      return 'flex-start';
    case 'right':
      return 'flex-end';
    case 'center':
      return 'center';
    default:
      return 'flex-start';
  }
}