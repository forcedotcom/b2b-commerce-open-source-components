import { LightningElement, api } from 'lwc';
import { generateDisplayablePromotionName } from 'site/promotionNameDisplayEvaluator';
import styleStringGenerator from './styleStringGenerator';
export default class OrderPromotionsAppliedUi extends LightningElement {
  static renderMode = 'light';
  _orderPromotionDetails;
  _adjustments = [];
  @api
  get orderPromotionDetails() {
    return this._orderPromotionDetails;
  }
  set orderPromotionDetails(orderPromotionDetails) {
    this._orderPromotionDetails = orderPromotionDetails;
    const isPromotionType = adjustment => adjustment.type === 'Promotion';
    if (this.orderPromotionDetails) {
      this._adjustments = this.orderPromotionDetails.filter(isPromotionType).map(function (adj, index) {
        const appliedPromotion = {
          id: `${index}`,
          name: generateDisplayablePromotionName(adj.displayName, adj.basisReferenceDisplayName || ''),
          discountAmount: adj.amount,
          termsAndConditions: undefined
        };
        return appliedPromotion;
      });
      if (this._adjustments.length > 0) {
        this._currencyIsoCode = this.orderPromotionDetails[0].currencyIsoCode;
      }
    }
  }
  @api
  promotionTitle;
  @api
  backgroundColor;
  @api
  borderColor;
  @api
  borderRadius;
  get _borderRadius() {
    return this.borderRadius ? this.borderRadius + 'px' : '0px';
  }
  @api
  textColor;
  @api
  amountTextColor;
  _currencyIsoCode;
  get _showAppliedAdjustments() {
    return this._adjustments?.length > 0;
  }
  get defaultOrderAppliedPromotionsStyle() {
    const styles = {
      'default-background-color': this.backgroundColor,
      'default-text-color': this.textColor,
      'default-heading-text-color': this.textColor,
      'default-amount-text-color': this.amountTextColor,
      'default-border-color': this.borderColor,
      'default-border-radius': this._borderRadius
    };
    return styleStringGenerator.defaultOrderAppliedPromotionsStyles.createForStyles(styles);
  }
}