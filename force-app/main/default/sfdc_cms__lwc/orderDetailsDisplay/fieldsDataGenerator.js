import getFieldLabel from './fieldLabelGenerator';
import getFieldTypeAndValue from './fieldTypeAndValueGenerator';
import getFieldNameFromRecord from './fieldNameGenerator';
export default function getFieldsData(data, fieldMapping) {
  return (fieldMapping || []).map(field => {
    const [fieldVal, fieldType] = getFieldTypeAndValue(data, field);
    return {
      name: field.name,
      label: getFieldLabel(field.label),
      value: fieldVal,
      type: fieldType,
      isReference: fieldType === 'reference' || fieldType === 'id',
      field: getFieldNameFromRecord(String(fieldVal))
    };
  }).filter(fieldData => Boolean(fieldData.value));
}