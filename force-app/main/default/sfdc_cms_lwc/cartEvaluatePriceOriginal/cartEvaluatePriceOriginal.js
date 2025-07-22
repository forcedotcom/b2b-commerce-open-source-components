export default function canDisplayOriginalPrice(showNegotiatedPrice, showOriginalPrice, negotiatedPrice, originalPrice) {
  const showBothNegotiatedPriceAndOriginalPrice = showOriginalPrice && showNegotiatedPrice;
  const originalPriceExists = originalPrice !== null && originalPrice !== undefined && Number(originalPrice) >= 0;
  const negotiatedPriceExists = negotiatedPrice !== null && negotiatedPrice !== undefined && Number(negotiatedPrice) >= 0;
  const originalPriceIsAvailableAndGreaterThanNegotiatedPrice = originalPriceExists && negotiatedPriceExists && Number(originalPrice) > Number(negotiatedPrice);
  return showBothNegotiatedPriceAndOriginalPrice && originalPriceIsAvailableAndGreaterThanNegotiatedPrice;
}