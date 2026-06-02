import { BILLING_ADDRESS, getAddressValues, LOCATION, getCoordinate, getCoordinateValues, GEO_LOCATION } from './constants';
export function getOrderFields(entityFields, InputFields) {
  const orderFieldMap = new Map(Object.entries(entityFields || {}));
  return InputFields.map(field => {
    const orderField = {
      name: field.label,
      value: '',
      type: ''
    };
    if (field.name === BILLING_ADDRESS) {
      orderField.type = 'Address';
      orderField.value = getAddressValues(orderFieldMap);
    } else {
      orderField.type = orderFieldMap.get(field.name)?.type || '';
      orderField.value = orderFieldMap.get(field.name)?.text || '';
      if (orderField.type === LOCATION) {
        const coordinate = getCoordinate(orderField.value);
        if (coordinate.length === 2) {
          orderField.value = getCoordinateValues(coordinate);
          orderField.type = GEO_LOCATION;
        }
      }
    }
    return orderField;
  }).filter(updatedOrderField => updatedOrderField.value);
}