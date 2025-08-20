import { LightningElement, api } from 'lwc';
import { closeButtonText, quantityHelpLabel } from './labels';
function isNotBlank(text) {
  return typeof text === 'string' && text.trim().length > 0;
}
export default class CommonQuantitySelectorPopover extends LightningElement {
  static renderMode = 'light';
  @api
  minimumText;
  @api
  maximumText;
  @api
  incrementText;
  openPopup() {
    this.popup?.open({
      alignment: 'top',
      autoFlip: true,
      size: 'small'
    });
  }
  closePopup() {
    this.popup?.close();
  }
  get popup() {
    if (!import.meta.env.SSR) {
      return this.refs?.popupSource;
    }
    return null;
  }
  get showIncrementText() {
    return isNotBlank(this.incrementText);
  }
  get showMaxText() {
    return isNotBlank(this.maximumText);
  }
  get showMinText() {
    return isNotBlank(this.minimumText);
  }
  get i18n() {
    return {
      closeButtonText,
      quantityHelpLabel
    };
  }
}