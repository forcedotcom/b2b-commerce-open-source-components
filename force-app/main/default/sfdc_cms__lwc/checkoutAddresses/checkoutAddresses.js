import { addressSingleLineBreak } from './labels';
import LOCALE from '@salesforce/i18n/locale';
import { formatAddressAllFields } from './utils';
function coalesceFalsey(v) {
  return v ? v : null;
}
function shallowCompare(obj1, obj2, keys) {
  return keys.every(key => coalesceFalsey(obj1[key]) === coalesceFalsey(obj2[key]));
}
export function isSameDeliveryAddress(firstShippingAddress, secondShippingAddress) {
  if (!firstShippingAddress || !secondShippingAddress) {
    return false;
  }
  return shallowCompare(firstShippingAddress, secondShippingAddress, ['firstName', 'lastName', 'companyName', 'city', 'street', 'postalCode', 'region', 'country', 'phoneNumber']);
}
export function isSameBillingAddress(firstShippingAddress, secondShippingAddress) {
  if (!firstShippingAddress || !secondShippingAddress) {
    return false;
  }
  return shallowCompare(firstShippingAddress, secondShippingAddress, ['city', 'street', 'postalCode', 'region', 'country']);
}
export function isSameDeliveryMethod(first, second) {
  if (!first || !second) {
    return false;
  }
  return shallowCompare(first, second, ['carrier', 'classOfService', 'currencyIsoCode', 'id', 'name', 'shippingFee']);
}
export function isSameAvailableDeliveryMethods(first, second) {
  if (first.length !== second.length) {
    return false;
  }
  const differentOptions = first.filter(option1 => !second.some(option2 => isSameDeliveryMethod(option1, option2)));
  return !differentOptions.length;
}
export function isSameDeliveryGroupChoices(first, second, allowEmpty) {
  if (allowEmpty && !first && !second) {
    return true;
  }
  if (!first || !second) {
    return false;
  }
  return shallowCompare(first, second, ['desiredDeliveryDate', 'shippingInstructions', 'isGift', 'giftMessage']) && shallowCompare(first.selectedDeliveryMethod ?? {}, second.selectedDeliveryMethod ?? {}, ['id']) && isSameDeliveryAddress(first.deliveryAddress ?? {}, second.deliveryAddress ?? {});
}
export function isSameContactPointAddress(firstAddress, secondAddress) {
  if (!firstAddress || !secondAddress) {
    return false;
  }
  return shallowCompare(firstAddress, secondAddress, ['firstName', 'lastName', 'companyName', 'city', 'street', 'postalCode', 'region', 'country', 'isDefault', 'phoneNumber']);
}
export function isSamePhoneNumber(firstPhoneNumber, secondPhoneNumber) {
  if (!firstPhoneNumber || !secondPhoneNumber) {
    return !firstPhoneNumber && !secondPhoneNumber;
  }
  firstPhoneNumber = firstPhoneNumber.replace(/[-\s()]/g, '');
  secondPhoneNumber = secondPhoneNumber.replace(/[-\s()]/g, '');
  if (firstPhoneNumber[0] !== '+' && secondPhoneNumber[0] === '+') {
    const t = firstPhoneNumber;
    secondPhoneNumber = firstPhoneNumber;
    firstPhoneNumber = t;
  }
  if (firstPhoneNumber[0] === '+' && secondPhoneNumber[0] !== '+' && firstPhoneNumber.length > secondPhoneNumber.length) {
    secondPhoneNumber = firstPhoneNumber.substring(0, firstPhoneNumber.length - secondPhoneNumber.length) + secondPhoneNumber;
  }
  return firstPhoneNumber === secondPhoneNumber;
}
export function isSameContactInfo(firstContactInfo, secondContactInfo) {
  if (!firstContactInfo || !secondContactInfo) {
    return false;
  }
  return isSamePhoneNumber(firstContactInfo.phoneNumber, secondContactInfo.phoneNumber) && shallowCompare(firstContactInfo, secondContactInfo, ['email', 'firstName', 'lastName']);
}
export const northAmericanPhoneRegex = /^(?:\+?1[-. ]?)?\(?([0-9]{3})\)?[-. ]?([0-9]{3})[-. ]?([0-9]{4})$/;
export function getFormattedPhoneNumber(phoneNumber) {
  return phoneNumber?.startsWith('+1') && northAmericanPhoneRegex.test(phoneNumber) ? phoneNumber.replace(northAmericanPhoneRegex, '($1) $2-$3') : phoneNumber;
}
export function formatAddressSingleLine(address, rawInternationalizationData) {
  if (!address) {
    return '';
  }
  const [langCode, countryCode] = LOCALE.split('-');
  const country = rawInternationalizationData?.addressCountries?.find(addressCountry => addressCountry.isoCode === address.country)?.label || address.country;
  const singleLineAddress = formatAddressAllFields(langCode, countryCode, {
    address: address.street,
    city: address.city,
    state: address.region,
    country,
    zipCode: address.postalCode
  }, addressSingleLineBreak, true);
  const phoneNumber = getFormattedPhoneNumber(address.phoneNumber);
  return address?.phoneNumber ? `${singleLineAddress}${addressSingleLineBreak}${phoneNumber}` : singleLineAddress;
}