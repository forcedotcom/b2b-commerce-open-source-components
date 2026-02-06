import { LightningElement, api } from 'lwc';
import { Labels } from './labels';
export default class ProductHeadingUi extends LightningElement {
  static renderMode = 'light';
  @api
  currencyCode;
  @api
  showAdditionalFields = false;
  @api
  dynamicAttributesAvailableText;
  @api
  fields;
  get _displayableFields() {
    return (this.fields || []).map((field, index) => ({
      ...field,
      id: index
    }));
  }
  get keyValueSeparator() {
    return Labels.keyValueSeparator;
  }
  get hideDynamicAttributesAvailableText() {
    return !this.dynamicAttributesAvailableText;
  }
}