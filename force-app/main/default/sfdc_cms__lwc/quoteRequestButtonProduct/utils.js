export function isProductOutOfStock(availableQuantity, purchaseQuantityRuleMinimum) {
  const availableToOrder = availableQuantity ?? null;
  const minimum = purchaseQuantityRuleMinimum ?? 1;
  return availableToOrder !== null && (availableToOrder === 0 || minimum > availableToOrder);
}