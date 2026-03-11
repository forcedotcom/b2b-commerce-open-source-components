import { api, LightningElement } from 'lwc';
import { generateStyleProperties } from 'experience/styling';
/**
 * @slot termsAndConditions
 * @slot discountAmount
 */

export default class CartPromotionApplied extends LightningElement {
  static renderMode = 'light';
  @api
  couponCode;
  @api
  name;
  @api
  showDiscountAmount = false;
  @api
  showTermsAndConditions = false;
  @api
  couponId;
  @api
  termsAndConditions;
  @api
  termsAndConditionsTitleText;
  @api
  backgroundColor;
  @api
  borderRadius;
  @api
  borderColor;
  @api
  appliedPromotionTextColor;
  @api
  appliedPromotionBackgroundColor;
  @api
  appliedPromotionFontSize;
  get appliedPromotionCssStyles() {
    const styles = [{
      name: '--com-c-cart-applied-promotion-background-color',
      value: this.backgroundColor
    }, {
      name: '--com-c-pill-text-color',
      value: this.appliedPromotionTextColor
    }, {
      name: '--com-c-pill-background-color',
      value: this.appliedPromotionBackgroundColor || 'rgb(217, 223, 231)'
    }, {
      name: '--com-c-pill-border-radius',
      value: this.borderRadius ? this.borderRadius + 'px' : ''
    }, {
      name: '--com-c-pill-border-color',
      value: this.borderColor
    }, {
      name: '--com-c-pill-font-size',
      value: this.getDxpButtonFontSize(this.appliedPromotionFontSize)
    }];
    return generateStyleProperties(styles);
  }
  getDxpButtonFontSize(fontSize) {
    switch (fontSize) {
      case 'small':
        return 'var(--dxp-s-button-small-font-size)';
      case 'medium':
        return 'var(--dxp-s-button-font-size)';
      case 'large':
        return 'var(--dxp-s-button-large-font-size)';
      default:
        return '';
    }
  }
}