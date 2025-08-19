import { LightningElement, api, wire } from 'lwc';
import { AppContextAdapter } from 'commerce/contextApi';
import { generateStyleProperties } from 'experience/styling';
import { getOneTimeProductSellingModelPrice } from './productSellingModelService';
import { dxpSmallerTextSize, dxpTextSize } from './productPricingDetailsUtils';
export { getOneTimeProductSellingModelPrice };
export const STYLE_DEFAULTS = {
  slot1TextColor: 'var(--dxp-g-root-contrast)',
  slot2PriceTextColor: 'var(--dxp-g-root-contrast)'
};
export default class ProductPricingDetails extends LightningElement {
  static renderMode = 'light';
  _product;
  @api
  get product() {
    return this._product;
  }
  set product(val) {
    this._product = val;
    if (this._product?.productClass === 'Variation') {
      this.classList.add('with-min-height');
    }
  }
  @api
  productPricing;
  @api
  promotionalPricing;
  @api
  productTax;
  @api
  productVariant;
  @api
  selectedProductSellingModel;
  @api
  productSellingModelPriceType;
  get _oneTimeProductSellingModelPrice() {
    return this.productSellingModelPriceType === 'OneTimeSellingModelPrice' ? getOneTimeProductSellingModelPrice(this.product?.productSellingModels, this.productPricing?.productPriceEntries) : undefined;
  }
  @wire(AppContextAdapter)
  updateAppContext(entry) {
    if (entry.data) {
      this.taxLocaleType = entry.data.taxType;
    }
  }
  @api
  slot1PriceTextColor;
  @api
  slot1PriceLabel;
  @api
  slot2PriceTextColor;
  @api
  slot2PriceLabel;
  @api
  slot3PriceTextColor;
  @api
  slot3PriceTextSize;
  @api
  slot3PriceLabel;
  @api
  promotionalMessageTextColor;
  @api
  promotionalMessageTextSize;
  @api
  pricingType;
  @api
  unavailablePriceLabel;
  @api
  showTaxIndication;
  @api
  lastLowestPriceLabel;
  @api
  lastLowestPriceLabelSize;
  @api
  lastLowestPriceLabelColor;
  @api
  taxIncludedLabel;
  @api
  taxLabelSize;
  @api
  taxLabelColor;
  taxLocaleType;
  get taxRatePercentage() {
    const {
      taxPolicies = []
    } = this.productTax || {};
    const taxRate = taxPolicies[0]?.taxRatePercentage;
    return taxRate !== null && taxRate !== undefined ? Number(taxRate) : undefined;
  }
  productClass;
  get mainPriceLabel() {
    return this.slot1PriceLabel;
  }
  get strikethroughPriceLabel() {
    return this.slot2PriceLabel;
  }
  get finalPriceLabel() {
    return this.slot3PriceLabel;
  }
  get priceStyles() {
    return generateStyleProperties({
      '--com-c-product-pricing-details-tax-info-label-color': this.taxLabelColor || 'initial',
      '--com-c-product-pricing-details-tax-info-label-size': dxpTextSize(this.taxLabelSize),
      '--com-c-product-pricing-details-slot-3-price-label-color': this.slot3PriceTextColor || 'initial',
      '--com-c-product-pricing-details-slot-3-price-label-size': dxpTextSize(this.slot3PriceTextSize),
      '--com-c-product-pricing-details-slot-2-price-label-color': this.slot2PriceTextColor || 'initial',
      '--com-c-product-pricing-details-slot-2-price-label-size': dxpSmallerTextSize(this.slot3PriceTextSize),
      '--com-c-product-pricing-details-slot-1-price-label-color': this.slot1PriceTextColor || 'initial',
      '--com-c-product-pricing-details-slot-1-price-label-size': dxpSmallerTextSize(this.slot3PriceTextSize),
      '--com-c-product-pricing-details-promotional-message-color': this.promotionalMessageTextColor || 'initial',
      '--com-c-product-pricing-details-promotional-message-label-size': dxpTextSize(this.promotionalMessageTextSize),
      '--com-c-product-pricing-details-lowest-unit-price-label-color': this.lastLowestPriceLabelColor || 'initial',
      '--com-c-product-pricing-details-lowest-unit-price-label-size': dxpTextSize(this.lastLowestPriceLabelSize)
    });
  }
  get displayPricing() {
    return this.isProductDataAvailable && this.isProductPricingDataAvailable && this.product?.productClass !== 'VariationParent' && this.product?.productClass !== 'Set' && this.productVariant?.isValid !== false && (Boolean(this.productSellingModelPriceType) || !this.selectedProductSellingModel);
  }
  get isProductDataAvailable() {
    return this.product !== undefined && this.product !== null;
  }
  get isProductPricingDataAvailable() {
    return this.productPricing !== undefined && this.productPricing !== null;
  }
}