import { api, LightningElement } from 'lwc';
import { generateButtonSizeClass, generateButtonStretchClass, generateButtonVariantClass, generateElementAlignmentClass } from 'experience/styling';
export default class CommonButtonUi extends LightningElement {
  static renderMode = 'light';
  @api
  disabled = false;
  @api
  assistiveText;
  @api
  variant;
  @api
  size;
  @api
  width;
  @api
  alignment;
  @api
  focus() {
    const button = this.refs?.actionButton;
    button?.focus();
  }
  get buttonClasses() {
    return ['slds-button', generateButtonVariantClass(this.variant ?? null), generateButtonSizeClass(this.size ?? null), generateButtonStretchClass(this.width ?? null), generateElementAlignmentClass(this.alignment ?? null)];
  }
}