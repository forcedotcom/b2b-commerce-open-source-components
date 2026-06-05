export const getNumberOfDaysToGivenDate = date => {
  return Math.floor((new Date(date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
};
export const formatDate = (locale, date) => {
  if (!date) {
    return undefined;
  }
  date = date?.split('T')[0];
  if (isNaN(new Date(date).getTime())) {
    return undefined;
  }
  return new Intl.DateTimeFormat(locale, {
    dateStyle: 'medium'
  }).format(new Date(date));
};