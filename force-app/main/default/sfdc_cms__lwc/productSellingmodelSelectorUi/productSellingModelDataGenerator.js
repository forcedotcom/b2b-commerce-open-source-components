export function prepareProductSellingModelData(product, productPricing) {
  const productSellingModels = [];
  if (product && productPricing) {
    const productSellingModelDetailMap = product?.productSellingModels?.reduce((map, productSellingModel) => {
      map.set(productSellingModel.id, productSellingModel);
      return map;
    }, new Map());
    productPricing.productPriceEntries?.forEach(productPriceEntry => {
      const productSellingModel = productSellingModelDetailMap?.get(productPriceEntry.productSellingModelId);
      if (productSellingModel) {
        productSellingModels.push({
          productSellingModelId: productSellingModel.id,
          detail: productSellingModel,
          price: productPriceEntry
        });
      }
    });
  }
  return productSellingModels;
}