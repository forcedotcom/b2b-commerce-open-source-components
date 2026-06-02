import { LightningElement, api } from 'lwc';
export default class CheckoutDualPayRow extends LightningElement {
  static renderMode = 'light';
  _multiPaymentRadioValue;
  get multiPaymentRadioOptions() {
    return [{
      label: this.sectionLabel,
      value: this.sectionName
    }];
  }
  @api
  isExpanded = false;
  @api
  sectionName;
  @api
  sectionLabel;
  get multiPaymentRadioValue() {
    return this.isExpanded ? this._multiPaymentRadioValue = this.sectionName : '';
  }
  handleSelectSection() {
    this.dispatchEvent(new CustomEvent('sectionselected', {
      bubbles: true,
      composed: false,
      detail: {
        name: this.sectionName
      }
    }));
  }
}