import { LightningElement, api } from 'lwc';
export default class PromotionSummaryUi extends LightningElement {
  static renderMode = 'light';
  @api
  appliedPromotions;
  @api
  headerText;
  @api
  currencyCode;
  @api
  termsAndConditionsHeaderText;
  get appliedPromotionsDisplayList() {
    return this.appliedPromotions || [];
  }
}