import { api, LightningElement } from 'lwc';
import { Labels } from './labels';
export default class ProductVariantPill extends LightningElement {
  static renderMode = 'light';
  @api
  optionId = null;
  @api
  optionName = null;
  @api
  isOutOfStock = false;
  @api
  selected = false;
  @api
  assistiveOutOfStockText;
  get assistiveOutOfStockTextValue() {
    return this.assistiveOutOfStockText || Labels.defaultAssistiveOutOfStockText;
  }
  get pillClass() {
    return 'pill slds-p-around_x-small' + (this.selected ? ' selected' : '') + (this.isOutOfStock ? ' out-of-stock' : '');
  }
  handleClick() {
    if (!this.selected) {
      this.dispatchEvent(new CustomEvent('pillclick', {
        detail: this.optionId
      }));
    }
  }
  handleKeyDown(event) {
    if (event.key === 'Enter' || event.key === ' ') {
      this.handleClick();
    }
  }
}