import { LightningElement, api, track } from 'lwc';
import basePath from '@salesforce/community/basePath';
import { getPaymentIconPath } from './cardIconUtility';
export default class OrderConfirmationFieldtable extends LightningElement {
  static renderMode = 'light';
  @api
  currencyCode;
  @api
  noOfColumns;
  @api
  set fields(value) {
    this._fields = value;
    this.arrangeFields(this.processPaymentMethodFields(this._fields), this.noOfColumns);
  }
  get fields() {
    return this._fields;
  }
  @track
  _columnsArr = [];
  @track
  _fields;
  processPaymentMethodFields(fields = []) {
    return fields.map(field => {
      if (field.isPaymentMethod) {
        const value = Object.assign({}, field.value);
        const iconPath = getPaymentIconPath(value, basePath);
        value.iconPath = iconPath;
        return {
          ...field,
          value
        };
      }
      return field;
    });
  }
  arrangeFields(fields, columns = 1) {
    const result = [];
    if (fields.length > 0) {
      const minFieldsPerColumn = Math.floor(fields.length / columns);
      const extraFields = fields.length % columns;
      let index = 0;
      for (let i = 0; i < columns; i++) {
        const columnSize = minFieldsPerColumn + (i < extraFields ? 1 : 0);
        result.push({
          index: i,
          fields: fields.slice(index, index + columnSize)
        });
        index += columnSize;
      }
    }
    this._columnsArr = result;
  }
}