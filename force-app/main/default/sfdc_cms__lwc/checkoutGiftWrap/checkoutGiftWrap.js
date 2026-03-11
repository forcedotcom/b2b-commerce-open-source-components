import { LightningElement, api } from 'lwc';
export default class CheckoutGiftWrap extends LightningElement {
  static renderMode = 'light';
  _labels;
  @api
  set labels(value) {
    this._labels = value;
  }
  get labels() {
    return this._labels;
  }
  _isChecked = false;
  @api
  set giftWrapState(state) {
    this._isChecked = Boolean(state);
  }
  get giftWrapState() {
    return this._isChecked;
  }
  handleCheckboxChange(event) {
    this._isChecked = event.target.checked;
    this.dispatchEvent(new CustomEvent('giftwrapchange', {
      detail: this._isChecked
    }));
  }
}