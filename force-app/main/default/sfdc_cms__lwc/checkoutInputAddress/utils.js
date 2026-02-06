export function transformCountryOptions(rawCountryData) {
  const filteredData = rawCountryData.filter(countriesData => countriesData.active && countriesData.visible);
  const transformedCountries = filteredData.map(countryData => {
    return {
      label: countryData.label,
      value: countryData.isoCode
    };
  });
  return transformedCountries;
}
export function transformStateOptions(countryCode, rawCountryData) {
  const rawStatesData = rawCountryData?.find(countryData => countryData.isoCode === countryCode)?.states || [];
  const filteredData = rawStatesData?.filter(statesData => statesData.active && statesData.visible);
  const transformedStates = filteredData?.map(statesData => {
    return {
      label: statesData.label,
      value: statesData.isoCode
    };
  });
  return transformedStates;
}
export function stateZipNameType(countryCode, rawCountryData) {
  const country = rawCountryData?.find(countryData => countryData.isoCode === countryCode);
  return {
    stateNameLabel: country?.stateNameType || '',
    zipNameLabel: country?.zipNameType || ''
  };
}