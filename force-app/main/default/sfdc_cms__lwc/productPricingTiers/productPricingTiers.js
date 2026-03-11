import { api, LightningElement } from 'lwc';
import { generateStyleProperties } from 'experience/styling';
/**
 * @slot title
 */
export default class ProductPricingTiers extends LightningElement {
  static renderMode = 'light';
  @api
  quantityRowLabel;
  @api
  discountRowLabel;
  @api
  borderRadius;
  @api
  backgroundColor;
  @api
  rowTitleTextColor;
  @api
  labelTextColor;
  @api
  textColor;
  @api
  borderColor;
  @api
  product;
  @api
  productVariant;
  @api
  productPricing;
  get isTierPricingDisabled() {
    return this.productVariant?.isValid === false || this.product?.productClass === 'VariationParent' || this.product?.productClass === 'Set' || !!this.product?.productSellingModels?.length;
  }
  get showTiers() {
    return this?.productPricing?.priceAdjustment?.priceAdjustmentTiers !== undefined && !this.isTierPricingDisabled;
  }
  get productPricingTiersCustomStyles() {
    return generateStyleProperties([{
      name: '--com-c-product-pricing-tiers-border-radius',
      value: this.borderRadius,
      suffix: 'px'
    }, {
      name: '--com-c-product-pricing-tiers-background-color',
      value: this.backgroundColor
    }, {
      name: '--com-c-product-pricing-tiers-row-title-text-color',
      value: this.rowTitleTextColor
    }, {
      name: '--com-c-product-pricing-tiers-label-text-color',
      value: this.labelTextColor
    }, {
      name: '--com-c-product-pricing-tiers-text-color',
      value: this.textColor
    }, {
      name: '--com-c-product-pricing-tiers-border-color',
      value: this.borderColor
    }]);
  }
  renderedCallback() {
    this.classList.toggle('slds-hide', !this.showTiers);
  }
}