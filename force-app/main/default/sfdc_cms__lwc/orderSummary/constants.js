import { Name, OrderedDate, Status, GrandTotalAmount } from './labels';
export const BILLING_ADDRESS = 'BillingAddress';
export const LOCATION = 'location';
export const GEO_LOCATION = 'Geolocation';
export const ADDRESS_INNER_FIELDS = ['BillingCity', 'BillingCountry', 'BillingState', 'BillingPostalCode', 'BillingStreet', 'BillingLatitude', 'BillingLongitude'];
export function getDefaultOrderFields() {
  return [{
    entity: 'OrderSummary',
    name: 'OrderNumber',
    label: Name,
    type: 'Text(255)'
  }, {
    entity: 'OrderSummary',
    name: 'OrderedDate',
    label: OrderedDate,
    type: 'Date/Time'
  }, {
    entity: 'OrderSummary',
    name: 'Status',
    label: Status,
    type: 'Text(255)'
  }, {
    entity: 'OrderSummary',
    name: 'GrandTotalAmount',
    label: GrandTotalAmount,
    type: 'Currency'
  }];
}
export function getAddressValues(orderFieldMap) {
  return {
    city: orderFieldMap.get(ADDRESS_INNER_FIELDS[0])?.text || '',
    country: orderFieldMap.get(ADDRESS_INNER_FIELDS[1])?.text || '',
    state: orderFieldMap.get(ADDRESS_INNER_FIELDS[2])?.text || '',
    postalcode: orderFieldMap.get(ADDRESS_INNER_FIELDS[3])?.text || '',
    street: orderFieldMap.get(ADDRESS_INNER_FIELDS[4])?.text || '',
    latitude: orderFieldMap.get(ADDRESS_INNER_FIELDS[5])?.text || '',
    longitude: orderFieldMap.get(ADDRESS_INNER_FIELDS[6])?.text || ''
  };
}
export function getCoordinate(orderFieldValue) {
  return orderFieldValue.slice(orderFieldValue.indexOf('[') + 1, orderFieldValue.indexOf(']')).split(' ');
}
export function getCoordinateValues(coordinates) {
  return {
    latitude: coordinates[0],
    longitude: coordinates[1]
  };
}