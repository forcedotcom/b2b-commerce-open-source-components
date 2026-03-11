import { LightningElement, api } from 'lwc';
/**
 * @slot orderProductsInfoRepeater
 */
export default class OrderProducts extends LightningElement {
  static renderMode = 'light';
  @api
  orderDeliveryGroups;
  get isLoading() {
    return !this.orderDeliveryGroups;
  }
}