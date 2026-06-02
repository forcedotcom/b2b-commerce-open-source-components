import { api, LightningElement } from 'lwc';
import { headerText, summaryText, originalPrice, promotions, tax, taxIncluded, total, shipping, subtotal } from './labels';

/**
 * @slot content
 * @slot summary
 */
export default class SplitShipmentLayout extends LightningElement {
  static renderMode = 'light';
  headerText = headerText;
  summaryText = summaryText;
  originalPrice = originalPrice;
  promotions = promotions;
  shipping = shipping;
  subtotal = subtotal;
  taxIncluded = taxIncluded;
  tax = tax;
  total = total;
  _showSummaryExpanded = false;
  get _summaryColumnClass() {
    return `column-content ${this._showSummaryExpanded ? 'show' : ''}`;
  }
  @api
  showSummaryColumn = false;
  _checkoutDetails;
  @api
  get checkoutDetails() {
    return this._checkoutDetails;
  }
  set checkoutDetails(value) {
    this._checkoutDetails = value;
  }
  @api
  cartDetails;
  @api
  cartTotals;
  @api
  cartSummaryCartTotals;
  @api
  summaryColumnBackgroundColor;
  get summaryColumnStyles() {
    const backgroundColor = this.summaryColumnBackgroundColor || 'rgba(242, 245, 249, 1))';
    return `--checkout-summary-background-color: ${backgroundColor}; --com-c-checkout-summary-container-cart-items-height: 25rem`;
  }
  handleSummaryToggle() {
    this._showSummaryExpanded = !this._showSummaryExpanded;
  }
  get containerClasses() {
    return `container ${this.showSummaryColumn ? 'show-summary-column' : ''}`;
  }
}