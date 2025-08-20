import { api, LightningElement } from 'lwc';
import { generateStyleProperties } from 'experience/styling';
import { Labels } from './labels';
export default class ProductVariantSwatchitem extends LightningElement {
  static renderMode = 'light';
  @api
  label;
  @api
  hexColorValue;
  @api
  value;
  @api
  assistiveOutOfStockText;
  @api
  selected = false;
  @api
  isOutOfStock = false;
  @api
  enableHorizontalScrolling = false;
  get assistiveOutOfStockTextValue() {
    return this.assistiveOutOfStockText || Labels.defaultAssistiveOutOfStockText;
  }
  get swatchBorderStyles() {
    return 'square-section' + (this.selected ? ' selected' : '') + (this.isOutOfStock ? ' out-of-stock' : '');
  }
  get hasHexColorValue() {
    return !!this.hexColorValue;
  }
  get colorSwatchStyles() {
    return generateStyleProperties({
      'background-color': this.isOutOfStock ? this.hexColorValue + '80' : this.hexColorValue
    });
  }
  handleClick() {
    if (!this.selected) {
      this.dispatchEvent(new CustomEvent('swatchclick', {
        detail: this.value
      }));
    }
  }
  handleKeyDown(event) {
    if (event.key === 'Enter' || event.key === ' ') {
      this.handleClick();
    }
  }
}