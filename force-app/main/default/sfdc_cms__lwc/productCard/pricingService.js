export function getPrimaryPrice(priceType, listPrice, salePrice) {
  if (priceType) {
    if (salePrice) {
      return salePrice;
    } else if (listPrice) {
      return listPrice;
    }
  }
  return listPrice === undefined ? undefined : null;
}
export function getSecondaryPrice(priceType, listPrice, salePrice) {
  if (priceType === 'displayAllPrices' && !!salePrice && !!listPrice) {
    return listPrice;
  }
  return undefined;
}