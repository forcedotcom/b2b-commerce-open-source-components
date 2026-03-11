import { LightningElement, api, wire } from 'lwc';
import { CartContentsAdapter, CartStatusAdapter } from 'commerce/checkoutCartApi';
import currency from '@salesforce/i18n/currency';
import { LAYOUT_LABEL_AND_TOTAL_PRICE } from './constants';
import { SessionContextAdapter } from 'commerce/contextApi';
import { generateStyleProperties } from 'experience/styling';
import { AppContextAdapter } from 'commerce/contextApi';
export { LAYOUT_LABEL, LAYOUT_LABEL_AND_TOTAL_PRICE } from './constants';
export default class CheckoutButton extends LightningElement {
  static renderMode = 'light';
  @api
  text;
  @api
  variant;
  @api
  size;
  @api
  width;
  @api
  alignment;
  @api
  buttonTextColor;
  @api
  buttonTextHoverColor;
  @api
  buttonBackgroundColor;
  @api
  buttonBackgroundHoverColor;
  @api
  buttonBorderColor;
  @api
  buttonBorderRadius;
  @api
  layoutDesktop;
  @api
  layoutMobile;
  get hasProducts() {
    return Number(this.cartSummary?.totalProductCount) > 0;
  }
  @wire(CartContentsAdapter)
  cartContentsEntry;
  get cartSummary() {
    return this.cartContentsEntry?.data?.cartSummary;
  }
  @wire(CartStatusAdapter)
  cartStatusHandler;
  @wire(SessionContextAdapter)
  sessionContext;
  _managedCheckoutVersion;
  @wire(AppContextAdapter)
  appContextHandler(response) {
    if (response.data && response?.data?.checkoutSettings) {
      const managedCheckoutVersion = response?.data?.managedCheckoutVersion;
      const isManagedCheckoutEnabled = !!response?.data?.checkoutSettings?.isManagedCheckoutEnabled;
      if (isManagedCheckoutEnabled && managedCheckoutVersion && managedCheckoutVersion !== '0.117.0') {
        this._managedCheckoutVersion = managedCheckoutVersion;
      }
    }
  }
  get cartId() {
    return this.cartSummary?.cartId;
  }
  get currencyCode() {
    return this.cartSummary?.currencyIsoCode || currency;
  }
  get isCartProcessing() {
    let val = !!this.cartStatusHandler?.data?.isProcessing || !!this.cartContentsEntry?.loading;
    if (typeof window !== 'undefined') {
      val = val || !!this.cartStatusHandler?.loading;
    }
    return val;
  }
  get cartHasError() {
    return !!this.cartStatusHandler?.error || !!this.cartContentsEntry?.error;
  }
  get mediumCartTotal() {
    const cartTotal = this.cartSummary?.grandTotalAmount;
    if (cartTotal && this.layoutDesktop === LAYOUT_LABEL_AND_TOTAL_PRICE) {
      return cartTotal;
    }
    return undefined;
  }
  get smallCartTotal() {
    const cartTotal = this.cartSummary?.grandTotalAmount;
    if (cartTotal && this.layoutMobile === LAYOUT_LABEL_AND_TOTAL_PRICE) {
      return cartTotal;
    }
    return undefined;
  }
  get isDisabled() {
    return !this.hasProducts || this.isCartProcessing || this.cartHasError || this.cartStatusHandler?.data?.isReadyForCheckout === false;
  }
  get buttonStyle() {
    const styles = [{
      name: '--com-c-button-color',
      value: this.buttonTextColor
    }, {
      name: '--com-c-button-color-hover',
      value: this.buttonTextHoverColor
    }, {
      name: '--com-c-button-color-background',
      value: this.buttonBackgroundColor
    }, {
      name: '--com-c-button-color-background-hover',
      value: this.buttonBackgroundHoverColor
    }, {
      name: '--com-c-button-radius-border',
      value: this.buttonBorderRadius ? this.buttonBorderRadius + 'px' : ''
    }, {
      name: '--com-c-button-color-border',
      value: this.buttonBorderColor
    }];
    return generateStyleProperties(styles);
  }
  get _hasSubscriptions() {
    return Boolean(this.cartSummary?.totalSubProductCount && parseFloat(this.cartSummary?.totalSubProductCount) > 0);
  }
  get _cannotCheckoutWithSubscriptionProducts() {
    return this.sessionContext?.data?.isLoggedIn === false && this._hasSubscriptions;
  }
  get canCheckout() {
    return !this.isCartProcessing && this.cartStatusHandler?.data?.isGuestCheckoutEnabled === true && !this._cannotCheckoutWithSubscriptionProducts;
  }
}