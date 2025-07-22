export function getOneTimeProductSellingModelPrice(productSellingModels, productPriceEntries) {
  const oneTimeProductSellingModelId = productSellingModels?.find(productSellingModel => productSellingModel.sellingModelType === 'OneTime')?.id;
  return oneTimeProductSellingModelId ? productPriceEntries?.find(productPriceEntry => productPriceEntry.productSellingModelId === oneTimeProductSellingModelId) : undefined;
}