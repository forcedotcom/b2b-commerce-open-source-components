import { getFieldValue } from 'lightning/uiRecordApi';
export function getValueOfNameFieldForEntity(field, recordId, record) {
  if (record && record.data && field) {
    const value = getFieldValue(record.data, field);
    if (value.toString().length > 0) {
      return value;
    }
  }
  return recordId;
}