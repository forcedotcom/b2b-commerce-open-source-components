import locale from '@salesforce/i18n/locale';
import timeZone from '@salesforce/i18n/timeZone';
function getLocalTime(date) {
  return date.toLocaleTimeString(locale, {
    hour: 'numeric',
    hourCycle: 'h12',
    timeZone
  });
}
function formatDateMMDD(date) {
  return date.toLocaleString(locale, {
    month: 'short',
    day: 'numeric'
  });
}
function formatDateMMDDYY(date) {
  return date.toLocaleString(locale, {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
}
function formatNextDay(labels, date) {
  return `${labels.nextDayDeliveryEstimateText.replace('{0}', formatDateMMDD(date))}`;
}
function formatSameDay(labels, earliest, latest) {
  return latest ? `${labels.sameDayDeliveryEstimateText.replace('{0}', getLocalTime(earliest)).replace('{1}', getLocalTime(latest))}` : `${labels.exactDayDeliveryEstimateText.replace('{0}', getLocalTime(earliest))}`;
}
function formatMonthOrYear(labels, earliest, latest) {
  const currentYear = new Date().getFullYear();
  if (latest) {
    if (earliest.getMonth() === latest.getMonth()) {
      if (earliest.getDate() === latest.getDate()) {
        return currentYear === earliest.getFullYear() && currentYear === latest.getFullYear() ? `${labels.deliveryEstimateText.replace('{0}', formatDateMMDD(earliest))}` : `${labels.deliveryEstimateText.replace('{0}', formatDateMMDDYY(earliest))}`;
      }
      return currentYear === earliest.getFullYear() && currentYear === latest.getFullYear() ? `${labels.dateRangeDeliveryEstimateText.replace('{0}', formatDateMMDD(earliest)).replace('{1}', formatDateMMDD(latest))}` : `${labels.dateRangeDeliveryEstimateText.replace('{0}', formatDateMMDD(earliest)).replace('{1}', `${latest.toLocaleString(locale, {
        day: 'numeric'
      })}, ${latest.toLocaleString(locale, {
        year: 'numeric'
      })}`)}`;
    }
    return currentYear === earliest.getFullYear() && currentYear === latest.getFullYear() ? `${labels.dateRangeDeliveryEstimateText.replace('{0}', formatDateMMDD(earliest)).replace('{1}', formatDateMMDD(latest))}` : `${labels.dateRangeDeliveryEstimateText.replace('{0}', formatDateMMDDYY(earliest)).replace('{1}', formatDateMMDDYY(latest))}`;
  }
  return earliest.getFullYear() === currentYear ? `${labels.deliveryEstimateText.replace('{0}', formatDateMMDD(earliest))}` : `${labels.deliveryEstimateText.replace('{0}', formatDateMMDDYY(earliest))}`;
}
export function getFormattedDeliveryEstimate(deliveryMethod, labels) {
  const earliestEstimatedDateTime = deliveryMethod.earliestEstimatedDeliveryTime ? new Date(deliveryMethod.earliestEstimatedDeliveryTime) : undefined;
  const latestEstimatedDateTime = deliveryMethod.latestEstimatedDeliveryTime ? new Date(deliveryMethod.latestEstimatedDeliveryTime) : undefined;
  const currentDate = new Date();
  const nextDayDateTime = new Date(currentDate);
  nextDayDateTime.setDate(nextDayDateTime.getDate() + 1);
  const currentNumericDate = currentDate.toLocaleDateString();
  const nextDayNumericDate = nextDayDateTime.toLocaleDateString();
  const earliestNumericDate = earliestEstimatedDateTime?.toLocaleDateString();
  const latestNumericDate = latestEstimatedDateTime?.toLocaleDateString();
  if (earliestEstimatedDateTime && latestEstimatedDateTime) {
    const isCurrentDayDelivery = earliestNumericDate === currentNumericDate && latestNumericDate === currentNumericDate;
    const isNextDayDelivery = nextDayNumericDate === earliestNumericDate && nextDayNumericDate === latestNumericDate;
    if (isCurrentDayDelivery) {
      return formatSameDay(labels, earliestEstimatedDateTime, latestEstimatedDateTime);
    }
    if (isNextDayDelivery) {
      return formatNextDay(labels, earliestEstimatedDateTime);
    }
    return formatMonthOrYear(labels, earliestEstimatedDateTime, latestEstimatedDateTime);
  } else if (earliestEstimatedDateTime && !latestEstimatedDateTime) {
    if (earliestNumericDate === currentNumericDate) {
      return formatSameDay(labels, earliestEstimatedDateTime);
    } else if (earliestNumericDate === nextDayNumericDate) {
      return formatNextDay(labels, earliestEstimatedDateTime);
    }
    return formatMonthOrYear(labels, earliestEstimatedDateTime);
  } else if (!earliestEstimatedDateTime && latestEstimatedDateTime) {
    if (latestNumericDate === currentNumericDate) {
      return formatSameDay(labels, latestEstimatedDateTime);
    } else if (latestNumericDate === nextDayNumericDate) {
      return formatNextDay(labels, latestEstimatedDateTime);
    }
    return formatMonthOrYear(labels, latestEstimatedDateTime);
  }
  return undefined;
}
export function getSummarizedDeliveryDatesRange(deliveryGroups, labels) {
  let estimatedDeliveryDate = '';
  if (deliveryGroups) {
    const deliveryMethod = deliveryGroups.reduce((acc, group) => {
      const method = group?.selectedDeliveryMethod;
      if (!Object.keys(acc).length) {
        acc = Object.assign({}, method);
      } else {
        const earliestEstimatedDateTime = method?.earliestEstimatedDeliveryTime ? new Date(method.earliestEstimatedDeliveryTime) : undefined;
        const accEarliestEstimatedDateTime = acc.earliestEstimatedDeliveryTime ? new Date(acc.earliestEstimatedDeliveryTime) : new Date();
        const latestEstimatedDateTime = method?.latestEstimatedDeliveryTime ? new Date(method.latestEstimatedDeliveryTime) : undefined;
        const accLatestEstimatedDateTime = acc.latestEstimatedDeliveryTime ? new Date(acc.latestEstimatedDeliveryTime) : new Date();
        if (earliestEstimatedDateTime && accEarliestEstimatedDateTime && accEarliestEstimatedDateTime > earliestEstimatedDateTime) {
          acc.earliestEstimatedDeliveryTime = method?.earliestEstimatedDeliveryTime;
        }
        if (latestEstimatedDateTime && accLatestEstimatedDateTime && latestEstimatedDateTime > accLatestEstimatedDateTime) {
          acc.latestEstimatedDeliveryTime = method?.latestEstimatedDeliveryTime;
        }
      }
      return acc;
    }, {});
    estimatedDeliveryDate = getFormattedDeliveryEstimate(deliveryMethod, labels) || '';
  }
  return estimatedDeliveryDate;
}