import { api, LightningElement } from 'lwc';
import { transformProductData } from './productFieldsTableUtils';
export default class ProductFieldsTable extends LightningElement {
  static renderMode = 'light';
  @api
  product;
  @api
  productDetailDataContentMapping;
  get currencyCode() {
    return this.product?.fields?.CurrencyIsoCode;
  }
  get fields() {
    return transformProductData(this.productDetailDataContentMapping, this.product);
  }
}