export default function displayOriginalPrice(showNegotiatedPrice, showOriginalPrice, negotiatedPrice, originalPrice) {
  const showBothPrices = showOriginalPrice && showNegotiatedPrice;
  const originalPriceExists = !!originalPrice && Number(originalPrice) >= 0;
  const negotiatedPriceExists = !!negotiatedPrice && Number(negotiatedPrice) >= 0;
  const originalPriceIsAvailableAndGreaterThanNegotiatedPrice = originalPriceExists && negotiatedPriceExists && Number(originalPrice) > Number(negotiatedPrice);
  return showBothPrices && originalPriceIsAvailableAndGreaterThanNegotiatedPrice;
}