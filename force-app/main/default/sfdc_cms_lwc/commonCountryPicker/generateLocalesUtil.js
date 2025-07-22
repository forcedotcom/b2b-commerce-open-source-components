import { languageCodeToCountry } from './fallbackCountries';
export function getCountryLabel(countryCode, addressCountryData, languageCode) {
  const backupCountryCode = !countryCode && languageCode ? languageCodeToCountry.languageCode[languageCode] : null;
  const addressCountryDataRecord = addressCountryData?.find(record => record.isoCode === (countryCode || backupCountryCode));
  return addressCountryDataRecord?.label ?? countryCode;
}
export function getLanguageLabel(language, languageDisplayType = 'short', languageLabelMap, country) {
  const languageCode = language.split('_')[0];
  if (languageDisplayType === 'short') {
    return languageCode.toUpperCase();
  }
  const langAndCountry = `${languageCode}_${country}`;
  if (languageLabelMap?.[languageCode]) {
    return languageLabelMap?.[languageCode];
  } else if (country && languageLabelMap?.[langAndCountry]) {
    return languageLabelMap?.[langAndCountry];
  }
  return languageCode.toUpperCase();
}
export function generateLocales(markets, languageLabelMap, languageDisplayType = 'short', addressCountryData) {
  const localeData = [];
  markets.forEach(market => {
    const localeKeys = Object.keys(market.localeCurrencyMap);
    localeKeys.forEach(localeKey => {
      const currencyCode = market.localeCurrencyMap[localeKey];
      const [languageCode, countryCode] = localeKey.split('_');
      localeData.push({
        countryLabel: getCountryLabel(countryCode, addressCountryData, languageCode) ?? '',
        countryCode: countryCode ?? languageCodeToCountry.languageCode[languageCode],
        locale: localeKey.replace('_', '-'),
        languageLabel: getLanguageLabel(localeKey, languageDisplayType, languageLabelMap),
        currencyCode
      });
    });
  });
  return localeData;
}