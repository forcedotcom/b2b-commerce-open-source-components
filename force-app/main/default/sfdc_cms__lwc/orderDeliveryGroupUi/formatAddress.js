import LOCALE from '@salesforce/i18n/locale';
import { addressFormat } from './utils';
export const stateNameRequiredForCountries = ['JP', 'CN', 'MY', 'KR', 'TW', 'TH', 'VN'];
export function formatAddress(city, country, zipCode, state, address, countries) {
  let stateLabel;
  let countryLabel;
  if (country && stateNameRequiredForCountries.includes(country)) {
    const countryObj = countries.find(c => c.isoCode === country);
    countryLabel = countryObj?.label;
    if (countryObj?.states) {
      stateLabel = countryObj?.states.find(s => s.isoCode === state)?.label;
    }
  }
  const [langCode, countryCode] = LOCALE.split('-');
  const formattedAddress = addressFormat.formatAddressAllFields(langCode, countryCode, {
    address,
    city,
    state: stateLabel ?? state,
    country: countryLabel ?? country,
    zipCode
  }, ', ', true);
  return {
    address: formattedAddress,
    city
  };
}