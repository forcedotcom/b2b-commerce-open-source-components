import { LightningElement, api } from 'lwc';
import labels from './labels';
import getFieldsData from './fieldsDataGenerator';
export default class OrderDetailsDisplay extends LightningElement {
  static renderMode = 'light';
  @api
  fieldMapping;
  @api
  titleText;
  @api
  detailsData;
  get hasTitleText() {
    return (this.titleText || '').length > 0;
  }
  get _currencyCode() {
    return this.detailsData?.currencyIsoCode;
  }
  get _fieldsData() {
    if (this.detailsData) {
      return getFieldsData(this.detailsData, this.fieldMapping);
    }
    return undefined;
  }
  get _labels() {
    return labels;
  }
}