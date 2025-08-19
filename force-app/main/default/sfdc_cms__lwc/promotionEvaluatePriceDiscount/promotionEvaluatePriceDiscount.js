export function displayDiscountPrice(showDiscountPrice, discountPrice) {
  const discountPriceExists = typeof discountPrice === 'string' && !isNaN(parseFloat(discountPrice)) && Number(discountPrice) < 0;
  return showDiscountPrice && discountPriceExists;
}