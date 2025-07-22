export function sortLocales(locales, sort, language) {
  const primarySortField = sort === 'language' ? 'languageLabel' : 'countryLabel';
  const secondarySortField = sort === 'language' ? 'countryLabel' : 'languageLabel';
  const collator = new Intl.Collator(language);
  return [...locales].sort((a, b) => {
    if (!a[primarySortField]) {
      if (!b[primarySortField]) {
        return collator.compare(a[secondarySortField], b[secondarySortField]);
      }
      return 1;
    }
    if (!b[primarySortField]) {
      return -1;
    }
    const comparePrimaryFields = collator.compare(a[primarySortField], b[primarySortField]);
    if (comparePrimaryFields) {
      return comparePrimaryFields;
    }
    return collator.compare(a[secondarySortField], b[secondarySortField]);
  });
}