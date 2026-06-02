import { api, LightningElement, wire } from 'lwc';
import { SessionContextAdapter } from 'commerce/contextApi';
import { isPreviewMode } from 'experience/clientApi';
import { billingAddressText } from './labels';

/**
 * @slot creditCardBillingHeading
 * @slot purchaseOrderBillingHeading
 * @slot soloBillingHeading
 */
export default class CheckoutDualPayment extends LightningElement {
  static renderMode = 'light';
  @api
  expandedMode = false;
  @api
  checkoutDetails;
  @api
  isPurchaseOrderAvailable = false;
  @api
  requireBillingAddress = false;
  @api
  cardPaymentLabel;
  @api
  headerLabel;
  @api
  inputLabel;
  @api
  placeholderLabel;
  @api
  billingAddressLabel = billingAddressText;
  @api
  billingAddressSameAsShippingAddressLabel;
  @api
  phoneNumberLabel;
  @api
  phoneNumberPlaceholderText;
  _isLoggedIn = false;
  @wire(SessionContextAdapter)
  sessionHandler(response) {
    if (!this._expandedMode && !response.loading) {
      this._isLoggedIn = response?.data?.isLoggedIn;
    }
  }
  selectedSection = 'credit-card';
  get isCreditCardExpanded() {
    return this.selectedSection === 'credit-card' || this._expandedMode;
  }
  get isPurchaseOrderExpanded() {
    return this.selectedSection !== 'credit-card' || this._expandedMode;
  }
  get _expandedMode() {
    return this.expandedMode || isPreviewMode;
  }
  get _showPurchaseOrder() {
    return this._expandedMode || this.isPurchaseOrderAvailable && !!this._isLoggedIn;
  }
  handleSectionSelected(event) {
    this.selectedSection = event.detail.name;
  }
}