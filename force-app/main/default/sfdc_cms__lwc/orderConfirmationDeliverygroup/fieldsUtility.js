import LOCALE from '@salesforce/i18n/locale';
import timeZone from '@salesforce/i18n/timeZone';
import { Hours, Days, Weeks } from './labels';
const LABELS = {
  Hours,
  Days,
  Weeks
};
const transformToFieldData = (name, label, type, value, isAddress) => {
  return {
    isAddress,
    label,
    name,
    type,
    value
  };
};
export function formatDateRange(startDate, endDate) {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const shortMonthOptions = {
    month: 'short',
    timeZone
  };
  const dateOptions = {
    day: 'numeric',
    timeZone
  };
  const monthFormatter = new Intl.DateTimeFormat(LOCALE, shortMonthOptions);
  const dayFormatter = new Intl.DateTimeFormat(LOCALE, dateOptions);
  function formatMonthBeforeDay(date) {
    const month = monthFormatter.format(date);
    const day = dayFormatter.format(date);
    return `${month} ${day}`;
  }
  if (start.getMonth() === end.getMonth()) {
    if (start.getDate() === end.getDate()) {
      return formatMonthBeforeDay(start);
    }
    return `${formatMonthBeforeDay(start)}-${end.toLocaleDateString(LOCALE, dateOptions)}`;
  }
  return `${formatMonthBeforeDay(start)}-${formatMonthBeforeDay(end)}`;
}
export const getDeliveryGroupFields = (deliveryGroup, fieldLabels) => {
  const fields = [];
  const {
    DeliverToCompanyName,
    DeliverToName,
    DeliverToFullName,
    DeliverToCity,
    DeliverToCountry,
    DeliverToStreet,
    DeliverToState,
    DeliverToPostalCode,
    PhoneNumber,
    DesiredDeliveryDate
  } = deliveryGroup?.fields ?? {};
  const {
    Name,
    ClassOfService,
    AdjustedShippingFee,
    TransitTimeMin,
    TransitTimeMax,
    TransitTimeUnit,
    EarliestEstimatedDeliveryDate,
    LatestEstimatedDeliveryDate
  } = deliveryGroup?.deliveryMethod?.fields ?? {};
  if (DeliverToCompanyName) {
    fields.push(transformToFieldData('DeliverToCompanyName', fieldLabels.companyNameLabel, 'TEXT', DeliverToCompanyName.text, false));
  }
  const shippingAddress = {
    ...(DeliverToFullName?.text || DeliverToName?.text ? {
      name: DeliverToFullName?.text || DeliverToName?.text
    } : {}),
    ...(DeliverToStreet?.text ? {
      street: DeliverToStreet?.text
    } : {}),
    ...(DeliverToCity?.text ? {
      city: DeliverToCity?.text
    } : {}),
    ...(DeliverToState?.text ? {
      state: DeliverToState?.text
    } : {}),
    ...(DeliverToCountry?.text ? {
      country: DeliverToCountry?.text
    } : {}),
    ...(DeliverToPostalCode?.text ? {
      postalcode: DeliverToPostalCode?.text
    } : {})
  };
  if (Object.keys(shippingAddress).length) {
    fields.push(transformToFieldData('DeliverToAddress', fieldLabels.shippingAddressLabel, 'ADDRESS', shippingAddress, true));
  }
  if (PhoneNumber) {
    fields.push(transformToFieldData('PhoneNumber', fieldLabels.phoneNumberLabel, 'PHONE', PhoneNumber.text, false));
  }
  if (ClassOfService || Name) {
    let value = Name.text;
    if (ClassOfService) {
      value = ClassOfService.text;
      if (TransitTimeMin?.text && TransitTimeMax?.text && TransitTimeUnit?.text) {
        const transitTimeLabel = LABELS[TransitTimeUnit.text] || TransitTimeUnit.text;
        value += ` (${TransitTimeMin.text} - ${TransitTimeMax.text} ${transitTimeLabel})`;
      }
    }
    fields.push(transformToFieldData('ShippingMethod', fieldLabels.shippingMethodLabel, 'TEXT', value, false));
  }
  if (AdjustedShippingFee) {
    let type = 'CURRENCY';
    if (Number.isNaN(Number(AdjustedShippingFee.text))) {
      type = 'TEXT';
    }
    fields.push(transformToFieldData('AdjustedShippingFee', fieldLabels.shippingChargesLabel, type, AdjustedShippingFee.text, false));
  }
  let type = 'DATE';
  let formattedDateRange = DesiredDeliveryDate?.text;
  if (EarliestEstimatedDeliveryDate?.text && LatestEstimatedDeliveryDate?.text) {
    formattedDateRange = formatDateRange(EarliestEstimatedDeliveryDate.text, LatestEstimatedDeliveryDate.text);
    type = 'TEXT';
  }
  if (formattedDateRange) {
    fields.push(transformToFieldData('ArrivingDate', fieldLabels.deliveryTimelineLabel, type, formattedDateRange, false));
  }
  return fields;
};
export const getSubscriptionDeliveryGroupFields = (deliveryGroup, ownerInfo, fieldLabels) => {
  const fields = [];
  const {
    PhoneNumber
  } = deliveryGroup?.fields ?? {};
  if (ownerInfo?.email) {
    fields.push(transformToFieldData('email', fieldLabels.emailAddressLabel, 'TEXT', ownerInfo?.email, false));
  }
  if (PhoneNumber) {
    fields.push(transformToFieldData('PhoneNumber', fieldLabels.phoneNumberLabel, 'PHONE', PhoneNumber.text, false));
  }
  return fields;
};
export const getGiftingFields = (deliveryGroup, fieldLabels) => {
  const fields = [];
  const {
    IsGift,
    GiftMessage
  } = deliveryGroup?.fields ?? {};
  if (IsGift && IsGift.text === 'true' && fieldLabels.giftOrderLabel) {
    fields.push(transformToFieldData('IsGift', fieldLabels.giftOrderLabel, 'TEXT', '', false));
  }
  if (GiftMessage) {
    fields.push(transformToFieldData('GiftMessage', fieldLabels.giftMessageLabel, 'TEXT', GiftMessage.text, false));
  }
  return fields;
};