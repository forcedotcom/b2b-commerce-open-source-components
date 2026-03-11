import { LightningElement, api } from 'lwc';
export default class LegalConsentOptions extends LightningElement {
  static renderMode = 'light';
  @api
  consentItems = [];
  get hasConsentItems() {
    return Array.isArray(this.consentItems) && this.consentItems.length > 0;
  }
  handleOnChange(event) {
    const target = event.target;
    this.dispatchEvent(new CustomEvent('consentchange', {
      detail: {
        id: target.id,
        value: target.checked
      },
      bubbles: true,
      composed: true
    }));
  }
}