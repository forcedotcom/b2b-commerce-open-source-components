export function getPageVariant(pageRef) {
  if (pageRef?.attributes?.objectApiName === 'OrderSummary' && Boolean(pageRef?.attributes.recordId)) {
    return 'OrderDetail';
  }
  if (pageRef?.attributes?.name === 'Address_Form') {
    return 'Addresses';
  }
  return 'Misc';
}
export function isMenuItemCurrentPage(menuItem, currentPageUrl) {
  return menuItem?.actionValue?.split('?')[0] === currentPageUrl?.split('?')[0];
}
export function isMenuItemMatchingUrl(menuItem, matchingUrl) {
  return menuItem?.actionValue?.split('?')[0].endsWith(matchingUrl) ?? false;
}
export function isCurrentPage(menuItem, currentPageUrl, pageRef) {
  const pageVariant = getPageVariant(pageRef);
  switch (pageVariant) {
    case 'OrderDetail':
      return isMenuItemMatchingUrl(menuItem, '/OrderSummary/OrderSummary/Default');
    case 'Addresses':
      return isMenuItemMatchingUrl(menuItem, '/addresses');
    default:
      return isMenuItemCurrentPage(menuItem, currentPageUrl);
  }
}