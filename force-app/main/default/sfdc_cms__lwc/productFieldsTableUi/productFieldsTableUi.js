import { api } from 'lwc';
import { LightningElement } from 'lwc';
export default class ProductFieldsTableUi extends LightningElement {
  static renderMode = 'light';
  @api
  fields;
  @api
  currencyCode;
  get normalizedField() {
    const fields = this.fields ?? [];
    return fields.map((field, index) => ({
      ...field,
      key: `${field.name}-${index}`
    }));
  }
}