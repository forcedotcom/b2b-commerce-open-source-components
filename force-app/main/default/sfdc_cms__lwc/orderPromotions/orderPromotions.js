import { LightningElement, api } from 'lwc';
/**
 * @slot promotionsTitle
 */
export default class OrderPromotions extends LightningElement {
  static renderMode = 'light';
  @api
  appliedPromotions;
  get hasPromotions() {
    return !!this.appliedPromotions?.length;
  }
}