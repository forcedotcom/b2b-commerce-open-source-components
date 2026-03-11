import { LightningElement, api } from 'lwc';
/**
 * @slot subscriptionPolicyDisclaimer
 */
export default class CheckoutSubscriptionPolicyDisclaimer extends LightningElement {
  static renderMode = 'light';
  @api
  cartDetails;
  get _showSubscriptionPolicyDisclaimer() {
    return Boolean(this.cartDetails?.hasSubscriptionProducts);
  }
}