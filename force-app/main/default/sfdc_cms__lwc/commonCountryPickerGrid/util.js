const LABEL_TEMPLATE = '{0} | {1}';
const LABEL_NO_COUNTRY_TEMPLATE = '{1}';
export function getFlagEmoji(countryCode) {
  if (!countryCode) {
    return null;
  }
  const codePoints = countryCode?.toUpperCase()?.split('')?.map(char => 127397 + char.charCodeAt(0));
  return String.fromCodePoint(...codePoints);
}
export function getLocaleLabel(languageLabel, countryLabel) {
  const template = countryLabel ? LABEL_TEMPLATE : LABEL_NO_COUNTRY_TEMPLATE;
  return template.replace('{0}', countryLabel ?? '').replace('{1}', languageLabel);
}