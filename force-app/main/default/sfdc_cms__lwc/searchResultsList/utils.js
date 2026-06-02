export function tranformCollection(cardCollection) {
  const productCardCollection = (cardCollection || []).map((card, index) => {
    const {
      image,
      prices,
      ...dataProps
    } = card;
    let pricesData;
    if (prices) {
      const {
        listingPrice,
        negotiatedPrice,
        ...priceDataProps
      } = prices;
      pricesData = {
        listPrice: listingPrice,
        unitPrice: negotiatedPrice,
        ...priceDataProps
      };
    }
    const cardData = {
      defaultImage: image,
      prices: pricesData,
      ...dataProps
    };
    return {
      data: cardData,
      id: index,
      key: index,
      index
    };
  });
  return productCardCollection;
}
export function generateClassForSpacing(spacing, direction) {
  return ['none', 'small', 'medium', 'large'].includes(spacing) ? `slds-m-${direction}_${spacing}` : '';
}