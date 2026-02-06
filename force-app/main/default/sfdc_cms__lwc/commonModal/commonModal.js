import { api } from 'lwc';
import LightningModal from 'lightning/modal';
export default class CommonModal extends LightningModal {
  @api
  label;
  @api
  message;
  @api
  primaryActionLabel;
  @api
  secondaryActionLabel;
  get hasPrimaryAction() {
    return Boolean(this.primaryActionLabel);
  }
  get hasSecondaryAction() {
    return Boolean(this.secondaryActionLabel);
  }
  get hasMessageText() {
    return typeof this.message === 'string' && this.message.trim().length > 0;
  }
  handlePrimaryAction() {
    this.handleAction('primary');
  }
  handleSecondaryAction() {
    this.handleAction('secondary');
  }
  handleAction(eventType) {
    const event = new CustomEvent(`${eventType}actionclick`, {
      cancelable: true,
      detail: {
        close: result => {
          event.preventDefault();
          this.close(result);
        }
      }
    });
    this.dispatchEvent(event);
    if (!event.defaultPrevented) {
      this.close(eventType);
    }
  }
}