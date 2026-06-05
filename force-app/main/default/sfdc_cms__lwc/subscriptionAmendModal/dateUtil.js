export const formatDate = (locale, date) => {
  if (!date) {
    return undefined;
  }
  date = date.split('T')[0];
  return new Intl.DateTimeFormat(locale, {
    dateStyle: 'medium'
  }).format(new Date(date));
};