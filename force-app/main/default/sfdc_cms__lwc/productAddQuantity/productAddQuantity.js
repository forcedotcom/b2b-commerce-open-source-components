import { api, LightningElement } from 'lwc';
import { ADD_PRODUCT_TO_CART_EVT } from './constants';
import { isDesignMode } from 'experience/clientApi';
export default class ProductAddQuantity extends LightningElement {
  static renderMode = 'light';
  isQuantityInvalid = false;
  @api
  isOutOfStock = false;
  currentQuantity;
  @api
  buttonText;
  @api
  buttonVariant;
  @api
  quantityRule;
  @api
  outOfStockText;
  @api
  availableQuantity;
  @api
  set quantity(value) {
    if (value !== undefined) {
      this.currentQuantity = value;
    }
  }
  get quantity() {
    return this.currentQuantity;
  }
  @api
  disabled = false;
  @api
  iconName;
  @api
  minimumText;
  @api
  maximumText;
  @api
  incrementText;
  @api
  quantitySelectorLabel;
  get computedAddToCartButtonText() {
    if (isDesignMode) {
      return this.buttonText;
    }
    return this.isOutOfStock ? this.outOfStockText : this.buttonText;
  }
  get quantityRuleIncrement() {
    return this.quantityRule?.increment ?? null;
  }
  get quantityRuleMinimum() {
    return this.quantityRule?.minimum ?? null;
  }
  get quantityRuleMaximum() {
    return this.quantityRule?.maximum ?? null;
  }
  get buttonDisabled() {
    if (isDesignMode) {
      return false;
    }
    return this.disabled || this.isQuantityInvalid || this.isOutOfStock;
  }
  get hasIcon() {
    return Boolean(this.iconName);
  }
  get buttonIconVariant() {
    return this.buttonVariant === 'primary' ? 'inverse' : undefined;
  }
  handleValueChanged(event) {
    this.isQuantityInvalid = !event?.detail?.isValid;
  }
  handleValidityChanged(event) {
    this.isQuantityInvalid = !event.detail?.isValid;
  }
  handleAddToCart(event) {
    event.stopPropagation();
    this.dispatchEvent(new CustomEvent(ADD_PRODUCT_TO_CART_EVT, {
      bubbles: true,
      composed: true,
      detail: {
        quantity: this.currentQuantity
      }
    }));
  }
}