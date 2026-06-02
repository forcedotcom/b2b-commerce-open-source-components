import { LightningElement, api } from 'lwc';
import { transformPromotions } from './transformPromotions';
export default class PromotionAppliedDetailsPopover extends LightningElement {
  static renderMode = 'light';
  @api
  headerLabel;
  @api
  termsAndConditionsTitleText;
  @api
  currencyCode;
  @api
  appliedPromotions;
  @api
  closeButtonAssistiveText;
  @api
  savingsInfoBubbleAssistiveText;
  get hasAppliedPromotions() {
    return Array.isArray(this.appliedPromotions) && this.appliedPromotions.length > 0;
  }
  get showSavingsInfoIcon() {
    return Boolean(this.hasAppliedPromotions);
  }
  get displayableAppliedPromotions() {
    const promotions = this.appliedPromotions || [];
    return transformPromotions(promotions, this.currencyCode);
  }
  get popover() {
    return this.refs?.popupSource;
  }
  openPopover() {
    this.popover?.open({
      alignment: 'bottom',
      autoFlip: false,
      size: 'small'
    });
  }
  closePopover() {
    this.popover?.close();
  }
  handleClickAction() {
    if (this.hasAppliedPromotions) {
      this.openPopover();
    }
  }
}