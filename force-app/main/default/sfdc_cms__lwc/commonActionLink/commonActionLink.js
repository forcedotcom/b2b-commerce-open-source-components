import { api, LightningElement } from 'lwc';
import { generateButtonSizeClass, generateButtonStretchClass, generateButtonVariantClass, generateElementAlignmentClass } from 'experience/styling';
export default class CommonActionLink extends LightningElement {
  static renderMode = 'light';
  @api
  disabled = false;
  @api
  href;
  @api
  assistiveText;
  @api
  variant;
  @api
  size;
  @api
  width;
  anchorElement;
  @api
  alignment;
  renderedCallback() {
    this.anchorElement = this.refs.anchorElement;
  }
  @api
  focus() {
    this.anchorElement?.focus();
  }
  get anchorClasses() {
    return ['slds-button', generateButtonVariantClass(this.variant ?? null), generateButtonSizeClass(this.size ?? null), generateButtonStretchClass(this.width ?? null), generateElementAlignmentClass(this.alignment ?? null)].filter(Boolean).join(' ').trim();
  }
  handleClick(event) {
    if (typeof this.href !== 'string' || this.href.trim().length === 0) {
      event.preventDefault();
    }
  }
}