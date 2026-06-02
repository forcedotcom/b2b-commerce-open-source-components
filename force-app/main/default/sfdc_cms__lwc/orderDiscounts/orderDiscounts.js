import { LightningElement, api } from 'lwc';
export default class OrderDiscounts extends LightningElement {
  static renderMode = 'light';
  @api
  discounts;
  @api
  discountsLabel;
  @api
  currencyCode;
  @api
  totalDiscount;
  isExpanded = true;
  get orderDiscountsList() {
    return this.discounts || [];
  }
  handleExpandCollapseClick() {
    this.isExpanded = !this.isExpanded;
  }
}