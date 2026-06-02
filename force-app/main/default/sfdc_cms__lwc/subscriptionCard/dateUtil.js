export const getNumberOfDaysToGivenDate = date => {
  return Math.floor((new Date(date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
};
export const formatDate = (locale, timeZone, date) => {
  if (!date) {
    return undefined;
  }
  return new Intl.DateTimeFormat(locale, {
    dateStyle: 'medium',
    timeZone
  }).format(new Date(date));
};