import { LightningElement, api } from 'lwc';
export default class CartSummaryUi extends LightningElement {
  static renderMode = 'light';
  @api
  isCartProcessing = false;
  @api
  cartTotals;
  @api
  currencyCode;
}