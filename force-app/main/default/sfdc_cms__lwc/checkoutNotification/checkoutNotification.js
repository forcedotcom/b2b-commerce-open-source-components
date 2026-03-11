import { setHostElementForEkg } from 'site/checkoutEkg';
import { api, wire } from 'lwc';
import { NavigationContext, navigate } from 'lightning/navigation';
import { CheckoutComponentBase } from 'commerce/checkoutApi';
import { isDesignMode } from 'experience/clientApi';
import { fatalErrorLabels, generateErrorLabel, generateNotificationLabel, noErrorLabels } from 'site/checkoutErrorHandler';
import { checkoutStatusIsReady } from './utils';
import { alternativeSpinnerText } from './labels';
import sanitizeValue from 'site/commonRichtextsanitizerUtils';
const CART_PAGE_REF = {
  type: 'comm__namedPage',
  attributes: {
    name: 'Current_Cart'
  }
};
export default class CheckoutNotification extends CheckoutComponentBase {
  static renderMode = 'light';
  @api
  visibleLoadingIndicator = false;
  @api
  a11yLoadingIndicator = false;
  @api
  sessionErrors = false;
  @api
  integrationErrors = false;
  @api
  clientErrors = false;
  @api
  typeShippingFailure = false;
  @api
  typePaymentFailure = false;
  @api
  typeCheckoutFailure = false;
  @api
  typeInventoryFailure = false;
  @api
  typeOtherIntegrationFailure = false;
  @api
  typeOther = false;
  _checkoutDetails;
  @api
  get checkoutDetails() {
    return this._checkoutDetails;
  }
  set checkoutDetails(value) {
    this._checkoutDetails = value;
    this.computeErrorLabels();
  }
  _checkoutSessionError;
  @api
  get checkoutSessionError() {
    return this._checkoutSessionError;
  }
  set checkoutSessionError(value) {
    this._checkoutSessionError = value;
    this.computeErrorLabels();
  }
  @api
  checkoutPaymentLink;
  _errorLabels = noErrorLabels;
  labels = {
    alternativeSpinnerText
  };
  _cartUrl = '';
  @wire(NavigationContext)
  _navigationContext;
  get sessionError() {
    return this._checkoutSessionError?.error;
  }
  get isLoading() {
    return !this.sessionError && !checkoutStatusIsReady(this.checkoutDetails?.checkoutStatus);
  }
  _rendered = false;
  renderedCallback() {
    if (!this._rendered) {
      this._rendered = true;
      setHostElementForEkg(this.querySelector('[data-ekg]'));
    }
  }
  typeFilter(allKnownTypes) {
    const result = ['/commerce/global/place-order'];
    if (allKnownTypes || this.typeShippingFailure) {
      result.push('/commerce/errors/shipping-failure');
      result.push('/commerce/integrations/shipping');
    }
    if (allKnownTypes || this.typePaymentFailure) {
      result.push('/commerce/errors/payment-failure');
      result.push('/commerce/payment');
    }
    if (allKnownTypes || this.typeCheckoutFailure) {
      result.push('/commerce/errors/checkout-failure');
    }
    if (allKnownTypes || this.typeInventoryFailure) {
      result.push('/commerce/integrations/inventory');
    }
    if (allKnownTypes || this.typeOtherIntegrationFailure) {
      result.push('/commerce/integrations/other');
    }
    return result;
  }
  matchTypeFilter(e) {
    if (!e?.type) {
      return false;
    }
    if (this.typeOther && !this.typeFilter(true).includes(e.type)) {
      return true;
    }
    return this.typeFilter(false).includes(e.type);
  }
  computeErrorLabels() {
    const prevError = this._errorLabels;
    if (this.sessionErrors && this.sessionError) {
      const errorLabels = generateErrorLabel(this.sessionError, fatalErrorLabels);
      this._errorLabels = {
        header: sanitizeValue(errorLabels.header, []),
        body: sanitizeValue(errorLabels.body, []),
        returnToCart: errorLabels.returnToCart
      };
    } else if (this.clientErrors && this.matchTypeFilter(this.checkoutDetails?.notifications?.[0])) {
      const notificationLabels = generateNotificationLabel(this.checkoutDetails?.notifications?.[0]);
      this._errorLabels = {
        header: sanitizeValue(notificationLabels.header, []),
        body: sanitizeValue(notificationLabels.body, []),
        returnToCart: notificationLabels.returnToCart
      };
    } else if (this.integrationErrors && this.matchTypeFilter(this.checkoutDetails?.errors?.[0])) {
      const integrationErrorLabels = generateErrorLabel(this.checkoutDetails?.errors?.[0].detail);
      this._errorLabels = {
        header: sanitizeValue(integrationErrorLabels.header, []),
        body: sanitizeValue(integrationErrorLabels.body, []),
        returnToCart: integrationErrorLabels.returnToCart
      };
    } else {
      this._errorLabels = noErrorLabels;
    }
    if (this._errorLabels !== noErrorLabels && prevError !== this._errorLabels) {
      this.dispatchRequestAspect({
        summarizable: false
      });
    }
  }
  get showError() {
    return this._errorLabels !== noErrorLabels;
  }
  get showReturnToCart() {
    return isDesignMode ? false : !!this._errorLabels.returnToCart && !this.checkoutPaymentLink?.paymentMethodSetDevName;
  }
  navigateToCartPage() {
    this._navigationContext && navigate(this._navigationContext, CART_PAGE_REF);
  }
  handleClose(e) {
    const {
      cartItemId,
      close
    } = e.detail;
    this.navigateToCartPage();
  }
}