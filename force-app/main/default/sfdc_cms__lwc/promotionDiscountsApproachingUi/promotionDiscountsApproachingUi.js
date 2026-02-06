import { LightningElement, api } from 'lwc';
export default class PromotionDiscountsApproachingUi extends LightningElement {
  static renderMode = 'light';
  @api
  discountsApproaching;
  get hasDiscountsApproaching() {
    return Array.isArray(this.discountsApproaching) && this.discountsApproaching.length > 0;
  }
}