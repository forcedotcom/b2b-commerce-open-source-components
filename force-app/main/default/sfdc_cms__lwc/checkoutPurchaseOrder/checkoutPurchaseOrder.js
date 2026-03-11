import { api, wire } from 'lwc';
import { SessionContextAdapter } from 'commerce/contextApi';
import { simplePurchaseOrderPayment, CheckoutComponentBase } from 'commerce/checkoutApi';
import { CheckoutStage } from 'commerce/checkoutApi';
import { createCheckoutPaymentDataEvent, dispatchDataEvent } from 'commerce/dataEventApi';
const Locators = {
  purchaseOrderInput: '[data-purchase-order-input]'
};

/**
 * @slot heading
 * @slot billingAddress
 */

export default class CheckoutPurchaseOrder extends CheckoutComponentBase {
  static renderMode = 'light';
  _isLoggedIn = false;
  _expandedMode = false;
  @api
  set expandedMode(value) {
    this._expandedMode = value;
  }
  get expandedMode() {
    return this._expandedMode;
  }
  @api
  inputLabel;
  @api
  placeholderLabel;
  @api
  requireBillingAddress = false;
  @wire(SessionContextAdapter)
  sessionHandler(response) {
    if (!this.expandedMode && response?.data && !response.loading) {
      this._isLoggedIn = response?.data?.isLoggedIn;
    }
  }
  @api
  checkoutDetails;
  transformToPaymentAddress(address) {
    const result = {
      city: address.city,
      country: address.country,
      name: address.name,
      postalCode: address.postalCode,
      region: address.region,
      street: address.street
    };
    return result;
  }
  @api
  async completePayment() {
    await this.dispatchUpdateErrorAsync({
      groupId: 'DbbPayment'
    });
    let address;
    if (this.requireBillingAddress && this.checkoutDetails?.billingInfo?.address) {
      address = this.transformToPaymentAddress(this.checkoutDetails?.billingInfo?.address);
    }
    const checkoutId = this.checkoutDetails?.checkoutId;
    const purchaseOrderInputValue = this.getPurchaseOrderInput().value;
    const cartId = this.checkoutDetails?.cartSummary?.cartId;
    if (this.requireBillingAddress && !address || !checkoutId || !purchaseOrderInputValue) {
      return false;
    }
    try {
      const res = await simplePurchaseOrderPayment(checkoutId, purchaseOrderInputValue, address);
      if (cartId && res.salesforceResultCode === 'Success') {
        dispatchDataEvent(this, createCheckoutPaymentDataEvent(cartId));
      }
      return true;
    } catch (e) {
      await this.dispatchUpdateErrorAsync({
        groupId: 'DbbPayment',
        type: '/site/commerceErrors/checkout-failure',
        exception: e
      });
      console.warn('PurchaseOrder.completePayment', e);
      return false;
    }
  }
  getPurchaseOrderInput() {
    return this.querySelector(Locators.purchaseOrderInput);
  }
  isAddressValid(address) {
    return !!address?.country;
  }
  stageAction(checkoutStage) {
    switch (checkoutStage) {
      case CheckoutStage.REPORT_VALIDITY_SAVE:
        return Promise.resolve(this.reportValidity());
      case CheckoutStage.PAYMENT:
        return this.completePayment();
      default:
        return Promise.resolve(true);
    }
  }
  reportValidity() {
    const purchaseOrderInput = this.getPurchaseOrderInput();
    if (!this.requireBillingAddress) {
      return purchaseOrderInput.reportValidity();
    }
    return purchaseOrderInput.reportValidity() && this.isAddressValid(this.checkoutDetails?.billingInfo?.address);
  }
  get _showComponent() {
    return this.expandedMode || this._isLoggedIn;
  }
  get showStencil() {
    return !this.checkoutDetails;
  }
  get _showEditLayoutClass() {
    return this.expandedMode || !this.showStencil ? '' : 'slds-hide';
  }
  connectedCallback() {
    this.dispatchUpdateAsync({
      display: {
        hidePlaceOrderButton: false
      }
    }).catch(() => {});
  }
}