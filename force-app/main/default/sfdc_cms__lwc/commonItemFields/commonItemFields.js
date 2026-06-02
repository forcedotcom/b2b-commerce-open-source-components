import { LightningElement, api } from 'lwc';
import labels from './labels';
import { transformFields } from './transformField';
export default class CommonItemFields extends LightningElement {
  static renderMode = 'light';
  @api
  fields;
  @api
  currencyCode;
  @api
  adjustments;
  get _showFields() {
    return (this.fields || []).length > 0;
  }
  get _transformedFields() {
    return transformFields(this.fields, this.adjustments);
  }
  get _labels() {
    return labels;
  }
}