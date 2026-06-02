import { LightningElement, api } from 'lwc';
import { getCartName, getCartDescription, hasItemsAndTotal, getItemsDisplayText, getCurrencyCode, parseGrandTotalAmount, hasDescription, shouldShowCartTypePill, getCartTypePillLabel } from './cartDetailsCardUtils';
import labels from './labels';
export default class CartDetailsCard extends LightningElement {
  static renderMode = 'light';
  @api
  cartSummaryData;
  @api
  defaultPillLabel;
  @api
  cartNameLabel;
  @api
  cartDescriptionLabel;
  @api
  optionsDropdownLabel;
  @api
  editCartLabel;
  @api
  markAsDefaultLabel;
  @api
  deleteCartLabel;
  get _cartName() {
    return getCartName(this.cartSummaryData);
  }
  get _showItemsAndTotal() {
    return hasItemsAndTotal(this.cartSummaryData);
  }
  get _itemsLabel() {
    return getItemsDisplayText(this.cartSummaryData);
  }
  get _currencyCode() {
    return getCurrencyCode(this.cartSummaryData);
  }
  get _priceValue() {
    return parseGrandTotalAmount(this.cartSummaryData);
  }
  get _showDescription() {
    return hasDescription(this.cartSummaryData);
  }
  get _cartDescription() {
    return getCartDescription(this.cartSummaryData);
  }
  get _showCartTypePill() {
    return shouldShowCartTypePill(this.cartSummaryData);
  }
  get _cartTypePillLabel() {
    return getCartTypePillLabel(this.cartSummaryData, this.defaultPillLabel);
  }
  get _optionsMenuLabel() {
    return labels.optionsMenuLabel;
  }
  get cartCardStyles() {
    return 'cart-details-card slds-card slds-p-left_small slds-p-right_small slds-p-bottom_small';
  }
  handleCartUpdated(event) {
    event.stopPropagation();
    this.dispatchEvent(new CustomEvent('cartupdated', {
      bubbles: true,
      composed: true
    }));
  }
  handleCartDeleted(event) {
    event.stopPropagation();
    this.dispatchEvent(new CustomEvent('cartdeleted', {
      bubbles: true,
      composed: true,
      detail: event.detail
    }));
  }
  handleCartCleared(event) {
    event.stopPropagation();
    this.dispatchEvent(new CustomEvent('cartcleared', {
      bubbles: true,
      composed: true,
      detail: event.detail
    }));
  }
  handleCartPrimaryChanged(event) {
    event.stopPropagation();
    this.dispatchEvent(new CustomEvent('cartprimarychanged', {
      bubbles: true,
      composed: true
    }));
  }
}