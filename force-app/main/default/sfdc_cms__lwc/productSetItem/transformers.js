function updateNegotiatedPriceForRange(quantityOrTerm, tiers, defaultPrice) {
  if (typeof quantityOrTerm === 'number') {
    const quantityOrTermFloor = Math.floor(quantityOrTerm);
    const applicableTier = tiers.find(tier => (tier.upperBound === null || quantityOrTermFloor <= Number(tier.upperBound)) && quantityOrTermFloor >= Number(tier.lowerBound));
    if (applicableTier !== undefined) {
      return applicableTier.tierUnitPrice;
    }
  }
  return defaultPrice;
}
export function calculateNegotiatedPriceForPriceBookEntry(priceEntry, quantity, subscriptionTerm) {
  const priceAdjustment = priceEntry.priceAdjustment;
  if (priceAdjustment && priceAdjustment.adjustmentMethod === 'Range') {
    const quantityOrTerm = priceAdjustment.scheduleType === 'Volume' ? quantity : subscriptionTerm;
    return updateNegotiatedPriceForRange(quantityOrTerm, priceAdjustment.priceAdjustmentTiers, priceEntry.unitPrice);
  }
  return priceEntry.unitPrice;
}