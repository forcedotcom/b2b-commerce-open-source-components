import { api, LightningElement, wire } from 'lwc';
import { generateStyleProperties, generateThemeTextSizeProperty } from 'experience/styling';
import { AppContextAdapter } from 'commerce/contextApi';
function dxpTextSize(textSize) {
  const themeSize = generateThemeTextSizeProperty(`heading-${textSize}`);
  return themeSize ? `var(${themeSize}-font-size)` : 'initial';
}
export default class ProductPricing extends LightningElement {
  static renderMode = 'light';
  @api
  product;
  @api
  productPricing;
  @api
  productTax;
  @api
  productVariant;
  @wire(AppContextAdapter)
  updateAppContext(entry) {
    if (entry.data) {
      this.taxLocaleType = entry.data.taxType;
    }
  }
  @api
  showNegotiatedPrice;
  @api
  negotiatedPriceTextColor;
  @api
  negotiatedPriceTextSize;
  @api
  negotiatedPriceLabel;
  @api
  originalPriceTextColor;
  @api
  originalPriceTextSize;
  @api
  originalPriceLabel;
  @api
  unavailablePriceLabel;
  @api
  showOriginalPrice;
  @api
  showTaxIndication;
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
  get currencyCode() {
    return this.productPricing?.currencyIsoCode || undefined;
  }
  get negotiatedPrice() {
    return this.productPricing?.negotiatedPrice || undefined;
  }
  productClass;
  get originalPrice() {
    return this.productPricing?.listPrice || undefined;
  }
  get priceStyles() {
    return generateStyleProperties({
      '--com-c-product-pricing-tax-info-label-color': this.taxLabelColor || 'initial',
      '--com-c-product-pricing-tax-info-label-size': dxpTextSize(this.taxLabelSize),
      '--com-c-product-pricing-original-price-label-color': this.originalPriceTextColor || 'initial',
      '--com-c-product-pricing-original-price-label-size': dxpTextSize(this.originalPriceTextSize),
      '--com-c-product-pricing-negotiated-price-label-color': this.negotiatedPriceTextColor || 'initial',
      '--com-c-product-pricing-negotiated-price-label-size': dxpTextSize(this.negotiatedPriceTextSize)
    });
  }
  get displayPricing() {
    return this.productVariant?.isValid !== false && this.product?.productClass !== 'VariationParent' && this.product?.productClass !== 'Set' && this.isProductDataAvailable && this.isProductPricingDataAvailable && !this.product?.productSellingModels?.length;
  }
  get isProductDataAvailable() {
    return this.product !== undefined && this.product !== null;
  }
  get isProductPricingDataAvailable() {
    return this.productPricing !== undefined && this.productPricing !== null;
  }
  renderedCallback() {
    this.classList.toggle('slds-hide', !this.displayPricing);
  }
}