import { formatAddress } from './formatAddress';
export function getShippingFieldsForOrderDeliveryGroup(orderDeliveryGroup, shippingFieldMapping) {
  return shippingFieldMapping.reduce((result, field) => {
    if (field.entity === 'OrderDeliveryMethod' && orderDeliveryGroup.deliveryMethod.fields[field.name]) {
      result.push({
        ...orderDeliveryGroup.deliveryMethod.fields[field.name],
        label: field.label
      });
    } else if (field.entity === 'OrderDeliveryGroupSummary' && orderDeliveryGroup.fields[field.name]) {
      result.push({
        ...orderDeliveryGroup.fields[field.name],
        label: field.label
      });
    }
    return result;
  }, []);
}
export function processODGData(rawOrderDeliveryGroupApiData, shippingFieldMapping, countries) {
  let shipToName = rawOrderDeliveryGroupApiData.fields?.DeliverToFullName?.text || rawOrderDeliveryGroupApiData.fields?.DeliverToName?.text;
  shipToName = shipToName !== 'UNKNOWN' ? shipToName : '';
  const formattedShippingAddress = formatAddress(rawOrderDeliveryGroupApiData.fields?.DeliverToCity?.text || '', rawOrderDeliveryGroupApiData.fields?.DeliverToCountry?.text || '', rawOrderDeliveryGroupApiData.fields?.DeliverToPostalCode?.text || '', rawOrderDeliveryGroupApiData.fields?.DeliverToState?.text || '', rawOrderDeliveryGroupApiData.fields?.DeliverToStreet?.text || '', countries);
  const shipToCity = formattedShippingAddress.city;
  const shipToAddress = formattedShippingAddress.address;
  const shippingAddress = shipToName && shipToAddress ? `${shipToName}, ${shipToAddress}` : `${shipToName}${shipToAddress}`;
  return {
    groupTitle: shippingAddress,
    shipToCity: shipToCity,
    shippingAddress,
    shippingFields: getShippingFieldsForOrderDeliveryGroup(rawOrderDeliveryGroupApiData, shippingFieldMapping),
    orderDeliveryGroupSummaryId: rawOrderDeliveryGroupApiData.id,
    orderItemsHasNextPage: false,
    lineItems: rawOrderDeliveryGroupApiData.lineItems,
    currencyCode: rawOrderDeliveryGroupApiData.currencyIsoCode,
    giftMessage: rawOrderDeliveryGroupApiData.fields?.GiftMessage?.text ?? '',
    isGift: rawOrderDeliveryGroupApiData.fields?.IsGift?.text === 'true'
  };
}