import { LightningElement, api } from 'lwc';
import { generateButtonVariantClass, generateButtonSizeClass } from 'experience/styling';
export default class CommonActionButtons extends LightningElement {
  static renderMode = 'light';
  @api
  firstActionButtonText;
  @api
  secondActionButtonText;
  @api
  firstButtonVariant;
  @api
  secondButtonVariant;
  @api
  size;
  @api
  buttonSpacing;
  @api
  alignment;
  get firstButtonCustomClasses() {
    return ['slds-button', 'action_truncate', generateButtonVariantClass(this.firstButtonVariant ?? null), generateButtonSizeClass(this.size ?? null)].filter(Boolean).join(' ').trim();
  }
  get secondButtonCustomClasses() {
    return ['slds-button', 'action_truncate', generateButtonVariantClass(this.secondButtonVariant ?? null), generateButtonSizeClass(this.size ?? null)].filter(Boolean).join(' ').trim();
  }
  get actionButtonContainerClass() {
    return ['action-buttons', ...(this.alignment ? [`action-buttons_${this.alignment}`] : []), ...(this.buttonSpacing ? [`action-buttons_${this.buttonSpacing}`] : [])].join(' ');
  }
  handleFirstActionButtonClick() {
    this.dispatchEvent(new CustomEvent('firstaction', {
      bubbles: true,
      cancelable: true,
      composed: true
    }));
  }
  handleSecondActionButtonClick() {
    this.dispatchEvent(new CustomEvent('secondaction', {
      bubbles: true,
      cancelable: true,
      composed: true
    }));
  }
}