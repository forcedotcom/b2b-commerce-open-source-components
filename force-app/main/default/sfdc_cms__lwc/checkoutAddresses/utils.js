const data = {
  US: {
    fmt: '%A%n%C, %S %Z%n%K'
  },
  GB: {
    fmt: '%A%n%C%n%S%n%Z%n%K'
  },
  CA: {
    fmt: '%A%n%C %S %Z%n%K'
  },
  AU: {
    fmt: '%A%n%C %S %Z%n%K'
  },
  DE: {
    fmt: '%A%n%Z %C%n%K'
  },
  FR: {
    fmt: '%A%n%Z %C%n%K'
  },
  ES: {
    fmt: '%A%n%Z %C%n%S%n%K'
  },
  IT: {
    fmt: '%A%n%Z %C %S%n%K'
  },
  JP: {
    fmt: '%K%n%Z%n%S %C%n%A'
  },
  CN: {
    fmt: '%K%S%C%n%A%n%Z'
  },
  KR: {
    fmt: '%K %S %C%n%A%n%Z'
  },
  JM: {
    fmt: '%A%n%C%n%K'
  },
  IE: {
    fmt: '%A%n%Z%n%K'
  }
};
const CJK_LANGUAGES = ['zh', 'ja', 'ko'];
const CJK_COUNTRIES = ['CN', 'JP', 'KR', 'TW', 'HK', 'MO'];
const languageCodeToCountry = {
  languageCode: {
    en: 'US',
    de: 'DE',
    fr: 'FR',
    es: 'ES',
    it: 'IT',
    ja: 'JP',
    zh: 'CN',
    ko: 'KR'
  }
};
const addressFormatter = {
  format(values, pattern, lineBreak, ignoreEmptyLines) {
    let result = pattern;
    result = result.replace(/%A/g, values.address || '');
    result = result.replace(/%C/g, values.city || '');
    result = result.replace(/%S/g, values.state || '');
    result = result.replace(/%Z/g, values.zipCode || '');
    result = result.replace(/%K/g, values.country || '');
    result = result.replace(/%n/g, lineBreak);
    if (ignoreEmptyLines) {
      const lines = result.split(lineBreak).map(line => line.trim()).filter(line => line.length > 0).map(line => line.replace(/,\s*$/, '')).map(line => line.replace(/^\s*,\s*/, '')).filter(line => line.length > 0);
      return lines.join(lineBreak);
    }
    return result;
  }
};
function containsHanScript(...texts) {
  const hanRegex = /[\u4e00-\u9fff\u3400-\u4dbf\uf900-\ufaff]/;
  return texts.some(text => text && hanRegex.test(text));
}
function followReferences(_data, country) {
  return country;
}
function getCountryFromLocale(langCode, countryCode, values) {
  if (values) {
    const isCJK = !countryCode && CJK_LANGUAGES.includes(langCode.toLowerCase()) || countryCode && CJK_COUNTRIES.includes(countryCode.toUpperCase());
    const isJA = !countryCode && 'ja' === langCode.toLowerCase() || countryCode && 'JP' === countryCode.toUpperCase();
    if (!(isJA && containsHanScript(values.address, values.city, values.state, values.country)) && isCJK && !containsHanScript(values.address)) {
      return getCountryFromLocale(langCode, 'EN_' + countryCode);
    }
  }
  let country = countryCode;
  if (langCode === 'uz' && country && country.toLowerCase() === 'latn') {
    country = 'UZ';
  }
  if (!country && languageCodeToCountry.languageCode[langCode]) {
    country = languageCodeToCountry.languageCode[langCode];
  }
  country = followReferences(data, country);
  if (!country || !data[country]) {
    return 'US';
  }
  return country;
}
function buildAddressLines(pattern, values, lineBreak, ignoreEmptyLines) {
  return addressFormatter.format(values, pattern, lineBreak, ignoreEmptyLines);
}
export function formatAddressAllFields(langCode, countryCode, values, lineBreak, ignoreEmptyLines) {
  const code = getCountryFromLocale(langCode, countryCode, values);
  let pattern = data[code].fmt;
  if (values.zipCode && pattern.indexOf('%Z') === -1) {
    pattern = pattern.replace('%K', '%Z %K');
  }
  if (values.city && pattern.indexOf('%C') === -1) {
    pattern = pattern.replace('%K', '%C %K');
  }
  if (values.state && pattern.indexOf('%S') === -1) {
    pattern = pattern.replace('%K', '%S %K');
  }
  return buildAddressLines(pattern, values, lineBreak, ignoreEmptyLines);
}
export function getCountryFromLocale_export(langCode, countryCode, values) {
  return getCountryFromLocale(langCode, countryCode, values);
}
export const addressFormat = {
  formatAddressAllFields,
  getCountryFromLocale: getCountryFromLocale_export
};