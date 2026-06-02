import formatAsCurrency from 'site/commonFormatterCurrency';
export function transformPromotions(promotions, currencyCode) {
  if (!(currencyCode || '').length) {
    return promotions;
  }
  return promotions.map(promotion => {
    return {
      ...promotion,
      formattedDiscountAmount: formatAsCurrency(currencyCode, promotion.discountAmount)
    };
  });
}