import { LightningElement, api } from 'lwc';
import { transformTierAdjustmentContents } from './utils';
export default class ProductPricingTiersUi extends LightningElement {
  static renderMode = 'light';
  @api
  quantityRowLabel;
  @api
  discountRowLabel;
  @api
  productPricing;
  get normalizedAdjustmentTiers() {
    return transformTierAdjustmentContents(this.productPricing);
  }
  get currencyCode() {
    return this.productPricing?.currencyIsoCode ?? null;
  }
}