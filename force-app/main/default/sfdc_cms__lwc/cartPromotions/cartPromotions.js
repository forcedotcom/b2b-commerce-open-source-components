import { LightningElement, api } from 'lwc';
import { createCouponDeleteAction, dispatchAction } from 'commerce/actionApi';
import { debounce } from 'experience/utils';
const removeCouponLocator = 'site-cart-appliedpromotionui site-common-pill lightning-button-icon';
export const applyCouponInputLocator = 'commerce_cart-apply-coupon .coupon-code-input';
const applyCouponRevealLocator = 'commerce_cart-apply-coupon dxp_base-button a';

/**
 * @slot applyCoupon
 * @slot promotionsDisclaimer
 * @slot appliedPromotionRepeater
 */
export default class CartPromotions extends LightningElement {
  static renderMode = 'light';
  _cartPromotions;
  @api
  cartDetails;
  @api
  set cartPromotions(value) {
    if (value && this.focusableCouponCount > value?.length) {
      this._setFocusHelper();
      this.focusableCouponCount = 0;
    }
    this._cartPromotions = value;
  }
  get cartPromotions() {
    return this._cartPromotions;
  }
  _setFocusHelper = debounce(() => {
    if (this.querySelector(removeCouponLocator)) {
      this.querySelector(removeCouponLocator)?.focus();
    } else if (this.querySelector(applyCouponInputLocator)) {
      this.querySelector(applyCouponInputLocator)?.focus();
    } else {
      this.querySelector(applyCouponRevealLocator)?.focus();
    }
  }, 100);
  get showPromotions() {
    return Number(this.cartDetails?.totalProductCount) > 0;
  }
  focusableCouponCount = 0;
  handleRemoveCoupon(event) {
    this.focusableCouponCount = this._cartPromotions?.length || 0;
    dispatchAction(this, createCouponDeleteAction(event.detail.couponId));
  }
  get _hasAppliedPromotions() {
    return Array.isArray(this._cartPromotions) && this._cartPromotions?.length > 0;
  }
  get _showPromotionsDisclaimer() {
    return Boolean(this.cartDetails?.hasSubscriptionProducts && this._hasAppliedPromotions);
  }
}