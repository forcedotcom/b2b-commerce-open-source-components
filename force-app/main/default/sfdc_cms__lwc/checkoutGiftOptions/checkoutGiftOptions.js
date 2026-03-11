import { AppContextAdapter } from 'commerce/contextApi';
import { LightningElement, api, wire } from 'lwc';
import { Labels } from './labels';
export default class CheckoutGiftOptions extends LightningElement {
  static renderMode = 'light';
  get isGiftingEnabled() {
    return Boolean(this.appContext?.data?.giftingConfig?.isGiftingEnabled);
  }
  get isGiftWrapEnabled() {
    return Boolean(this.appContext?.data?.giftingConfig?.isGiftWrapEnabled);
  }
  get isGiftMessageEnabled() {
    return Boolean(this.appContext?.data?.giftingConfig?.isGiftMessageEnabled);
  }
  @api
  items;
  @api
  giftWraps;
  @api
  checkoutDetails;
  get labels() {
    return Labels;
  }
  @wire(AppContextAdapter)
  appContext;
}