export function getPaymentIconPath(value, basePath) {
  if (value.paymentSubType?.toLowerCase() === 'creditcard') {
    switch (value.paymentType?.toLowerCase()) {
      case 'visa':
        return basePath + '/assets/images/Cards.svg#visa';
      case 'discover':
        return basePath + '/assets/images/Cards.svg#discover';
      case 'americanexpress':
        return basePath + '/assets/images/Cards.svg#amex';
      case 'mastercard':
        return basePath + '/assets/images/Cards.svg#mastercard';
      default:
        return basePath + '/assets/images/Cards.svg#blank';
    }
  } else {
    return basePath + '/assets/images/Cards.svg#blank';
  }
}