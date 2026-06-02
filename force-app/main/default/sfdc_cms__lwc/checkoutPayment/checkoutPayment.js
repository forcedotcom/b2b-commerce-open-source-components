import { api, track, wire } from 'lwc';
import { CheckoutComponentBase, CheckoutStage } from 'commerce/checkoutApi';
import { AppContextAdapter } from 'commerce/contextApi';
import { CheckoutStencilType } from 'site/checkoutStencil';
import { createCheckoutPaymentDataEvent, dispatchDataEvent } from 'commerce/dataEventApi';
function isAddressValid(address) {
  return !!address?.country;
}

/**
 * @slot heading
 * @slot billingAddress
 */
export default class CheckoutPayment extends CheckoutComponentBase {
  static renderMode = 'light';
  _expandedMode = false;
  @api
  set expandedMode(value) {
    this._expandedMode = value;
    this._showStencil = false;
  }
  get expandedMode() {
    return this._expandedMode;
  }
  @track
  _checkoutDetails;
  @api
  get checkoutDetails() {
    return this._checkoutDetails;
  }
  set checkoutDetails(value) {
    this._checkoutDetails = value;
    this._showStencil = this._showStencil && !this._checkoutDetails;
  }
  @api
  cardPaymentLabel;
  get _hasSubscriptionProduct() {
    return parseInt(this._checkoutDetails?.cartSummary?.totalSubProductCount ?? '0', 10) > 0;
  }
  _stencilType = CheckoutStencilType.PAYMENT;
  _showStencil = true;
  _webstoreId = '';
  @wire(AppContextAdapter)
  appContextHandler(response) {
    this._webstoreId = response?.data?.webstoreId ?? '';
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
    const addressValid = isAddressValid(this._checkoutDetails?.billingInfo?.address);
    return (this.getPaymentMethodComponent()?.reportValidity() ?? false) && addressValid;
  }
  setAspect(newAspect) {
    if (newAspect.errorFocus) {
      if (!document.activeElement?.className?.split(' ')?.some(r => r === 'slds-has-error')) {
        if (!this.getPaymentMethodComponent()?.reportValidity()) {
          this.getPaymentMethodComponent()?.focus();
        }
      }
    }
  }
  async completePayment() {
    await this.dispatchUpdateErrorAsync({
      groupId: 'DbbPayment'
    });
    const address = this._checkoutDetails?.billingInfo?.address;
    const checkoutId = this._checkoutDetails?.checkoutId;
    const cartId = this._checkoutDetails?.cartSummary?.cartId;
    const paymentComponent = this.getPaymentMethodComponent();
    if (!isAddressValid(address) || !checkoutId || !paymentComponent) {
      return false;
    }
    try {
      const response = await paymentComponent.completePayment(checkoutId, address);
      if (cartId && response.salesforceResultCode === 'Success') {
        dispatchDataEvent(this, createCheckoutPaymentDataEvent(cartId));
      }
      return true;
    } catch (e) {
      await this.dispatchUpdateErrorAsync({
        groupId: 'DbbPayment',
        type: '/site/commerceErrors/payment-failure',
        exception: e
      });
      return false;
    }
  }
  get _showEditLayoutClass() {
    return this._showStencil ? 'slds-hide' : '';
  }
  getPaymentMethodComponent() {
    const ref = this.refs?.paymentComponent;
    return ref?.isConnected ? ref : null;
  }
}