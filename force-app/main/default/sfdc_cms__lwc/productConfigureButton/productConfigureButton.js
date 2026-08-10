import { api, LightningElement, wire } from 'lwc';
import { generateStyleProperties } from 'experience/styling';
import ProductConfigureFlowModal from 'site/productConfigureFlowModal';
import { isDesignMode } from 'experience/clientApi';
import { ProductErrors } from 'site/commerceErrors';
import { SessionContextAdapter, AppContextAdapter } from 'commerce/contextApi';
import { productConfigureFlowModalTitle } from './labels';
export default class ProductConfigureButton extends LightningElement {
  static renderMode = 'light';
  @api
  product;
  @api
  selectedProductSellingModel;
  @api
  productPricing;
  @api
  configureButtonText;
  @api
  outOfStockText;
  @api
  configureButtonBackgroundColor;
  @api
  configureButtonBackgroundHoverColor;
  @api
  configureButtonBorderColor;
  @api
  configureButtonBorderRadius;
  @api
  configureButtonTextColor;
  @api
  configureButtonTextHoverColor;
  _errors;
  @api
  get errors() {
    return this._errors;
  }
  set errors(value) {
    this._errors = value;
  }
  @api
  get parsedErrors() {
    if (Array.isArray(this.errors)) {
      return this.errors;
    }
    if (typeof this.errors === 'string') {
      try {
        return JSON.parse(this.errors);
      } catch {
        return [];
      }
    }
    return [];
  }
  @wire(SessionContextAdapter)
  sessionContext;
  @wire(AppContextAdapter)
  appContext;
  @api
  get isOutOfStock() {
    return this.parsedErrors.some(error => error?.code === ProductErrors.OUT_OF_STOCK.code);
  }
  get isGuestUser() {
    return !this.sessionContext?.data?.isLoggedIn;
  }
  get configuratorFlowApiName() {
    return this.appContext?.data?.productConfig?.configuratorFlowApiName || '';
  }
  get displayConfigureButton() {
    if (isDesignMode) {
      return true;
    }
    return this.product?.isConfigurationAllowed === true;
  }
  get isConfigureButtonDisabled() {
    if (isDesignMode) {
      return true;
    }
    return this.isOutOfStock || !this.isPricingAvailable || this.isGuestUser || !this.configuratorFlowApiName;
  }
  get isPricingAvailable() {
    return Boolean(this.productPricing && Object.keys(this.productPricing).length > 0);
  }
  get computedConfigureButtonText() {
    if (isDesignMode) {
      return this.configureButtonText;
    }
    if (this.isOutOfStock && this.outOfStockText) {
      return this.outOfStockText;
    }
    return this.configureButtonText;
  }
  get configureButtonCssStyles() {
    return generateStyleProperties({
      '--com-c-button-primary-color': this.configureButtonTextColor || 'initial',
      '--com-c-button-primary-color-background': this.configureButtonBackgroundColor || 'initial',
      '--com-c-button-primary-color-background-hover': this.configureButtonBackgroundHoverColor || 'initial',
      '--com-c-button-primary-color-border': this.configureButtonBorderColor || 'initial',
      '--com-c-button-primary-color-hover': this.configureButtonTextHoverColor || 'initial',
      '--com-c-button-radius-border': this.configureButtonBorderRadius ? this.configureButtonBorderRadius + 'px' : 'initial'
    });
  }
  handleConfigureButtonClick() {
    ProductConfigureFlowModal.open({
      label: productConfigureFlowModalTitle,
      size: 'large',
      flowApiName: this.configuratorFlowApiName,
      configureContext: {
        productDetails: {
          ...this.product,
          selectedProductSellingModel: this.selectedProductSellingModel
        }
      }
    });
  }
}