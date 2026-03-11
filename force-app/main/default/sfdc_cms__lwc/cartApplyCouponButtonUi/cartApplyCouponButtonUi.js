import { LightningElement, api } from 'lwc';
export default class CartApplyCouponButtonUi extends LightningElement {
  static renderMode = 'light';
  @api
  alignment;
  @api
  variant;
  @api
  size;
  @api
  width;
  @api
  disabled = false;
  @api
  text;
  @api
  assistiveButtonText;
  button;
  renderedCallback() {
    this.button = this.refs.button;
  }
  @api
  focus() {
    this.button?.focus();
  }
}