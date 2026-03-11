import { LightningElement, api } from 'lwc';
import TermsAndConditionsModal from 'site/legalTermsandconditionsModal';
import { popoverCloseAssistiveText } from './labels';
const MODAL_SIZE = 'small';
const REMOVE_COUPON = 'removecoupon';
export default class CartPromotionAppliedUi extends LightningElement {
  static renderMode = 'light';
  labels = {
    popoverCloseAssistiveText
  };
  @api
  couponCode;
  @api
  name;
  @api
  showTermsAndConditions = false;
  @api
  showDiscountAmount = false;
  @api
  couponId;
  @api
  termsAndConditions;
  @api
  termsAndConditionsTitleText;
  get showTermsAndConditionsButton() {
    return Boolean(this.showTermsAndConditions && this.termsAndConditions);
  }
  get showRemoveButton() {
    return !!this.couponId;
  }
  get showInfoIcon() {
    return Boolean(this.couponCode && this.name);
  }
  get promoText() {
    return this.couponCode ? this.couponCode : this.name;
  }
  async showTermsAndConditionsModal() {
    await TermsAndConditionsModal.open({
      size: MODAL_SIZE,
      bodyText: this.termsAndConditions,
      headerText: this.termsAndConditionsTitleText
    });
  }
  removeCoupon() {
    const removeEvent = new CustomEvent(REMOVE_COUPON, {
      detail: {
        couponId: this.couponId
      },
      bubbles: true
    });
    this.dispatchEvent(removeEvent);
  }
}