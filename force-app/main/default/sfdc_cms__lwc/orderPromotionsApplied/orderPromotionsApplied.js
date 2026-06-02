import { LightningElement, api } from 'lwc';
export default class OrderPromotionsApplied extends LightningElement {
  static renderMode = 'light';
  @api
  orderPromotionDetails;
  @api
  promotionTitle;
  @api
  backgroundColor;
  @api
  borderColor;
  @api
  borderRadius;
  @api
  textColor;
  @api
  amountTextColor;
}