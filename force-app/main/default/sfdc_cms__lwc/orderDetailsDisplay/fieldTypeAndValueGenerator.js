import fieldValueProcessor from './fieldValueProcessor';
export default function getFieldTypeAndValue(detailsData, inputField) {
  if (inputField.entity === 'OrderSummary') {
    const fieldObj = detailsData?.fields[inputField.name];
    if (fieldObj && fieldObj.type && fieldObj.text) {
      const type = fieldObj.type === 'location' ? 'geolocation' : fieldObj.type;
      return [fieldValueProcessor(fieldObj, type), type];
    }
  }
  return ['', ''];
}