import LOCALE from '@salesforce/i18n/locale';
const _formatterCache = new Map();
export default function format(currency, value, currencyDisplay = 'symbol') {
  const key = `${currency}-${currencyDisplay}`;
  let formatter = _formatterCache.get(key);
  if (!formatter) {
    formatter = new Intl.NumberFormat(LOCALE, {
      style: 'currency',
      currency,
      currencyDisplay,
      maximumFractionDigits: 20
    });
    _formatterCache.set(key, formatter);
  }
  return formatter.format(value);
}