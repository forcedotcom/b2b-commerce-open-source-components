import locale from '@salesforce/i18n/locale';
export const regionLabelCountryCodes = ['JP', 'CN', 'TW', 'TH', 'VN', 'MY', 'KR'];
export const northAmericanPhoneRegex = /^(?:\+?1[-. ]?)?\(?([0-9]{3})\)?[-. ]?([0-9]{3})[-. ]?([0-9]{4})$/;
export function isLastNameFirstCountry(country) {
  const lastNameFirstCountries = ['CN', 'HU', 'JP', 'KR', 'MO', 'MY', 'SG', 'TW', 'VN'];
  return country ? lastNameFirstCountries.includes(country) : false;
}
export function splitFirstAndLast(fullName, country) {
  let firstName = '';
  let lastName = '';
  const isLastNameFirst = isLastNameFirstCountry(country);
  const names = fullName?.split(' ');
  if (names && names.length === 2) {
    if (isLastNameFirst) {
      firstName = names?.[1];
      lastName = names?.[0];
    } else {
      firstName = names?.[0];
      lastName = names?.[1];
    }
  }
  return {
    firstName,
    lastName
  };
}
export function splitName(fullName, country) {
  let firstName = '';
  let lastName = '';
  const isLastNameFirst = isLastNameFirstCountry(country);
  const names = fullName?.split(' ');
  if (names && names.length > 0) {
    if (isLastNameFirst) {
      firstName = names?.[names.length - 1];
      lastName = names?.[0];
    } else {
      firstName = names?.[0];
      lastName = names?.[names.length - 1];
    }
  }
  return {
    firstName,
    lastName
  };
}
export function buildFullName(name, firstName, lastName, country) {
  return name || (isLastNameFirstCountry(country) ? `${lastName ?? ''} ${firstName ?? ''}` : `${firstName ?? ''} ${lastName ?? ''}`).trim();
}
export function getCustomLocale(country) {
  const languageCode = locale.split('-')[0];
  return `${languageCode}-${country}`;
}
export function getFormattedPhoneNumber(phoneNumber) {
  return phoneNumber?.startsWith('+1') && northAmericanPhoneRegex.test(phoneNumber) ? phoneNumber.replace(northAmericanPhoneRegex, '($1) $2-$3') : phoneNumber;
}