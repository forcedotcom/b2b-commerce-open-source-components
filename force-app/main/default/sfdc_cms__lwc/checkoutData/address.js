export function convertStreetToCompactAddress(street) {
  const streetParts = street.split('\n');
  if (streetParts.length === 1) {
    return {
      street: street,
      subpremise: ''
    };
  }
  return {
    street: streetParts[0],
    subpremise: street.substring(street.indexOf('\n') + 1).replace('\n', ' ')
  };
}
export function convertCompactAddressToStreet(compactAddress) {
  return compactAddress.subpremise ? `${compactAddress.street.trim()}\n${compactAddress.subpremise}` : compactAddress.street;
}