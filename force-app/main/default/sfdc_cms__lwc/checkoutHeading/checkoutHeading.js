import { api, LightningElement } from 'lwc';
/**
 * @slot desktop
 * @slot mobile
 */
export default class CheckoutHeading extends LightningElement {
  static renderMode = 'light';
  @api
  cartTotals;
  @api
  cartDetails;
  get hasTotal() {
    return !!this.cartDetails?.currencyIsoCode && !!this.cartTotals?.grandTotal;
  }
  @api
  showMobileOnly = false;
  get showDesktop() {
    return !this.showMobileOnly;
  }
  get showMobile() {
    return this.showMobileOnly;
  }
}