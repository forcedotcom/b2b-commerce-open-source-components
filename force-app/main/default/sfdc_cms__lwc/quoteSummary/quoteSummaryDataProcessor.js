import { LastModified, TotalPrice } from './labels';
export function getQuoteFields(entityFields, InputFields) {
  const quoteFieldMap = new Map(Object.entries(entityFields || {}));
  return InputFields.map(field => {
    const quoteField = {
      name: field.label,
      value: '',
      type: ''
    };
    quoteField.type = quoteFieldMap.get(field.name)?.type || '';
    quoteField.value = quoteFieldMap.get(field.name)?.text || '';
    return quoteField;
  }).filter(updatedQuoteField => updatedQuoteField.value);
}
export function getDefaultQuoteFields() {
  return [{
    entity: 'Quote',
    name: 'LastModifiedDate',
    label: LastModified,
    type: 'DateTime'
  }, {
    entity: 'Quote',
    name: 'TotalPrice',
    label: TotalPrice,
    type: 'Currency'
  }];
}