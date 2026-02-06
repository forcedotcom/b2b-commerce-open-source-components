import { api, LightningElement } from 'lwc';
import { transformProductFields } from './transformers';

/**
 * @slot heading
 */
export default class ProductHeading extends LightningElement {
  static renderMode = 'light';
  @api
  identifierName;
  @api
  product;
  @api
  showAdditionalFields = false;
  @api
  productDetailSummaryFieldMapping;
  @api
  dynamicAttributesAvailableText;
  get currencyCode() {
    return this.product?.fields?.CurrencyIsoCode;
  }
  get productFieldsData() {
    return transformProductFields(this.productDetailSummaryFieldMapping, this.product?.fields, this.identifierName);
  }
  get dynamicAttributesAvailableTextFormmatted() {
    if (!this.dynamicAttributesAvailableText || !this.product?.dynamicAttributeCount) {
      return '';
    }
    return this.dynamicAttributesAvailableText.replace('{0}', this.product?.dynamicAttributeCount.toString());
  }
}