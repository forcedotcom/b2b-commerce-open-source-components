import { LightningElement, api } from 'lwc';
import { Labels } from './labels';
import displayOriginalPriceEvaluator from './productPricingUiUtils';
export default class ProductPricingUi extends LightningElement {
  static renderMode = 'light';
  @api
  layout;
  @api
  negotiatedPriceLabel;
  @api
  originalPriceLabel;
  @api
  unavailablePriceLabel;
  @api
  negotiatedPrice;
  @api
  originalPrice;
  @api
  currencyCode;
  @api
  showNegotiatedPrice = false;
  @api
  showOriginalPrice = false;
  @api
  showTaxIndication = false;
  @api
  taxIncludedLabel;
  @api
  taxLocaleType;
  @api
  taxRate;
  get strikethroughAssistiveText() {
    return Labels.strikethroughAssistiveText;
  }
  get taxInfoVisible() {
    return this.showTaxIndication && this.isPriceAvailable && (this.taxLocaleType === 'Gross' || this.taxLocaleType === 'Automatic') && this.taxRate !== 0;
  }
  get displayOriginalPrice() {
    return displayOriginalPriceEvaluator(this.showNegotiatedPrice, this.showOriginalPrice, this.negotiatedPrice, this.originalPrice);
  }
  get displayNegotiatedPrice() {
    return this.showNegotiatedPrice && !!this.negotiatedPrice;
  }
  get displayAssistiveText() {
    return this.displayNegotiatedPrice && this.displayOriginalPrice;
  }
  get isPriceAvailable() {
    return this.showNegotiatedPrice && !!this.negotiatedPrice;
  }
  get hasNegotiatedPriceLabel() {
    return !!this.negotiatedPriceLabel;
  }
  get hasOriginalPriceLabel() {
    return !!this.originalPriceLabel;
  }
  get layoutClass() {
    return `slds-grid price-container ${this.layout === 'horizontal' ? 'price-container-horizontal' : 'slds-grid_vertical-reverse slds-grid_vertical'}`;
  }
}