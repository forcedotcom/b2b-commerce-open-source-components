import { api, LightningElement } from 'lwc';
import { generateButtonSizeClass, generateButtonStretchClass, generateButtonVariantClass, generateElementAlignmentClass } from 'experience/styling';
export default class ProductAddToCartButton extends LightningElement {
  static renderMode = 'light';
  @api
  ariaLabel = null;
  @api
  disabled = false;
  @api
  iconName;
  @api
  text;
  @api
  alignment;
  @api
  size;
  @api
  variant;
  @api
  width;
  @api
  focus() {
    this.refs?.button?.focus();
  }
  get hasIcon() {
    return (this.iconName || '').length > 0;
  }
  get customButtonClasses() {
    return ['slds-button', generateButtonVariantClass(this.variant ?? null), generateButtonSizeClass(this.size ?? null), generateButtonStretchClass(this.width ?? null), generateElementAlignmentClass(this.alignment ?? null)].filter(str => str !== '').join(' ');
  }
}