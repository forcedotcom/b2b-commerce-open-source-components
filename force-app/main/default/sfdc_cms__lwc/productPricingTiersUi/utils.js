export function transformTierAdjustmentContents(data) {
  return (data?.priceAdjustment?.priceAdjustmentTiers ?? []).map(({
    id,
    adjustmentType,
    adjustmentValue,
    lowerBound,
    upperBound,
    tierUnitPrice
  }) => ({
    id,
    adjustmentValue,
    adjustmentValueFormat: adjustmentType === 'PercentageBasedAdjustment' ? 'percent-fixed' : 'currency',
    lowerBound,
    upperBound,
    tierUnitPrice
  }));
}