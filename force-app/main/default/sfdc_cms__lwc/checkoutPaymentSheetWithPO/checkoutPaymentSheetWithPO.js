import { api, LightningElement, wire } from 'lwc';
import { SessionContextAdapter } from 'commerce/contextApi';
import billingAddressText from '@salesforce/label/site.checkoutPaymentSheetWithPO.billingAddressText';
export default class CheckoutPaymentSheetWithPO extends LightningElement {
  static renderMode = 'light';
  @api
  expandedMode = false;
  activeButtonClasses = 'slds-button_brand active';
  inactiveButtonClasses = 'slds-button_neutral';
  _isPaymentSheetInitialized = true;
  @api
  paymentMethodSetId;
  @api
  useManualCapture = false;
  @api
  enableSavedPaymentMethods = false;
  @api
  enableBusinessAch = false;
  @api
  sepaDebitMandate;
  @api
  isPurchaseOrderAvailable = false;
  @api
  requireBillingAddress = false;
  @api
  billingAddressLabel = billingAddressText;
  @api
  billingAddressSameAsShippingAddressLabel;
  @api
  phoneNumberLabel;
  @api
  phoneNumberPlaceholderText;
  @api
  inputLabel;
  @api
  placeholderLabel;
  selectedSection = 'credit-card';
  @api
  cardPaymentLabel;
  @api
  purchaseOrderLabel;
  _isLoggedIn = false;
  @wire(SessionContextAdapter)
  sessionHandler(response) {
    if (!this.expandedMode && !response.loading) {
      this._isLoggedIn = response?.data?.isLoggedIn;
    }
  }
  @api
  checkoutDetails;
  @api
  cartDetails;
  @api
  cartTotals;
  get isCreditCardExpanded() {
    return this.selectedSection === 'credit-card';
  }
  get isPurchaseOrderExpanded() {
    return this.selectedSection === 'purchase-order';
  }
  get _showPurchaseOrder() {
    return this.expandedMode || this.isPurchaseOrderAvailable && !!this._isLoggedIn;
  }
  get purchaseOrderButtonStyling() {
    return `slds-col slds-button slds-p-horizontal_medium slds-p-vertical_small slds-text-align_left ${this.selectedSection === 'purchase-order' ? this.activeButtonClasses : this.inactiveButtonClasses}`;
  }
  get creditCardButtonStyling() {
    return `slds-col slds-button slds-p-horizontal_medium slds-p-vertical_small slds-text-align_left ${this.selectedSection === 'credit-card' ? this.activeButtonClasses : this.inactiveButtonClasses}`;
  }
  handleSelectPayment(event) {
    this.selectedSection = event.currentTarget.dataset.paymentTypeBtn;
  }
}